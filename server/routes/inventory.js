import { Router } from "express";
import { query, withTransaction } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, requireRole("admin"));

router.get("/", async (_req, res) => {
  const { rows } = await query(
    // Stock bajo solo si configuraron mínimo (> 0). Con stock=0 y min=0 (menú sin inventario) no alerta.
    `SELECT p.id, p.name, p.stock, p.min_stock, c.name AS category_name,
       CASE
         WHEN COALESCE(p.min_stock, 0) > 0 AND p.stock <= p.min_stock THEN true
         ELSE false
       END AS low_stock,
       (SELECT MAX(sm.created_at) FROM stock_movements sm WHERE sm.product_id = p.id) AS last_movement_at
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.name`
  );
  res.json(rows);
});

router.put("/:id", async (req, res) => {
  const { stock, min_stock } = req.body;
  if (stock == null && min_stock == null)
    return res.status(400).json({ error: "Nada que actualizar" });
  const sets = [];
  const vals = [req.params.id];
  if (stock != null) { sets.push(`stock = $${vals.length + 1}`); vals.push(stock); }
  if (min_stock != null) { sets.push(`min_stock = $${vals.length + 1}`); vals.push(min_stock); }
  const { rows } = await query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = $1 RETURNING id, name, stock, min_stock`,
    vals
  );
  res.json(rows[0]);
});

router.post("/movement", async (req, res) => {
  const { product_id, type, quantity, reason } = req.body || {};
  if (!product_id || !type || quantity == null)
    return res.status(400).json({ error: "Faltan datos" });
  if (!["entry", "exit", "adjustment"].includes(type))
    return res.status(400).json({ error: "Tipo inválido" });
  const qty = Number(quantity);
  if (qty <= 0) return res.status(400).json({ error: "Cantidad debe ser positiva" });

  const delta = type === "entry" ? qty : type === "exit" ? -qty : 0;
  const { rows: [product] } = await query(
    `UPDATE products SET stock = GREATEST(stock + $2, 0) WHERE id = $1 RETURNING id, name, stock`,
    [product_id, delta]
  );
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  await query(
    `INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES ($1,$2,$3,$4)`,
    [product_id, type, qty, reason || null]
  );

  res.json(product);
});

router.get("/movements", async (req, res) => {
  const { product_id } = req.query;
  const { rows } = await query(
    `SELECT sm.*, p.name AS product_name
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     WHERE ($1::int IS NULL OR sm.product_id = $1)
     ORDER BY sm.created_at DESC LIMIT 200`,
    [product_id || null]
  );
  res.json(rows);
});

// ── Insumos (ingredientes) ─────────────────────────────────────────

router.get("/insumos", async (_req, res) => {
  const { rows } = await query(
    `SELECT i.*,
       CASE WHEN COALESCE(i.min_stock, 0) > 0 AND i.stock <= i.min_stock THEN true ELSE false END AS low_stock
     FROM insumos i
     ORDER BY i.name`
  );
  res.json(rows);
});

router.post("/insumos", async (req, res) => {
  const { name, unit = "unidad", stock = 0, min_stock = 0 } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Nombre requerido" });
  const { rows } = await query(
    `INSERT INTO insumos (name, unit, stock, min_stock) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name.trim(), unit, Number(stock) || 0, Number(min_stock) || 0]
  );
  res.status(201).json(rows[0]);
});

router.put("/insumos/:id", async (req, res) => {
  const { name, unit, min_stock } = req.body || {};
  const sets = []; const vals = [req.params.id];
  if (name != null) { sets.push(`name = $${vals.length + 1}`); vals.push(String(name).trim()); }
  if (unit != null) { sets.push(`unit = $${vals.length + 1}`); vals.push(String(unit)); }
  if (min_stock != null) { sets.push(`min_stock = $${vals.length + 1}`); vals.push(Number(min_stock) || 0); }
  if (sets.length === 0) return res.status(400).json({ error: "Nada que actualizar" });
  const { rows } = await query(
    `UPDATE insumos SET ${sets.join(", ")} WHERE id = $1 RETURNING *`, vals
  );
  if (rows.length === 0) return res.status(404).json({ error: "Insumo no encontrado" });
  res.json(rows[0]);
});

router.delete("/insumos/:id", async (req, res) => {
  const { rows } = await query("DELETE FROM insumos WHERE id = $1 RETURNING id", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Insumo no encontrado" });
  res.json({ ok: true });
});

// Ajuste de stock de un insumo (entrada/salida/ajuste)
router.post("/insumos/:id/ajuste", async (req, res) => {
  const { type, quantity, reason } = req.body || {};
  if (!["entry", "exit", "adjust"].includes(type))
    return res.status(400).json({ error: "type debe ser entry, exit o adjust" });
  const qty = Number(quantity);
  if (!Number.isFinite(qty)) return res.status(400).json({ error: "Cantidad inválida" });

  const { rows } = await query(
    `UPDATE insumos
        SET stock = CASE
          WHEN $2 = 'entry' THEN stock + $3
          WHEN $2 = 'exit'  THEN GREATEST(stock - $3, 0)
          ELSE $3
        END
      WHERE id = $1 RETURNING *`,
    [req.params.id, type, Math.abs(qty)]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Insumo no encontrado" });
  res.json(rows[0]);
});

// ── Recetas (producto ↔ insumos) ───────────────────────────────────

router.get("/recetas/:productId", async (req, res) => {
  const { rows } = await query(
    `SELECT pi.id, pi.product_id, pi.insumo_id, pi.quantity, i.name AS insumo_name, i.unit
     FROM product_insumos pi
     JOIN insumos i ON i.id = pi.insumo_id
     WHERE pi.product_id = $1
     ORDER BY i.name`,
    [req.params.productId]
  );
  res.json(rows);
});

router.put("/recetas/:productId", async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  await withTransaction(async (client) => {
    await client.query("DELETE FROM product_insumos WHERE product_id = $1", [req.params.productId]);
    for (const it of items) {
      if (!it?.insumo_id) continue;
      await client.query(
        `INSERT INTO product_insumos (product_id, insumo_id, quantity)
         VALUES ($1,$2,$3) ON CONFLICT (product_id, insumo_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [req.params.productId, it.insumo_id, Number(it.quantity) || 0]
      );
    }
  });
  res.json({ ok: true });
});

export default router;
