import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

/** Zona horaria del negocio (misma que DB_TZ / caja). */
function reportTz() {
  const tz = process.env.DB_TZ || "America/Mexico_City";
  if (!/^[\w/]+$/.test(tz)) throw new Error(`Timezone inválido: ${tz}`);
  return tz;
}

/**
 * Día contable del pedido en zona local:
 * usa closed_at (cobro) y, si no hay, created_at.
 */
function orderDaySql(alias = "o") {
  const tz = reportTz();
  const p = alias ? `${alias}.` : "";
  return `DATE(COALESCE(${p}closed_at, ${p}created_at) AT TIME ZONE '${tz}')`;
}

function orderHourSql(alias = "o") {
  const tz = reportTz();
  const p = alias ? `${alias}.` : "";
  return `EXTRACT(HOUR FROM COALESCE(${p}closed_at, ${p}created_at) AT TIME ZONE '${tz}')::int`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Días trabajados del mesero autenticado (self-scope). */
router.get("/my-work-days", async (req, res) => {
  if (req.user.role !== "waiter" && req.user.role !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  // Mesero solo ve lo suyo; admin puede pasar user_id (opcional)
  let userId = req.user.id;
  if (req.user.role === "admin" && req.query.user_id) {
    userId = Number(req.query.user_id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: "user_id inválido" });
  } else if (req.user.role === "admin" && !req.query.user_id) {
    return res.status(400).json({ error: "user_id requerido para admin" });
  }

  const toDate = (req.query.to && DATE_RE.test(req.query.to))
    ? req.query.to
    : new Date().toISOString().slice(0, 10);
  const fromDate = (req.query.from && DATE_RE.test(req.query.from))
    ? req.query.from
    : new Date(new Date(toDate).getTime() - 89 * 86400000).toISOString().slice(0, 10);

  const day = orderDaySql("o");
  const { rows } = await query(
    `SELECT TO_CHAR(${day}, 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS orders_count,
            COUNT(*) FILTER (WHERE o.payment_status = 'paid')::int AS paid_count,
            COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = 'paid'), 0)::numeric AS total_sales,
            COALESCE(SUM(o.tip) FILTER (WHERE o.payment_status = 'paid'), 0)::numeric AS total_tips,
            COUNT(DISTINCT o.table_id) FILTER (WHERE o.table_id IS NOT NULL)::int AS tables_served,
            COALESCE(
              AVG(o.total) FILTER (WHERE o.payment_status = 'paid'),
              0
            )::numeric AS avg_ticket
       FROM orders o
      WHERE o.user_id = $1
        AND ${day} BETWEEN $2::date AND $3::date
        AND o.status <> 'cancelled'
      GROUP BY ${day}
      ORDER BY ${day} DESC`,
    [userId, fromDate, toDate]
  );
  res.json(rows);
});

/** Detalle de un día trabajado (pedidos + items del mesero). */
router.get("/my-work-days/:date", async (req, res) => {
  if (req.user.role !== "waiter" && req.user.role !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const date = req.params.date;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "date debe ser YYYY-MM-DD" });

  let userId = req.user.id;
  if (req.user.role === "admin" && req.query.user_id) {
    userId = Number(req.query.user_id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: "user_id inválido" });
  } else if (req.user.role === "admin" && !req.query.user_id) {
    return res.status(400).json({ error: "user_id requerido para admin" });
  }

  const day = orderDaySql("o");
  const orders = await query(
    `SELECT o.id, o.type, o.status, o.total, o.tip, o.payment_method,
            o.payment_status, o.created_at, o.closed_at,
            t.number AS table_number, t.label AS table_label,
            c.name AS customer_name, c.phone AS customer_phone
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.user_id = $1
        AND ${day} = $2::date
        AND o.status <> 'cancelled'
      ORDER BY o.created_at DESC`,
    [userId, date]
  );

  const orderIds = orders.rows.map((o) => o.id);
  let itemsByOrder = {};
  if (orderIds.length > 0) {
    const items = await query(
      `SELECT oi.order_id, oi.name_snapshot, oi.unit_price, oi.quantity, oi.notes
         FROM order_items oi
        WHERE oi.order_id = ANY($1::int[])
        ORDER BY oi.order_id, oi.id`,
      [orderIds]
    );
    items.rows.forEach((item) => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });
  }

  const paid = orders.rows.filter((o) => o.payment_status === "paid");
  const total_sales = paid.reduce((s, o) => s + Number(o.total), 0);
  const total_tips = paid.reduce((s, o) => s + Number(o.tip || 0), 0);
  const tables = new Set(orders.rows.map((o) => o.table_number).filter((n) => n != null));

  res.json({
    date,
    summary: {
      orders_count: orders.rows.length,
      paid_count: paid.length,
      total_sales,
      total_tips,
      tables_served: tables.size,
      avg_ticket: paid.length ? total_sales / paid.length : 0,
    },
    orders: orders.rows.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    })),
  });
});

