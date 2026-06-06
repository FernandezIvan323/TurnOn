import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (_req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.name, p.description, p.price, p.available,
            p.category_id, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY c.position NULLS LAST, p.name`
  );
  res.json(rows);
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, description = "", price = 0, category_id = null, available = true } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  const { rows } = await query(
    `INSERT INTO products (name, description, price, category_id, available)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, price, available, category_id`,
    [name, description, price, category_id, available]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { name, description, price, category_id, available } = req.body;
  const { rows } = await query(
    `UPDATE products
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           category_id = $5,
           available = COALESCE($6, available)
     WHERE id = $1
     RETURNING id, name, description, price, available, category_id`,
    [req.params.id, name, description, price, category_id, available]
  );
  res.json(rows[0]);
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  await query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
