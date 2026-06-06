import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (_req, res) => {
  const { rows } = await query(
    "SELECT id, name, phone, status FROM delivery_persons ORDER BY name"
  );
  res.json(rows);
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, phone = null } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  const { rows } = await query(
    "INSERT INTO delivery_persons (name, phone, status) VALUES ($1,$2,'available') RETURNING *",
    [name, phone]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { name, phone, status } = req.body;
  const { rows } = await query(
    `UPDATE delivery_persons
       SET name = COALESCE($2, name),
           phone = COALESCE($3, phone),
           status = COALESCE($4, status)
     WHERE id = $1
     RETURNING *`,
    [req.params.id, name, phone, status]
  );
  res.json(rows[0]);
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  await query("DELETE FROM delivery_persons WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