// ── Admin-only reports below ──────────────────────────────────────────
router.use(requireRole("admin"));

// Resumen de ventas (con comparativa)
router.get("/sales", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos (YYYY-MM-DD)" });

  const day = orderDaySql("");
  const days = (new Date(to) - new Date(from)) / 86400000 + 1;
  const prevFrom = new Date(new Date(from).getTime() - days * 86400000).toISOString().slice(0, 10);
  const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().slice(0, 10);

  const current = await query(
    `SELECT ${day} AS date,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total),0)::numeric AS sales,
            COALESCE(SUM(tip),0)::numeric AS tips,
            COUNT(*) FILTER (WHERE type='delivery')::int AS delivery_orders,
            COUNT(*) FILTER (WHERE type='table')::int    AS table_orders,
            COUNT(*) FILTER (WHERE type='pickup')::int   AS pickup_orders,
            COALESCE(SUM(total) FILTER (WHERE type='delivery'),0)::numeric AS delivery_sales,
            COALESCE(SUM(total) FILTER (WHERE type='table'),0)::numeric    AS table_sales,
            COALESCE(SUM(total) FILTER (WHERE type='pickup'),0)::numeric   AS pickup_sales,
            COALESCE(AVG(total),0)::numeric AS avg_ticket,
            COALESCE(SUM(total) FILTER (WHERE payment_method='cash'),0)::numeric AS cash,
            COALESCE(SUM(total) FILTER (WHERE payment_method='card'),0)::numeric AS card,
            COALESCE(SUM(total) FILTER (WHERE payment_method='transfer'),0)::numeric AS transfer,
            COALESCE(SUM(total) FILTER (WHERE payment_method='mixed'),0)::numeric AS mixed
       FROM orders
      WHERE payment_status='paid'
        AND ${day} BETWEEN $1 AND $2
      GROUP BY ${day}
      ORDER BY date`,
    [from, to]
  );

  const previous = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS sales,
            COUNT(*)::int AS orders,
            COALESCE(SUM(tip),0)::numeric AS tips
       FROM orders
      WHERE payment_status='paid'
        AND ${day} BETWEEN $1 AND $2`,
    [prevFrom, prevTo]
  );

  const deliveryGains = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS total,
            COUNT(*)::int AS count
       FROM orders
      WHERE payment_status='paid'
        AND type='delivery'
        AND ${day} BETWEEN $1 AND $2`,
    [from, to]
  );

  const daysRows = current.rows.map((r) => ({
    date: r.date,
    orders: r.orders,
    sales: r.sales,
    tips: Number(r.tips) || 0,
    delivery_orders: r.delivery_orders,
    table_orders: r.table_orders,
    pickup_orders: r.pickup_orders,
    delivery_sales: Number(r.delivery_sales) || 0,
    table_sales: Number(r.table_sales) || 0,
    pickup_sales: Number(r.pickup_sales) || 0,
    avg_ticket: r.avg_ticket,
    payment_methods: {
      cash: Number(r.cash) || 0,
      card: Number(r.card) || 0,
      transfer: Number(r.transfer) || 0,
      mixed: Number(r.mixed) || 0,
    },
  }));

  const totalSales = daysRows.reduce((s, r) => s + Number(r.sales), 0);
  const totalOrders = daysRows.reduce((s, r) => s + r.orders, 0);
  const totalTips = daysRows.reduce((s, r) => s + r.tips, 0);

  res.json({
    days: daysRows,
    current: {
      sales: totalSales,
      orders: totalOrders,
      tips: totalTips,
      delivery_orders: daysRows.reduce((s, r) => s + r.delivery_orders, 0),
      table_orders: daysRows.reduce((s, r) => s + r.table_orders, 0),
      pickup_orders: daysRows.reduce((s, r) => s + r.pickup_orders, 0),
      delivery_sales: daysRows.reduce((s, r) => s + r.delivery_sales, 0),
      table_sales: daysRows.reduce((s, r) => s + r.table_sales, 0),
      pickup_sales: daysRows.reduce((s, r) => s + r.pickup_sales, 0),
      avg_ticket: totalOrders > 0 ? totalSales / totalOrders : 0,
      payment_methods: {
        cash: daysRows.reduce((s, r) => s + r.payment_methods.cash, 0),
        card: daysRows.reduce((s, r) => s + r.payment_methods.card, 0),
        transfer: daysRows.reduce((s, r) => s + r.payment_methods.transfer, 0),
        mixed: daysRows.reduce((s, r) => s + r.payment_methods.mixed, 0),
      },
    },
    previous: previous.rows[0],
    delivery_gains: deliveryGains.rows[0],
  });
});

