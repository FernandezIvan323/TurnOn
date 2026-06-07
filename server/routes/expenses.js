import { Router } from "express";
import { query, withTransaction, HttpError } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, requireRole("admin"));

function ymd(input) {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

const VALID_METHODS = ["cash", "card", "transfer"];

// GET /api/expenses/categories -> lista categorías activas
router.get("/categories", async (_req, res) => {
  const { rows } = await query(
    "SELECT id, name, icon, active FROM expense_categories WHERE active = TRUE ORDER BY name"
  );
  res.json(rows);
});

// GET /api/expenses -> listado con filtros opcionales
router.get("/", async (req, res) => {
  const { from, to, category_id, payment_method, limit = 200 } = req.query;
  const params = [];
  let where = "WHERE 1=1";
  if (from) {
    const f = ymd(from);
    if (!f) return res.status(400).json({ error: "Fecha 'from' inválida" });
    params.push(f);
    where += ` AND e.expense_date >= $${params.length}`;
  }
  if (to) {
    const t = ymd(to);
    if (!t) return res.status(400).json({ error: "Fecha 'to' inválida" });
    params.push(t);
    where += ` AND e.expense_date <= $${params.length}`;
  }
  if (category_id) {
    params.push(Number(category_id));
    where += ` AND e.category_id = $${params.length}`;
  }
  if (payment_method) {
    if (!VALID_METHODS.includes(payment_method))
      return res.status(400).json({ error: "payment_method inválido" });
    params.push(payment_method);
    where += ` AND e.payment_method = $${params.length}`;
  }
  params.push(Math.min(Number(limit) || 200, 1000));
  const { rows } = await query(
    `SELECT e.id, e.expense_date, e.category_id, e.amount, e.description,
            e.payment_method, e.user_id, e.created_at,
            c.name AS category_name, c.icon AS category_icon,
            u.name AS user_name
       FROM expenses e
       LEFT JOIN expense_categories c ON c.id = e.category_id
       LEFT JOIN users              u ON u.id = e.user_id
       ${where}
       ORDER BY e.expense_date DESC, e.created_at DESC
       LIMIT $${params.length}`,
    params
  );
  res.json(rows);
});

// GET /api/expenses/summary?date=YYYY-MM-DD -> KPIs del día
router.get("/summary", async (req, res) => {
  const date = ymd(req.query.date);
  if (!date) return res.status(400).json({ error: "Fecha requerida (YYYY-MM-DD)" });
  const today = ymd(new Date());

  // 1) Total de gastos del día, por categoría y por método
  const totals = await query(
    `SELECT COALESCE(SUM(amount), 0)::numeric              AS total,
            COUNT(*)::int                                   AS count,
            COALESCE(SUM(amount) FILTER (WHERE payment_method='cash'),0)::numeric     AS cash_total,
            COALESCE(SUM(amount) FILTER (WHERE payment_method='card'),0)::numeric     AS card_total,
            COALESCE(SUM(amount) FILTER (WHERE payment_method='transfer'),0)::numeric AS transfer_total
       FROM expenses
      WHERE expense_date = $1`,
    [date]
  );

  const byCategory = await query(
    `SELECT ec.id, ec.name, ec.icon,
            COUNT(*)::int                       AS count,
            COALESCE(SUM(e.amount),0)::numeric  AS total
       FROM expenses e
       JOIN expense_categories ec ON ec.id = e.category_id
      WHERE e.expense_date = $1
      GROUP BY ec.id, ec.name, ec.icon
      ORDER BY total DESC`,
    [date]
  );

  // 2) Ventas del día (mismo criterio que el corte: por closed_at, solo pagadas)
  const sales = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS total_sales,
            COUNT(*)::int                     AS total_orders
       FROM orders
      WHERE DATE(closed_at AT TIME ZONE 'America/Mexico_City') = $1
        AND payment_status = 'paid'`,
    [date]
  );

  const t = totals.rows[0];
  const s = sales.rows[0];
  const totalExpenses = Number(t.total);
  const totalSales    = Number(s.total_sales);

  res.json({
    date,
    is_today: date === today,
    total_expenses: totalExpenses,
    expense_count:  Number(t.count),
    by_category: byCategory.rows,
    by_method: {
      cash:     Number(t.cash_total),
      card:     Number(t.card_total),
      transfer: Number(t.transfer_total),
    },
    total_sales: totalSales,
    total_orders: Number(s.total_orders),
    net: totalSales - totalExpenses,
  });
});

// POST /api/expenses -> crear
router.post("/", async (req, res) => {
  const date    = ymd(req.body.expense_date);
  const amount  = Number(req.body.amount);
  const catId   = req.body.category_id == null || req.body.category_id === ""
    ? null : Number(req.body.category_id);
  const desc    = (req.body.description || "").toString().trim() || null;
  const method  = req.body.payment_method || null;

  if (!date) return res.status(400).json({ error: "expense_date requerido (YYYY-MM-DD)" });
  if (Number.isNaN(amount) || amount <= 0)
    return res.status(400).json({ error: "amount debe ser > 0" });
  if (method && !VALID_METHODS.includes(method))
    return res.status(400).json({ error: "payment_method inválido" });

  try {
    const newId = await withTransaction(async (client) => {
      if (catId != null) {
        const { rows } = await client.query(
          "SELECT id FROM expense_categories WHERE id = $1 AND active = TRUE",
          [catId]
        );
        if (rows.length === 0) throw new HttpError(400, "Categoría inválida o inactiva");
      }
      const { rows } = await client.query(
        `INSERT INTO expenses (expense_date, category_id, amount, description, payment_method, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [date, catId, amount, desc, method, req.user.id]
      );
      return rows[0].id;
    });
    const detail = await query(
      `SELECT e.id, e.expense_date, e.category_id, e.amount, e.description,
              e.payment_method, e.user_id, e.created_at,
              c.name AS category_name, c.icon AS category_icon,
              u.name AS user_name
         FROM expenses e
         LEFT JOIN expense_categories c ON c.id = e.category_id
         LEFT JOIN users              u ON u.id = e.user_id
        WHERE e.id = $1`,
      [newId]
    );
    res.status(201).json(detail.rows[0]);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[expenses:POST /]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// PUT /api/expenses/:id -> editar
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const date   = ymd(req.body.expense_date);
  const amount = Number(req.body.amount);
  const catId  = req.body.category_id == null || req.body.category_id === ""
    ? null : Number(req.body.category_id);
  const desc   = (req.body.description || "").toString().trim() || null;
  const method = req.body.payment_method || null;

  if (!date) return res.status(400).json({ error: "expense_date requerido" });
  if (Number.isNaN(amount) || amount <= 0)
    return res.status(400).json({ error: "amount debe ser > 0" });
  if (method && !VALID_METHODS.includes(method))
    return res.status(400).json({ error: "payment_method inválido" });

  try {
    const updatedId = await withTransaction(async (client) => {
      if (catId != null) {
        const { rows } = await client.query(
          "SELECT id FROM expense_categories WHERE id = $1 AND active = TRUE",
          [catId]
        );
        if (rows.length === 0) throw new HttpError(400, "Categoría inválida o inactiva");
      }
      const { rows } = await client.query(
        `UPDATE expenses
            SET expense_date   = $2,
                category_id    = $3,
                amount         = $4,
                description    = $5,
                payment_method = $6
          WHERE id = $1
          RETURNING id`,
        [id, date, catId, amount, desc, method]
      );
      if (rows.length === 0) throw new HttpError(404, "Gasto no encontrado");
      return rows[0].id;
    });
    const detail = await query(
      `SELECT e.id, e.expense_date, e.category_id, e.amount, e.description,
              e.payment_method, e.user_id, e.created_at,
              c.name AS category_name, c.icon AS category_icon,
              u.name AS user_name
         FROM expenses e
         LEFT JOIN expense_categories c ON c.id = e.category_id
         LEFT JOIN users              u ON u.id = e.user_id
        WHERE e.id = $1`,
      [updatedId]
    );
    res.json(detail.rows[0]);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[expenses:PUT /:id]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const ok = await withTransaction(async (client) => {
      const { rows } = await client.query("DELETE FROM expenses WHERE id = $1 RETURNING id", [id]);
      if (rows.length === 0) throw new HttpError(404, "Gasto no encontrado");
      return true;
    });
    res.json({ ok });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(`[expenses:DELETE /:id]`, e);
    res.status(status).json({ error: e.message || "Error interno" });
  }
});

export default router;
