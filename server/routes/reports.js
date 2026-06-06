import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, requireRole("admin"));

// Resumen de ventas (con comparativa)
router.get("/sales", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos (YYYY-MM-DD)" });

  // Días del período
  const days = (new Date(to) - new Date(from)) / 86400000 + 1;
  const prevFrom = new Date(new Date(from).getTime() - days * 86400000).toISOString().slice(0, 10);
  const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().slice(0, 10);

  const current = await query(
    `SELECT DATE(created_at) AS date,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total),0)::numeric AS sales,
            COUNT(*) FILTER (WHERE type='delivery')::int AS delivery_orders,
            COUNT(*) FILTER (WHERE type='table')::int    AS table_orders,
            COUNT(*) FILTER (WHERE type='pickup')::int   AS pickup_orders,
            COALESCE(AVG(total),0)::numeric AS avg_ticket
       FROM orders
      WHERE payment_status='paid'
        AND DATE(created_at) BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date`,
    [from, to]
  );

  const previous = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS sales,
            COUNT(*)::int AS orders
       FROM orders
      WHERE payment_status='paid'
        AND DATE(created_at) BETWEEN $1 AND $2`,
    [prevFrom, prevTo]
  );

  // Ganancias de domicilios
  const deliveryGains = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS total,
            COUNT(*)::int AS count
       FROM orders
      WHERE payment_status='paid'
        AND type='delivery'
        AND DATE(created_at) BETWEEN $1 AND $2`,
    [from, to]
  );

  res.json({
    days: current.rows,
    current: {
      sales: current.rows.reduce((s, r) => s + Number(r.sales), 0),
      orders: current.rows.reduce((s, r) => s + r.orders, 0),
      delivery_orders: current.rows.reduce((s, r) => s + r.delivery_orders, 0),
      table_orders: current.rows.reduce((s, r) => s + r.table_orders, 0),
      avg_ticket: current.rows.length
        ? current.rows.reduce((s, r) => s + Number(r.avg_ticket), 0) / current.rows.length
        : 0,
    },
    previous: previous.rows[0],
    delivery_gains: deliveryGains.rows[0],
  });
});

// Top productos más vendidos
router.get("/top-products", async (req, res) => {
  const { from, to, limit = 10, by = "qty" } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });

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
        AND DATE(o.created_at) BETWEEN $1 AND $2
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
  const { rows } = await query(
    `SELECT COALESCE(c.name, 'Sin categoría') AS category,
            COALESCE(SUM(oi.quantity * oi.unit_price),0)::numeric AS revenue,
            SUM(oi.quantity)::int AS qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.payment_status='paid'
        AND DATE(o.created_at) BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY revenue DESC`,
    [from, to]
  );
  res.json(rows);
});

// Horarios pico (pedidos agrupados por hora)
router.get("/peak-hours", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const { rows } = await query(
    `SELECT EXTRACT(HOUR FROM created_at)::int AS hour,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total),0)::numeric AS sales
       FROM orders
      WHERE payment_status='paid'
        AND DATE(created_at) BETWEEN $1 AND $2
      GROUP BY hour
      ORDER BY hour`,
    [from, to]
  );
  // Rellenar todas las horas
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
  const { rows } = await query(
    `SELECT c.id, c.name, c.phone, c.neighborhood,
            COUNT(o.id)::int AS orders_count,
            COALESCE(SUM(o.total),0)::numeric AS total_spent,
            MAX(o.created_at) AS last_order
       FROM customers c
       JOIN orders o ON o.customer_id = c.id
      WHERE o.payment_status='paid'
        AND DATE(o.created_at) BETWEEN $1 AND $2
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

// Domicilios entregados por repartidor
router.get("/delivery-by-person", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const { rows } = await query(
    `SELECT dp.id, dp.name, dp.phone,
            COUNT(o.id)::int AS deliveries,
            COALESCE(SUM(o.total),0)::numeric AS revenue
       FROM delivery_persons dp
       LEFT JOIN orders o ON o.delivery_person_id = dp.id
                         AND o.payment_status='paid'
                         AND DATE(o.created_at) BETWEEN $1 AND $2
      GROUP BY dp.id
      ORDER BY deliveries DESC`,
    [from, to]
  );
  res.json(rows);
});

export default router;
