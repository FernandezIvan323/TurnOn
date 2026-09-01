import { Router } from "express";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function tz() {
  const t = process.env.DB_TZ || "America/Mexico_City";
  if (!/^[\w/]+$/.test(t)) throw new Error(`Timezone inválido: ${t}`);
  return t;
}

router.get("/summary", authRequired, async (req, res) => {
  if (req.user.role === "delivery") {
    const dp = await query(
      "SELECT id FROM delivery_persons WHERE user_id = $1 LIMIT 1",
      [req.user.id]
    );
    if (dp.rows.length === 0)
      return res.json({ role: "delivery", my: null, today: null });
    const dpId = dp.rows[0].id;
    const my = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM orders
           WHERE delivery_person_id = $1 AND status = 'assigned')            AS ready_count,
         (SELECT COALESCE(SUM(total),0)::numeric FROM orders
           WHERE delivery_person_id = $1 AND status = 'assigned')            AS ready_amount,
         (SELECT COUNT(*)::int FROM orders
           WHERE delivery_person_id = $1 AND status = 'on_the_way')          AS on_the_way_count,
         (SELECT COALESCE(SUM(total),0)::numeric FROM orders
           WHERE delivery_person_id = $1 AND status = 'on_the_way'
             AND payment_status = 'pending')                                 AS street_amount`,
      [dpId]
    );
    const today = await query(
      `SELECT COUNT(*)::int AS delivered_count,
              COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid' AND payment_method = 'cash'),0)::numeric     AS cash_to_settle,
              COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid' AND payment_method <> 'cash'),0)::numeric    AS transfer_collected
         FROM orders
        WHERE delivery_person_id = $1
          AND status = 'delivered'
          AND DATE(closed_at AT TIME ZONE '${tz()}') = CURRENT_DATE`,
      [dpId]
    );
    return res.json({ role: "delivery", my: my.rows[0], today: today.rows[0] });
  }

  if (req.user.role === "waiter") {
    const my = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM waiter_tables WHERE user_id = $1)                                  AS assigned_count,
         (SELECT COUNT(*)::int FROM waiter_tables wt
            JOIN orders o ON o.table_id = wt.table_id
            WHERE wt.user_id = $1
              AND o.status NOT IN ('paid','cancelled','delivered'))                                    AS open_count,
         (SELECT COUNT(*)::int FROM waiter_tables wt
            JOIN orders o ON o.table_id = wt.table_id
            WHERE wt.user_id = $1 AND o.status = 'ready_to_pay')                                       AS ready_to_pay,
         (SELECT COALESCE(SUM(o.total),0)::numeric FROM waiter_tables wt
            JOIN orders o ON o.table_id = wt.table_id
            WHERE wt.user_id = $1
              AND o.status NOT IN ('paid','cancelled','delivered'))                                    AS open_amount`,
      [req.user.id]
    );
    const today = await query(
      `SELECT COUNT(*)::int                                              AS closed_count,
              COALESCE(SUM(o.total),0)::numeric                          AS total_sold,
              COALESCE(AVG(o.total),0)::numeric                          AS avg_ticket
         FROM waiter_tables wt
         JOIN orders o ON o.table_id = wt.table_id
        WHERE wt.user_id = $1
          AND o.status IN ('delivered','paid')
          AND DATE(o.closed_at) = CURRENT_DATE`,
      [req.user.id]
    );
    return res.json({
      role: "waiter",
      my: my.rows[0],
      today: today.rows[0],
    });
  }

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
        -- Sin asignar: domicilio YA en cocina/listo, sin mensajero (no el recién creado en pending)
        COUNT(*) FILTER (
          WHERE type = 'delivery'
            AND status = 'preparing'
            AND delivery_person_id IS NULL
        )::int                                                               AS pending_to_assign,
        -- Cocina por canal
        COUNT(*) FILTER (WHERE status='preparing')::int                      AS preparing,
        COUNT(*) FILTER (WHERE type='delivery' AND status='preparing')::int  AS preparing_delivery,
        COUNT(*) FILTER (WHERE type='table'    AND status='preparing')::int  AS preparing_tables,
        COUNT(*) FILTER (WHERE type='pickup'   AND status='preparing')::int  AS preparing_pickup,
        COUNT(*) FILTER (WHERE type='delivery' AND status='on_the_way')::int AS on_the_way,
        COUNT(*) FILTER (WHERE type='table'    AND status NOT IN ('paid','cancelled','delivered'))::int AS active_tables,
        -- Solo marcadas "lista para cobrar" (mesero listo)
        COUNT(*) FILTER (WHERE status='ready_to_pay')::int                   AS ready_to_pay,
        -- Caja: todas las cuentas abiertas sin pagar (mesas + llevar + domicilio)
        COUNT(*) FILTER (
          WHERE payment_status = 'pending'
            AND status NOT IN ('paid','cancelled','delivered')
        )::int                                                               AS to_collect,
        COUNT(*) FILTER (
          WHERE type = 'table'
            AND payment_status = 'pending'
            AND status NOT IN ('paid','cancelled','delivered')
        )::int                                                               AS to_collect_tables,
        COUNT(*) FILTER (WHERE status NOT IN ('paid','cancelled','delivered'))::int AS active_orders
       FROM orders`
  );

  res.json({
    role: "admin",
    today: today.rows[0],
    yesterday_sales: yesterday.rows[0].total_sales,
    op: op.rows[0],
  });
});

export default router;
