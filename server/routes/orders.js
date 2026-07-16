import { Router } from "express";
import { query, withTransaction, HttpError } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

const ORDER_COLUMNS = `
  o.id, o.type, o.status, o.payment_status, o.payment_method,
  o.total, o.tip, o.notes, o.cancel_reason, o.created_at, o.closed_at,
  o.estimate_minutes,
  o.table_id, o.customer_id, o.user_id, o.delivery_person_id,
  t.number AS table_number, t.label AS table_label,
  c.name AS customer_name, c.phone AS customer_phone, c.address AS customer_address,
  c.neighborhood AS customer_neighborhood, c.reference AS customer_reference,
  u.name AS user_name,
  d.name AS delivery_name, d.phone AS delivery_phone
`;

/**
 * Descuenta stock una sola vez por pedido (flag stock_deducted).
 * Registra movimientos tipo exit para el historial de inventario.
 * Idempotente: si ya se descontó, no-op.
 */
async function deductStockForOrder(client, orderId) {
  const { rows: ord } = await client.query(
    "SELECT stock_deducted FROM orders WHERE id = $1 FOR UPDATE",
    [orderId]
  );
  if (ord.length === 0) throw new HttpError(404, "No existe");
  if (ord[0].stock_deducted) return false;

  const { rows: items } = await client.query(
    "SELECT product_id, quantity FROM order_items WHERE order_id = $1 AND product_id IS NOT NULL",
    [orderId]
  );
  for (const item of items) {
    await client.query(
      "UPDATE products SET stock = GREATEST(stock - $2, 0) WHERE id = $1",
      [item.product_id, item.quantity]
    );
    await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reason)
       VALUES ($1, 'exit', $2, $3)`,
      [item.product_id, item.quantity, `Pedido #${orderId}`]
    );
  }
  await client.query(
    "UPDATE orders SET stock_deducted = TRUE WHERE id = $1",
    [orderId]
  );
  return true;
}

/**
 * Restaura stock solo si antes se descontó (flag stock_deducted).
 * Idempotente: si no estaba descontado, no-op.
 */
async function restoreStockForOrder(client, orderId) {
  const { rows: ord } = await client.query(
    "SELECT stock_deducted FROM orders WHERE id = $1 FOR UPDATE",
    [orderId]
  );
  if (ord.length === 0) throw new HttpError(404, "No existe");
  if (!ord[0].stock_deducted) return false;

  const { rows: items } = await client.query(
    "SELECT product_id, quantity FROM order_items WHERE order_id = $1 AND product_id IS NOT NULL",
    [orderId]
  );
  for (const item of items) {
    await client.query(
      "UPDATE products SET stock = stock + $2 WHERE id = $1",
      [item.product_id, item.quantity]
    );
    await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reason)
       VALUES ($1, 'entry', $2, $3)`,
      [item.product_id, item.quantity, `Reapertura pedido #${orderId}`]
    );
  }
  await client.query(
    "UPDATE orders SET stock_deducted = FALSE WHERE id = $1",
    [orderId]
  );
  return true;
}

async function recomputeOrderTotal(client, orderId) {
  const { rows } = await client.query(
    `SELECT COALESCE(SUM(quantity * unit_price), 0)::numeric AS total
       FROM order_items WHERE order_id = $1`,
    [orderId]
  );
  const total = rows[0].total;
  await client.query("UPDATE orders SET total = $2 WHERE id = $1", [orderId, total]);
  return total;
}

router.get("/", authRequired, async (req, res) => {
  const { type, status, payment, from, to, collectible } = req.query;
  const filters = [];
  const params = [];
  if (type)    { params.push(type);    filters.push(`o.type = $${params.length}`); }
  if (status)  { params.push(status);  filters.push(`o.status = $${params.length}`); }
  if (payment) { params.push(payment); filters.push(`o.payment_status = $${params.length}`); }
  if (from)    { params.push(from);    filters.push(`o.created_at >= $${params.length}`); }
  if (to)      { params.push(to);      filters.push(`o.created_at <= $${params.length}`); }
  // Caja "Por cobrar": todas las cuentas abiertas sin pagar (no solo ready_to_pay)
  if (collectible === "1" || collectible === "true") {
    filters.push(`o.payment_status = 'pending'`);
    filters.push(`o.status NOT IN ('paid','cancelled','delivered')`);
  }
  const where = filters.length ? "WHERE " + filters.join(" AND ") : "";

  const { rows } = await query(
    `SELECT ${ORDER_COLUMNS}
       FROM orders o
       LEFT JOIN tables t  ON t.id = o.table_id
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u     ON u.id = o.user_id
       LEFT JOIN delivery_persons d ON d.id = o.delivery_person_id
       ${where}
      ORDER BY
        CASE o.status
          WHEN 'ready_to_pay' THEN 0
          WHEN 'preparing'    THEN 1
          WHEN 'pending'      THEN 2
          WHEN 'on_the_way'   THEN 3
          ELSE 4
        END,
        o.created_at ASC
      LIMIT 200`,
    params
  );
  res.json(rows);
});

