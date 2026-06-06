import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (_req, res) => {
  const { rows } = await query(
    "SELECT id, name, position, active FROM categories ORDER BY position, name"
  );
  res.json(rows);
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, position = 0 } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  const { rows } = await query(
    "INSERT INTO categories (name, position) VALUES ($1, $2) RETURNING id, name, position, active",
    [name, position]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { name, position, active } = req.body;
  const { rows } = await query(
    `UPDATE categories
       SET name = COALESCE($2, name),
           position = COALESCE($3, position),
           active = COALESCE($4, active)
     WHERE id = $1
     RETURNING id, name, position, active`,
    [req.params.id, name, position, active]
  );
  res.json(rows[0]);
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  await query("DELETE FROM categories WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
