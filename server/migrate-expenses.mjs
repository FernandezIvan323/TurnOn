import { query } from "./db.js";

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id     SERIAL PRIMARY KEY,
      name   VARCHAR(60) UNIQUE NOT NULL,
      icon   VARCHAR(30),
      active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id             SERIAL PRIMARY KEY,
      expense_date   DATE NOT NULL,
      category_id    INT REFERENCES expense_categories(id) ON DELETE SET NULL,
      amount         NUMERIC(10,2) NOT NULL,
      description    TEXT,
      payment_method VARCHAR(20) CHECK (payment_method IN ('cash','card','transfer')),
      user_id        INT REFERENCES users(id) ON DELETE SET NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_expenses_cat  ON expenses(category_id)`);

  const t1 = await query("SELECT to_regclass('public.expense_categories') AS t");
  const t2 = await query("SELECT to_regclass('public.expenses') AS t");
  console.log("Tabla expense_categories:", t1.rows[0].t);
  console.log("Tabla expenses:", t2.rows[0].t);
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