router.get("/:id", authRequired, async (req, res) => {
  const { rows } = await query(
    `SELECT ${ORDER_COLUMNS}
       FROM orders o
       LEFT JOIN tables t  ON t.id = o.table_id
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u     ON u.id = o.user_id
       LEFT JOIN delivery_persons d ON d.id = o.delivery_person_id
      WHERE o.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
  // Consolidar líneas duplicadas del mismo producto (muestra 2x en vez de 1x + 1x)
  const items = await fetchConsolidatedItems(query, req.params.id);
  res.json({ ...rows[0], items });
});

router.post("/", authRequired, async (req, res) => {
  const {
    type, table_id = null, customer_id = null,
    notes = null, estimate_minutes = null, items = [],
  } = req.body;

  if (!["table", "delivery", "pickup"].includes(type))
    return res.status(400).json({ error: "Tipo inválido" });
  if (type === "table" && !table_id)
    return res.status(400).json({ error: "Mesa requerida" });
  if (type === "delivery" && !customer_id)
    return res.status(400).json({ error: "Cliente requerido" });
  if (req.user.role === "waiter" && type !== "table")
    return res.status(403).json({ error: "Los meseros solo pueden crear pedidos de mesa" });
  if (req.user.role === "admin" && type === "table")
    return res.status(403).json({
      error: "Solo el mesero abre mesas. El cajero cobra desde Caja.",
    });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "El pedido debe tener al menos un producto" });

  try {
    const result = await withTransaction(async (client) => {
      if (type === "table") {
        const { rows: occ } = await client.query(
          `SELECT id FROM orders WHERE table_id = $1 AND status NOT IN ('paid','cancelled','delivered') LIMIT 1`,
          [table_id]
        );
        if (occ.length > 0) throw new HttpError(409, "La mesa ya está ocupada");
        if (req.user.role === "waiter") {
          const { rows: own } = await client.query(
            "SELECT 1 FROM waiter_tables WHERE user_id = $1 AND table_id = $2 LIMIT 1",
            [req.user.id, table_id]
          );
          if (own.length === 0) throw new HttpError(403, "Esta mesa no está asignada a ti");
        }
      }

      const { rows: order } = await client.query(
        `INSERT INTO orders (type, table_id, customer_id, user_id, status, notes, estimate_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [type, table_id, customer_id, req.user.id, "pending", notes, estimate_minutes || null]
      );
      const orderId = order[0].id;

      for (const it of items) {
        const { rows: p } = await client.query(
          "SELECT id, name, price FROM products WHERE id = $1",
          [it.product_id]
        );
        if (p.length === 0) throw new HttpError(400, `Producto ${it.product_id} no existe`);
        await upsertOrderItemLine(client, orderId, p[0], it.quantity || 1, it.notes || null);
      }

      const total = await recomputeOrderTotal(client, orderId);
      return { id: orderId, total };
    });
    res.status(201).json(result);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

/** Líneas del pedido consolidadas (misma clave = 1 fila con cantidad sumada). */
async function fetchConsolidatedItems(clientOrQuery, orderId) {
  const run = clientOrQuery.query ? clientOrQuery.query.bind(clientOrQuery) : clientOrQuery;
  const { rows } = await run(
    `SELECT MIN(id) AS id,
            product_id,
            name_snapshot,
            unit_price,
            SUM(quantity)::int AS quantity,
            NULLIF(MAX(COALESCE(notes, '')), '') AS notes,
            MIN(status) AS status
       FROM order_items
      WHERE order_id = $1
      GROUP BY product_id, name_snapshot, unit_price, COALESCE(notes, '')
      ORDER BY MIN(id)`,
    [orderId]
  );
  return rows;
}

/**
 * Suma cantidad si ya existe la misma línea (mismo producto + misma nota);
 * si no, inserta. Bloquea el pedido (FOR UPDATE) para clics concurrentes.
 * Usa notes_key generado en DB + UNIQUE para que sea imposible 1x+1x.
 */
async function upsertOrderItemLine(client, orderId, product, qty, note) {
  const q = Number(qty) || 1;
  const n = note == null || note === "" ? null : String(note);
  const noteKey = n || "";
  // Serializa clics concurrentes sobre el mismo pedido
  await client.query(`SELECT id FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);

  // Intento atómico: si hay índice único, ON CONFLICT suma
  try {
    const { rows: ins } = await client.query(
      `INSERT INTO order_items (order_id, product_id, name_snapshot, unit_price, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (order_id, product_id, notes_key) WHERE (product_id IS NOT NULL)
       DO UPDATE SET quantity = order_items.quantity + EXCLUDED.quantity
       RETURNING id, quantity`,
      [orderId, product.id, product.name, product.price, q, n]
    );
    return ins[0].id;
  } catch (e) {
    // Si aún no existe la columna/índice notes_key, fallback SELECT+UPDATE
    if (e && (e.code === "42703" || e.code === "42P10" || e.code === "42P01")) {
      const { rows: ex } = await client.query(
        `SELECT id FROM order_items
          WHERE order_id = $1
            AND product_id = $2
            AND COALESCE(notes, '') = $3
          ORDER BY id
          LIMIT 1
          FOR UPDATE`,
        [orderId, product.id, noteKey]
      );
      if (ex.length > 0) {
        await client.query(
          `UPDATE order_items SET quantity = quantity + $2 WHERE id = $1`,
          [ex[0].id, q]
        );
        return ex[0].id;
      }
      const { rows: ins } = await client.query(
        `INSERT INTO order_items (order_id, product_id, name_snapshot, unit_price, quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [orderId, product.id, product.name, product.price, q, n]
      );
      return ins[0].id;
    }
    throw e;
  }
}

router.post("/:id/items", authRequired, async (req, res) => {
  const { product_id, quantity = 1, notes = null } = req.body;
  try {
    const result = await withTransaction(async (client) => {
      const { rows: p } = await client.query(
        "SELECT id, name, price FROM products WHERE id = $1",
        [product_id]
      );
      if (p.length === 0) throw new HttpError(400, "Producto no existe");
      const orderId = Number(req.params.id);
      await upsertOrderItemLine(client, orderId, p[0], quantity, notes);
      const total = await recomputeOrderTotal(client, orderId);
      const items = await fetchConsolidatedItems(client, orderId);
      return { total, items };
    });
    res.status(201).json({ ok: true, ...result });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /:id/items]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Quitar 1 unidad; si queda 0, elimina la línea
router.delete("/:id/items/:itemId", authRequired, async (req, res) => {
  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT id, quantity FROM order_items WHERE id = $1 AND order_id = $2 FOR UPDATE`,
        [req.params.itemId, req.params.id]
      );
      if (rows.length === 0) throw new HttpError(404, "Ítem no encontrado");
      if (Number(rows[0].quantity) > 1) {
        await client.query(
          `UPDATE order_items SET quantity = quantity - 1 WHERE id = $1`,
          [rows[0].id]
        );
      } else {
        await client.query("DELETE FROM order_items WHERE id = $1 AND order_id = $2", [
          req.params.itemId,
          req.params.id,
        ]);
      }
      await recomputeOrderTotal(client, req.params.id);
    });
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:DELETE /:id/items]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Asignar repartidor (admin)
router.post("/:id/assign-delivery", authRequired, requireRole("admin"), async (req, res) => {
  const { delivery_person_id } = req.body;
  if (!delivery_person_id) return res.status(400).json({ error: "Repartidor requerido" });

  try {
    await withTransaction(async (client) => {
      const { rows: dp } = await client.query(
        "SELECT id, status FROM delivery_persons WHERE id = $1 FOR UPDATE",
        [delivery_person_id]
      );
      if (dp.length === 0) throw new HttpError(404, "Repartidor no existe");
      if (dp[0].status !== "available") throw new HttpError(409, "Repartidor no disponible");

      const { rows: o } = await client.query(
        "SELECT status FROM orders WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (o.length === 0) throw new HttpError(404, "Pedido no existe");
      if (!["pending", "preparing"].includes(o[0].status)) {
        throw new HttpError(409, `El pedido no se puede asignar en su estado actual (${o[0].status})`);
      }

      await client.query(
        `UPDATE orders SET delivery_person_id = $2, status = 'on_the_way' WHERE id = $1`,
        [req.params.id, delivery_person_id]
      );
      await client.query(
        `UPDATE delivery_persons SET status = 'busy' WHERE id = $1`,
        [delivery_person_id]
      );
    });
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /:id/assign-delivery]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Cambiar estado:
// - admin: todos los estados
// - mesero: solo pedidos de mesa asignada → pending | preparing | ready_to_pay
router.post("/:id/status", authRequired, async (req, res) => {
  const { status, cancel_reason = null } = req.body;
  const valid = ["pending", "preparing", "on_the_way", "delivered", "ready_to_pay", "cancelled"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Estado inválido" });

  const role = req.user.role;
  const isAdmin = role === "admin";
  const isWaiter = role === "waiter";

  if (!isAdmin && !isWaiter) {
    return res.status(403).json({ error: "Sin permisos" });
  }

  // Mesero: flujo de mesa (cocina / listo para cobrar), no cobro ni domicilio
  if (isWaiter) {
    const waiterOk = ["pending", "preparing", "ready_to_pay"];
    if (!waiterOk.includes(status)) {
      return res.status(403).json({
        error: "El mesero solo puede enviar a cocina o marcar listo para cobrar",
      });
    }
  }

  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        "SELECT delivery_person_id, type, status, payment_status, table_id FROM orders WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (rows.length === 0) throw new HttpError(404, "No existe");
      const o = rows[0];

      if (isWaiter) {
        if (o.type !== "table") {
          throw new HttpError(403, "Los meseros solo gestionan pedidos de mesa");
        }
        if (!o.table_id) throw new HttpError(403, "Pedido sin mesa");
        const { rows: own } = await client.query(
          "SELECT 1 FROM waiter_tables WHERE user_id = $1 AND table_id = $2 LIMIT 1",
          [req.user.id, o.table_id]
        );
        if (own.length === 0) {
          throw new HttpError(403, "Esta mesa no está asignada a ti");
        }
      }

      if (o.status === "cancelled") throw new HttpError(409, "El pedido está cancelado");
      if (status === "cancelled" && o.payment_status === "paid") {
        throw new HttpError(409, "No se puede cancelar un pedido ya cobrado");
      }
      if (status === "cancelled" && o.delivery_person_id) {
        await client.query(
          "UPDATE delivery_persons SET status = 'available' WHERE id = $1",
          [o.delivery_person_id]
        );
      }
      if (status === "delivered") {
        await deductStockForOrder(client, req.params.id);
      }
      await client.query(
        `UPDATE orders
            SET status = $2,
                cancel_reason = COALESCE($3, cancel_reason)
          WHERE id = $1`,
        [req.params.id, status, cancel_reason]
      );
    });
    res.json({ ok: true });
  } catch (e) {
    const statusCode = e.status || 500;
    if (statusCode === 500) console.error(`[orders:POST /:id/status]`, e);
    res.status(statusCode).json({ error: e.message || "Error interno" });
  }
});

// Cerrar / cobrar pedido (admin)
router.post("/:id/close", authRequired, requireRole("admin"), async (req, res) => {
  const { payment_method = "cash", tip = 0 } = req.body;
  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        "SELECT delivery_person_id, status, payment_status FROM orders WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (rows.length === 0) throw new HttpError(404, "No existe");
      const o = rows[0];
      if (o.status === "cancelled") throw new HttpError(409, "El pedido está cancelado");
      if (o.payment_status === "paid") throw new HttpError(409, "El pedido ya está cobrado");
      if (o.delivery_person_id) {
        await client.query(
          "UPDATE delivery_persons SET status = 'available' WHERE id = $1",
          [o.delivery_person_id]
        );
      }
      await deductStockForOrder(client, req.params.id);

      await client.query(
        `UPDATE orders
            SET status = 'delivered',
                payment_status = 'paid',
                payment_method = $2,
                tip = COALESCE($3, 0),
                closed_at = NOW()
          WHERE id = $1`,
        [req.params.id, payment_method, tip]
      );
    });
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /:id/close]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Pre-pago por transferencia (solo domicilios en camino)
router.post("/:id/prepay", authRequired, requireRole("admin"), async (req, res) => {
  const { payment_method = "transfer" } = req.body;
  try {
    const { rows } = await query(
      "SELECT id, type, status FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, "No existe");
    if (rows[0].type !== "delivery") throw new HttpError(400, "Solo aplica a pedidos a domicilio");
    await query(
      "UPDATE orders SET payment_status='paid', payment_method=$2 WHERE id=$1",
      [req.params.id, payment_method]
    );
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /:id/prepay]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Marcar como entregado sin cobrar (deuda)
router.post("/:id/mark-delivered", authRequired, requireRole("admin"), async (req, res) => {
  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        "SELECT delivery_person_id, status, payment_status FROM orders WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (rows.length === 0) throw new HttpError(404, "No existe");
      const o = rows[0];
      if (o.status === "cancelled") throw new HttpError(409, "El pedido está cancelado");
      if (o.payment_status === "paid") throw new HttpError(409, "El pedido ya está cobrado");
      if (o.payment_status === "debt" && o.status === "delivered") {
        throw new HttpError(409, "El pedido ya está marcado como deuda");
      }
      if (o.delivery_person_id) {
        await client.query(
          "UPDATE delivery_persons SET status = 'available' WHERE id = $1",
          [o.delivery_person_id]
        );
      }
      await deductStockForOrder(client, req.params.id);
      await client.query(
        `UPDATE orders
            SET status = 'delivered',
                payment_status = 'debt',
                closed_at = NOW()
          WHERE id = $1`,
        [req.params.id]
      );
    });
    res.json({ ok: true, debt: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error("[orders:POST /:id/mark-delivered]", e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Cobrar deuda pendiente
router.post("/:id/pay-debt", authRequired, requireRole("admin"), async (req, res) => {
  const { payment_method = "cash" } = req.body;
  try {
    const { rows } = await query(
      "SELECT id, payment_status FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "No existe" });
    if (rows[0].payment_status !== "debt")
      return res.status(409).json({ error: "El pedido no tiene deuda pendiente" });
    await query(
      `UPDATE orders SET payment_status = 'paid', payment_method = $2 WHERE id = $1`,
      [req.params.id, payment_method]
    );
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error("[orders:POST /:id/pay-debt]", e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// Reabrir pedido cerrado por error (admin)
router.post("/:id/reopen", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const newStatus = await withTransaction(async (client) => {
      const { rows } = await client.query(
        "SELECT type, status, delivery_person_id, stock_deducted FROM orders WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (rows.length === 0) throw new HttpError(404, "No existe");
      const o = rows[0];
      if (o.status !== "delivered") throw new HttpError(409, "Solo se pueden reabrir pedidos entregados");

      let next;
      if (o.type === "delivery" && o.delivery_person_id) {
        next = "on_the_way";
        await client.query(
          "UPDATE delivery_persons SET status = 'busy' WHERE id = $1",
          [o.delivery_person_id]
        );
      } else if (o.type === "table") {
        next = "ready_to_pay";
      } else {
        next = "preparing";
      }

      await restoreStockForOrder(client, req.params.id);

      await client.query(
        `UPDATE orders
            SET status = $2,
                payment_status = 'pending',
                payment_method = NULL,
                tip = 0,
                closed_at = NULL
          WHERE id = $1`,
        [req.params.id, next]
      );
      return next;
    });
    res.json({ ok: true, status: newStatus });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[orders:POST /:id/reopen]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

router.get("/table-history/:table_id", authRequired, async (req, res) => {
  const { rows } = await query(
    `SELECT o.id, o.status, o.total, o.created_at, o.closed_at, u.name AS user_name
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.table_id = $1 AND o.type = 'table'
     ORDER BY o.created_at DESC LIMIT 20`,
    [req.params.table_id]
  );
  res.json(rows);
});

export default router;
