import { Router } from "express";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/summary", authRequired, async (_req, res) => {
  const today = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS total_sales,
            COUNT(*)::int                     AS orders_count,
            COUNT(*) FILTER (WHERE type='delivery')::int  AS delivery_count,
            COUNT(*) FILTER (WHERE type='table')::int     AS table_count,
            COUNT(*) FILTER (WHERE type='pickup')::int    AS pickup_count,
            COALESCE(AVG(total),0)::numeric  AS avg_ticket
       FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
        AND payment_status = 'paid'`
  );

  const yesterday = await query(
    `SELECT COALESCE(SUM(total),0)::numeric AS total_sales
       FROM orders
      WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
        AND payment_status = 'paid'`
  );

  const op = await query(
    `SELECT
        COUNT(*) FILTER (WHERE type='delivery' AND status='pending')::int    AS pending_to_assign,
        COUNT(*) FILTER (WHERE type='delivery' AND status='preparing')::int  AS preparing,
        COUNT(*) FILTER (WHERE type='delivery' AND status='on_the_way')::int AS on_the_way,
        COUNT(*) FILTER (WHERE type='table'    AND status NOT IN ('paid','cancelled','delivered'))::int AS active_tables,
        COUNT(*) FILTER (WHERE status='ready_to_pay')::int                   AS ready_to_pay,
        COUNT(*) FILTER (WHERE status NOT IN ('paid','cancelled','delivered'))::int AS active_orders
       FROM orders`
  );

  res.json({
    today: today.rows[0],
    yesterday_sales: yesterday.rows[0].total_sales,
    op: op.rows[0],
  });
});

export default router;