// Top productos más vendidos
router.get("/top-products", async (req, res) => {
  const { from, to, limit = 10, by = "qty" } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });

  const day = orderDaySql("o");
  const orderCol = by === "revenue" ? "revenue DESC" : "qty DESC";
  const { rows } = await query(
    `SELECT oi.name_snapshot AS name,
            c.name AS category,
            SUM(oi.quantity)::int AS qty,
            COALESCE(SUM(oi.quantity * oi.unit_price),0)::numeric AS revenue,
            COUNT(DISTINCT oi.order_id)::int AS orders_count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.payment_status='paid'
        AND ${day} BETWEEN $1 AND $2
      GROUP BY oi.name_snapshot, c.name
      ORDER BY ${orderCol}
      LIMIT $3`,
    [from, to, Number(limit)]
  );
  res.json(rows);
});

// Ventas por categoría
router.get("/by-category", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const day = orderDaySql("o");
  const { rows } = await query(
    `SELECT COALESCE(c.name, 'Sin categoría') AS category,
            COALESCE(SUM(oi.quantity * oi.unit_price),0)::numeric AS revenue,
            SUM(oi.quantity)::int AS qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.payment_status='paid'
        AND ${day} BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY revenue DESC`,
    [from, to]
  );
  res.json(rows);
});

// Horarios pico (pedidos agrupados por hora local)
router.get("/peak-hours", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const day = orderDaySql("");
  const hour = orderHourSql("");
  const { rows } = await query(
    `SELECT ${hour} AS hour,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total),0)::numeric AS sales
       FROM orders
      WHERE payment_status='paid'
        AND ${day} BETWEEN $1 AND $2
      GROUP BY hour
      ORDER BY hour`,
    [from, to]
  );
  const all = Array.from({ length: 24 }, (_, h) => {
    const found = rows.find((r) => r.hour === h);
    return { hour: h, orders: found?.orders || 0, sales: Number(found?.sales || 0) };
  });
  res.json(all);
});

// Clientes más frecuentes
router.get("/top-customers", async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const day = orderDaySql("o");
  const { rows } = await query(
    `SELECT c.id, c.name, c.phone, c.neighborhood,
            COUNT(o.id)::int AS orders_count,
            COALESCE(SUM(o.total),0)::numeric AS total_spent,
            MAX(o.created_at) AS last_order
       FROM customers c
       JOIN orders o ON o.customer_id = c.id
      WHERE o.payment_status='paid'
        AND ${day} BETWEEN $1 AND $2
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT $3`,
    [from, to, Number(limit)]
  );
  res.json(rows);
});

// Productos nunca vendidos
router.get("/never-sold", async (_req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.name, p.price, c.name AS category
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE oi.id IS NULL
      ORDER BY p.name`
  );
  res.json(rows);
});

// Reporte diario completo (para PDF)
router.get("/daily-complete", async (req, res) => {
  const { date } = req.query;
  const d = date || new Date().toISOString().slice(0, 10);
  const day = orderDaySql("");
  const dayO = orderDaySql("o");

  const [sales, byCategory, topProducts, expenses, tipData, paymentMethods] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS orders,
              COALESCE(SUM(total),0)::numeric AS total_sales,
              COUNT(*) FILTER (WHERE type='delivery')::int AS delivery_count,
              COUNT(*) FILTER (WHERE type='table')::int AS table_count,
              COUNT(*) FILTER (WHERE type='pickup')::int AS pickup_count,
              COALESCE(AVG(total),0)::numeric AS avg_ticket
         FROM orders
        WHERE payment_status='paid'
          AND ${day} = $1`, [d]
    ),
    query(
      `SELECT COALESCE(c.name, 'Sin categoría') AS category,
              COALESCE(SUM(oi.quantity * oi.unit_price),0)::numeric AS revenue,
              SUM(oi.quantity)::int AS qty
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN products p ON p.id = oi.product_id
         LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.payment_status='paid'
          AND ${dayO} = $1
        GROUP BY c.name
        ORDER BY revenue DESC`, [d]
    ),
    query(
      `SELECT oi.name_snapshot AS name,
              c.name AS category,
              SUM(oi.quantity)::int AS qty,
              COALESCE(SUM(oi.quantity * oi.unit_price),0)::numeric AS revenue,
              COUNT(DISTINCT oi.order_id)::int AS orders_count
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN products p ON p.id = oi.product_id
         LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.payment_status='paid'
          AND ${dayO} = $1
        GROUP BY oi.name_snapshot, c.name
        ORDER BY qty DESC LIMIT 10`, [d]
    ),
    query(
      `SELECT COUNT(*)::int AS count,
              COALESCE(SUM(amount),0)::numeric AS total_expenses
         FROM expenses
        WHERE expense_date = $1`, [d]
    ),
    query(
      `SELECT COUNT(*)::int AS tip_count,
              COALESCE(SUM(tip),0)::numeric AS total_tips
         FROM orders
        WHERE payment_status='paid'
          AND tip > 0
          AND ${day} = $1`, [d]
    ),
    query(
      `SELECT payment_method,
              COUNT(*)::int AS count,
              COALESCE(SUM(total),0)::numeric AS total
         FROM orders
        WHERE payment_status='paid'
          AND ${day} = $1
        GROUP BY payment_method
        ORDER BY total DESC`, [d]
    ),
  ]);

  const s = sales.rows[0];
  res.json({
    date: d,
    summary: {
      orders: s.orders,
      total_sales: s.total_sales,
      total_tips: tipData.rows[0].total_tips,
      net_sales: Number(s.total_sales) + Number(tipData.rows[0].total_tips),
      delivery_count: s.delivery_count,
      table_count: s.table_count,
      pickup_count: s.pickup_count,
      avg_ticket: s.avg_ticket,
    },
    payment_methods: paymentMethods.rows,
    expenses: expenses.rows[0],
    by_category: byCategory.rows,
    top_products: topProducts.rows,
  });
});

