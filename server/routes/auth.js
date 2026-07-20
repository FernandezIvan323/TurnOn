import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Por IP + usuario: un mesero con PIN mal no bloquea a todo el local
  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req.ip || "unknown");
    const u = String(req.body?.username || "").trim().toLowerCase() || "-";
    return `${ipKey}:${u}`;
  },
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
});

async function getAssignedTableIds(userId) {
  const { rows } = await query(
    "SELECT table_id FROM waiter_tables WHERE user_id = $1 ORDER BY table_id",
    [userId]
  );
  return rows.map((r) => r.table_id);
}

async function buildUserPayload(row) {
  const assigned_table_ids = row.role === "waiter"
    ? await getAssignedTableIds(row.id)
    : [];
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    active: row.active,
    assigned_table_ids,
  };
}

router.post("/login", loginLimiter, async (req, res) => {
  const username = String(req.body?.username || "").trim().toLowerCase();
  const pin = String(req.body?.pin ?? "").trim();
  if (!username || !pin)
    return res.status(400).json({ error: "Usuario y PIN son requeridos" });
  if (!/^\d{4}$/.test(pin))
    return res.status(400).json({ error: "El PIN debe ser de 4 dígitos" });

  const { rows } = await query(
    "SELECT id, username, name, pin, role, active FROM users WHERE username = $1",
    [username]
  );
  const badCreds =
    "Usuario o PIN incorrecto. Usá el usuario de login (ej. maria), no el nombre completo.";
  if (rows.length === 0) return res.status(401).json({ error: badCreds });
  const user = rows[0];
  if (!user.active)
    return res.status(403).json({ error: "Usuario inactivo" });

  const ok = await bcrypt.compare(pin, user.pin);
  if (!ok) return res.status(401).json({ error: badCreds });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: await buildUserPayload(user),
  });
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query(
      "SELECT id, username, name, role, active FROM users WHERE id = $1",
      [payload.id]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Usuario no existe" });
    res.json({ user: await buildUserPayload(rows[0]) });
  } catch {
    return res.status(401).json({ error: "Token inválido" });
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
  if (!["admin", "waiter"].includes(role))
    return res.status(400).json({ error: "Rol inválido" });
  if (!/^\d{4}$/.test(String(pin)))
    return res.status(400).json({ error: "El PIN debe ser de 4 dígitos" });
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

// Admin: cambiar PIN de cualquier usuario
router.put("/users/:id/pin", authRequired, requireRole("admin"), async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0)
    return res.status(400).json({ error: "ID de usuario inválido" });
  const pin = String(req.body?.pin ?? "").trim();
  if (!/^\d{4}$/.test(pin))
    return res.status(400).json({ error: "El PIN debe ser de 4 dígitos" });
  const hash = await bcrypt.hash(pin, 10);
  const { rows } = await query(
    "UPDATE users SET pin = $2 WHERE id = $1 RETURNING id, username, name, role, active",
    [userId, hash]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
  console.log(`[auth] PIN actualizado user_id=${rows[0].id} username=${rows[0].username}`);
  res.json({ ok: true, user: rows[0] });
});

// Usuario autenticado: cambiar su propio PIN (requiere PIN actual)
router.put("/me/pin", authRequired, async (req, res) => {
  const { current_pin, new_pin } = req.body || {};
  if (!current_pin || !new_pin)
    return res.status(400).json({ error: "PIN actual y nuevo son requeridos" });
  if (!/^\d{4}$/.test(String(new_pin)))
    return res.status(400).json({ error: "El PIN nuevo debe ser de 4 dígitos" });

  const { rows } = await query(
    "SELECT id, pin FROM users WHERE id = $1",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
  const ok = await bcrypt.compare(String(current_pin), rows[0].pin);
  if (!ok) return res.status(401).json({ error: "PIN actual incorrecto" });

  const hash = await bcrypt.hash(String(new_pin), 10);
  await query("UPDATE users SET pin = $2 WHERE id = $1", [req.user.id, hash]);
  res.json({ ok: true });
});

export default router;
