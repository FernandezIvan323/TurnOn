import "dotenv/config";
import { config as loadEnv } from "dotenv";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar explícitamente server/.env (dotenv/config por defecto busca en cwd)
loadEnv({ path: path.join(__dirname, ".env") });

const {
  DB_HOST = "localhost",
  DB_PORT = 5432,
  DB_USER = "postgres",
  DB_PASSWORD = "",
  DB_NAME = "appturnos",
} = process.env;

// Pool "bootstrap" conectado a la base postgres para poder CREAR la DB si no existe.
const bootstrap = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: "postgres",
});

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL", err);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export async function ensureDatabase() {
  const { rows } = await bootstrap.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME]
  );
  if (rows.length === 0) {
    console.log(`[db] Creando base de datos "${DB_NAME}"…`);
    await bootstrap.query(`CREATE DATABASE "${DB_NAME}"`);
  } else {
    console.log(`[db] Base de datos "${DB_NAME}" ya existe.`);
  }
}

export async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("[db] Migraciones aplicadas.");
}

export async function seed() {
  // Categorías
  const categoriesCount = await pool.query("SELECT COUNT(*)::int c FROM categories");
  if (categoriesCount.rows[0].c === 0) {
    console.log("[seed] Insertando categorías…");
    await pool.query(
      "INSERT INTO categories (name, position) VALUES " +
        "('Bebidas', 1),('Platos fuertes', 2),('Acompañamientos', 3),('Postres', 4),('Extras', 5)"
    );
  }

  // Productos base
  const productsCount = await pool.query("SELECT COUNT(*)::int c FROM products");
  if (productsCount.rows[0].c === 0) {
    console.log("[seed] Insertando productos de ejemplo…");
    const { rows: cats } = await pool.query("SELECT id, name FROM categories ORDER BY id");
    const findCat = (n) => cats.find((c) => c.name === n)?.id;
    await pool.query(
      `INSERT INTO products (category_id, name, description, price) VALUES
       ($1, 'Coca-Cola 350ml', 'Lata fría', 18.00),
       ($1, 'Agua mineral 500ml', 'Con o sin gas', 15.00),
       ($1, 'Jugo de naranja', 'Natural', 22.00),
       ($2, 'Hamburguesa clásica', 'Carne, queso, lechuga, tomate', 75.00),
       ($2, 'Hamburguesa doble', 'Doble carne, queso cheddar', 95.00),
       ($2, 'Hot dog especial', 'Con tocino y queso', 45.00),
       ($2, 'Pizza personal', 'Margarita o pepperoni', 85.00),
       ($3, 'Papas fritas', 'Porción personal', 30.00),
       ($3, 'Aros de cebolla', '8 unidades', 35.00),
       ($3, 'Ensalada César', 'Con pollo', 60.00),
       ($4, 'Pastel de chocolate', 'Porción individual', 40.00),
       ($4, 'Helado', 'Vainilla, chocolate o fresa', 28.00),
       ($5, 'Salsa extra', 'Picante o BBQ', 5.00),
       ($5, 'Queso extra', 'Cheddar o mozzarella', 12.00)`,
      [
        findCat("Bebidas"),
        findCat("Platos fuertes"),
        findCat("Acompañamientos"),
        findCat("Postres"),
        findCat("Extras"),
      ]
    );
  }

  // Mesas
  const tablesCount = await pool.query("SELECT COUNT(*)::int c FROM tables");
  if (tablesCount.rows[0].c === 0) {
    console.log("[seed] Insertando mesas de ejemplo…");
    await pool.query(
      "INSERT INTO tables (number, label, capacity) VALUES " +
        "('1','Mesa 1',4),('2','Mesa 2',4),('3','Mesa 3',4),('4','Mesa 4',6),('5','Mesa 5',2),('B1','Barra 1',1),('B2','Barra 2',1),('P1','Patio 1',6),('P2','Patio 2',6)"
    );
  }

  // Repartidores
  const dpCount = await pool.query("SELECT COUNT(*)::int c FROM delivery_persons");
  if (dpCount.rows[0].c === 0) {
    console.log("[seed] Insertando repartidores…");
    await pool.query(
      "INSERT INTO delivery_persons (name, phone, status) VALUES " +
        "('Carlos Pérez','555-0101','available'),('Luis Gómez','555-0102','available'),('Marco Ruiz','555-0103','available')"
    );
  }

  // Usuarios
  const usersCount = await pool.query("SELECT COUNT(*)::int c FROM users");
  if (usersCount.rows[0].c === 0) {
    console.log("[seed] Insertando usuarios…");
    const adminPin = await bcrypt.hash("1234", 10);
    const waiterPin = await bcrypt.hash("0000", 10);
    await pool.query(
      "INSERT INTO users (username, name, pin, role) VALUES " +
        "('admin','Administrador (Caja)',$1,'admin')," +
        "('ivan','Ivan (Mesero)',$2,'waiter')," +
        "('maria','María (Mesera)',$2,'waiter')",
      [adminPin, waiterPin]
    );
  }

  // Categorías de gastos
  const expCatCount = await pool.query("SELECT COUNT(*)::int c FROM expense_categories");
  if (expCatCount.rows[0].c === 0) {
    console.log("[seed] Insertando categorías de gastos…");
    await pool.query(
      `INSERT INTO expense_categories (name, icon) VALUES
         ('Compras','ShoppingCart'),
         ('Servicios','Zap'),
         ('Sueldos','Wallet'),
         ('Mantenimiento','Wrench'),
         ('Insumos','Package'),
         ('Limpieza','Sparkles'),
         ('Otros','Receipt')`
    );
  }
}