// Domicilios entregados por repartidor
router.get("/delivery-by-person", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const day = orderDaySql("o");
  const { rows } = await query(
    `SELECT dp.id, dp.name, dp.phone,
            COUNT(o.id)::int AS deliveries,
            COALESCE(SUM(o.total),0)::numeric AS revenue
       FROM delivery_persons dp
       LEFT JOIN orders o ON o.delivery_person_id = dp.id
                         AND o.payment_status='paid'
                         AND ${day} BETWEEN $1 AND $2
      GROUP BY dp.id
      ORDER BY deliveries DESC`,
    [from, to]
  );
  res.json(rows);
});

// Historial de días
router.get("/daily-history", async (req, res) => {
  const { from, to, limit = 30 } = req.query;
  const toDate = to || new Date().toISOString().slice(0, 10);
  const fromDate = from || new Date(new Date(toDate).getTime() - (Number(limit) - 1) * 86400000).toISOString().slice(0, 10);
  const day = orderDaySql("");

  const { rows } = await query(
    `WITH days AS (
       SELECT d::date AS day
         FROM generate_series($1::date, $2::date, '1 day'::interval) d
     )
     SELECT
       TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
       COALESCE(o.orders, 0)::int AS orders,
       COALESCE(o.total_sales, 0)::numeric AS sales,
       COALESCE(e.total_expenses, 0)::numeric AS expenses,
       COALESCE(o.total_sales, 0) - COALESCE(e.total_expenses, 0) AS net,
       COALESCE(o.table_count, 0)::int AS table_count,
       COALESCE(o.delivery_count, 0)::int AS delivery_count,
       COALESCE(o.pickup_count, 0)::int AS pickup_count
     FROM days
     LEFT JOIN (
       SELECT ${day} AS day,
              COUNT(*)::int AS orders,
              COALESCE(SUM(total), 0)::numeric AS total_sales,
              COUNT(*) FILTER (WHERE type = 'table')::int AS table_count,
              COUNT(*) FILTER (WHERE type = 'delivery')::int AS delivery_count,
              COUNT(*) FILTER (WHERE type = 'pickup')::int AS pickup_count
         FROM orders
        WHERE payment_status = 'paid'
        GROUP BY ${day}
     ) o ON o.day = days.day
     LEFT JOIN (
       SELECT expense_date AS day,
              COALESCE(SUM(amount), 0)::numeric AS total_expenses
         FROM expenses
        GROUP BY expense_date
     ) e ON e.day = days.day
     WHERE COALESCE(o.orders, 0) > 0 OR COALESCE(e.total_expenses, 0) > 0
     ORDER BY days.day DESC`,
    [fromDate, toDate]
  );

  res.json(rows);
});

// Historial de mesero (admin — lista plana de pedidos)
router.get("/waiter-history", async (req, res) => {
  const { user_id, limit = 100 } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id requerido" });
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);

  const orders = await query(
    `SELECT o.id, o.type, o.status, o.total, o.tip, o.payment_method,
            o.payment_status, o.created_at, o.closed_at,
            t.number AS table_number, t.label AS table_label,
            c.name AS customer_name, c.phone AS customer_phone
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2`,
    [user_id, lim]
  );

  const orderIds = orders.rows.map((o) => o.id);
  const itemsByOrder = {};
  if (orderIds.length > 0) {
    const items = await query(
      `SELECT oi.order_id, oi.name_snapshot, oi.unit_price, oi.quantity, oi.notes
         FROM order_items oi
        WHERE oi.order_id = ANY($1::int[])
        ORDER BY oi.order_id, oi.id`,
      [orderIds]
    );
    items.rows.forEach((item) => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });
  }

  const result = orders.rows.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] || [],
  }));

  res.json(result);
});

export default router;
