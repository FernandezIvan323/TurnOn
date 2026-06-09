import "dotenv/config";
import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { ensureDatabase, runMigrations, seed } from "./db.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import tablesRoutes from "./routes/tables.js";
import customersRoutes from "./routes/customers.js";
import deliveryRoutes from "./routes/delivery.js";
import ordersRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportsRoutes from "./routes/reports.js";
import assignmentsRoutes from "./routes/assignments.js";
import cashClosingsRoutes from "./routes/cashClosings.js";
import expensesRoutes from "./routes/expenses.js";
import inventoryRoutes from "./routes/inventory.js";

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5180,http://127.0.0.1:5180")
  .split(",")
  .map((s) => s.trim());

const app = express();
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/cash-closings", cashClosingsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use((err, _req, res, _next) => {
  console.error("[api] Error:", err);
  const status = err.status || 500;
  const message = status === 500 ? "Error interno del servidor" : err.message;
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 3001;

function listenWithRetry(port, retries = 5, delay = 1000) {
  return new Promise((resolve, reject) => {
    const tryListen = (attempt) => {
      const server = app.listen(port, () => {
        console.log(`[api] AppTurnos API escuchando en http://localhost:${port}`);
        resolve(server);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && attempt < retries) {
          console.log(`[api] Puerto ${port} ocupado, reintento ${attempt + 1}/${retries} en ${delay}ms...`);
          server.close();
          setTimeout(() => tryListen(attempt + 1), delay);
        } else {
          reject(err);
        }
      });
    };
    tryListen(0);
  });
}

(async () => {
  try {
    await ensureDatabase();
    await runMigrations();
    await seed();
    await listenWithRetry(PORT);
  } catch (e) {
    console.error("[api] No se pudo iniciar:", e);
    process.exit(1);
  }
})();
