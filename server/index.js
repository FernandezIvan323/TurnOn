import "./load-env.js";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Logs a archivo (arranque LAN desacoplado no usa pipes del shell)
const logFile = path.join(rootDir, "api.log");
const errFile = path.join(rootDir, "api-error.log");
function teeLog(line, isErr = false) {
  const s = String(line);
  try {
    fs.appendFileSync(isErr ? errFile : logFile, s.endsWith("\n") ? s : s + "\n");
  } catch {
    /* ignore */
  }
  if (isErr) console.error(s);
  else console.log(s);
}

/** Orígenes privados LAN (192.168.x / 10.x / 172.16-31.x) en cualquier puerto */
function isPrivateLanOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const h = u.hostname;
    if (h === "localhost" || h === "127.0.0.1") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    return false;
  } catch {
    return false;
  }
}

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5180,http://127.0.0.1:5180")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const LAN_MODE = process.env.LAN_MODE !== "0" && process.env.LAN_MODE !== "false";
const TRUST_PROXY =
  process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true";

const app = express();
if (TRUST_PROXY) {
  app.set("trust proxy", 1);
}
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, cb) => {
      // Mismo origen (SPA servida por Express) o sin Origin (health, curl)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      if (LAN_MODE && isPrivateLanOrigin(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date(), name: "TurnOn" })
);

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

// Producción LAN: UI + API en el mismo proceso (mismo origen → celulares OK)
const distPath = path.join(__dirname, "..", "dist");
const hasDist = fs.existsSync(path.join(distPath, "index.html"));

if (hasDist) {
  app.use(
    express.static(distPath, {
      index: false,
      maxAge: "1h",
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    })
  );
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error("[api] Error:", err);
  const status = err.status || 500;
  const message = status === 500 ? "Error interno del servidor" : err.message;
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

function lanAddresses() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const list of Object.values(nets)) {
    if (!list) continue;
    for (const n of list) {
      if (n.family === "IPv4" && !n.internal) out.push(n.address);
    }
  }
  return out;
}

function listenWithRetry(port, host, retries = 5, delay = 1000) {
  return new Promise((resolve, reject) => {
    const tryListen = (attempt) => {
      const server = app.listen(port, host, () => {
        teeLog(`[api] TurnOn escuchando en http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
        if (hasDist) {
          teeLog(`[api] UI de producción servida desde dist/`);
        } else {
          teeLog(`[api] Sin dist/ — solo API. Ejecutá "npm run build".`);
        }
        for (const ip of lanAddresses()) {
          teeLog(`[api] Red → http://${ip}:${port}`);
        }
        resolve(server);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && attempt < retries) {
          teeLog(
            `[api] Puerto ${port} ocupado, reintento ${attempt + 1}/${retries} en ${delay}ms...`
          );
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

// Evitar que un error no capturado tumbe el proceso en silencio
process.on("uncaughtException", (e) => {
  teeLog(`[api] uncaughtException: ${e?.stack || e}`, true);
});
process.on("unhandledRejection", (e) => {
  teeLog(`[api] unhandledRejection: ${e?.stack || e}`, true);
});

(async () => {
  try {
    teeLog(`==== TurnOn start ${new Date().toISOString()} pid=${process.pid} ====`);
    await ensureDatabase();
    await runMigrations();
    await seed();
    await listenWithRetry(PORT, HOST);
  } catch (e) {
    teeLog(`[api] No se pudo iniciar: ${e?.stack || e}`, true);
    process.exit(1);
  }
})();
