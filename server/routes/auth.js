import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, pin } = req.body || {};
  if (!username || !pin)
    return res.status(400).json({ error: "Usuario y PIN son requeridos" });

  const { rows } = await query(
    "SELECT id, username, name, pin, role, active FROM users WHERE username = $1",
    [username]
  );
  if (rows.length === 0)
    return res.status(401).json({ error: "Usuario o PIN incorrecto" });
  const user = rows[0];
  if (!user.active)
    return res.status(403).json({ error: "Usuario inactivo" });

  const ok = await bcrypt.compare(String(pin), user.pin);
  if (!ok) return res.status(401).json({ error: "Usuario o PIN incorrecto" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
  });
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

router.get("/users", authRequired, requireRole("admin"), async (_req, res) => {
  const { rows } = await query(
    "SELECT id, username, name, role, active, created_at FROM users ORDER BY name"
  );
  res.json(rows);
});

router.post("/users", authRequired, requireRole("admin"), async (req, res) => {
  const { username, name, pin, role = "waiter" } = req.body || {};
  if (!username || !name || !pin) return res.status(400).json({ error: "Faltan datos" });
  const hash = await bcrypt.hash(String(pin), 10);
  try {
    const { rows } = await query(
      "INSERT INTO users (username, name, pin, role) VALUES ($1,$2,$3,$4) RETURNING id, username, name, role, active",
      [username.toLowerCase(), name, hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Usuario ya existe" });
    throw e;
  }
});

export default router;
