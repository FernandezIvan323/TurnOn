import { Router } from "express";
import { query } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

const DEFAULTS = {
  business_name: "TurnOn",
  address: null,
  phone: null,
  currency: "COP",
  locale: "es-CO",
  timezone: "America/Mexico_City",
  open_hour: null,
  close_hour: null,
};

/** Convierte fila de BD a un objeto plano con defaults. */
function normalize(row) {
  if (!row) return DEFAULTS;
  return {
    business_name: row.business_name ?? DEFAULTS.business_name,
    address: row.address ?? null,
    phone: row.phone ?? null,
    currency: row.currency ?? DEFAULTS.currency,
    locale: row.locale ?? DEFAULTS.locale,
    timezone: row.timezone ?? DEFAULTS.timezone,
    open_hour: row.open_hour ?? null,
    close_hour: row.close_hour ?? null,
  };
}

// Lectura pública: la SPA la necesita antes del login (moneda, nombre del local).
router.get("/", async (_req, res) => {
  const { rows } = await query("SELECT * FROM settings WHERE id = 1");
  res.json(normalize(rows[0]));
});

// Escritura: solo admin.
router.put("/", authRequired, requireRole("admin"), async (req, res) => {
  const b = req.body || {};
  const business_name =
    typeof b.business_name === "string" && b.business_name.trim()
      ? b.business_name.trim().slice(0, 120)
      : DEFAULTS.business_name;
  const currency =
    typeof b.currency === "string" && /^[A-Z]{3}$/.test(b.currency.trim())
      ? b.currency.trim().toUpperCase()
      : DEFAULTS.currency;
  const locale =
    typeof b.locale === "string" && b.locale.trim()
      ? b.locale.trim().slice(0, 10)
      : DEFAULTS.locale;
  const timezone =
    typeof b.timezone === "string" && /^[\w/]+$/.test(b.timezone.trim())
      ? b.timezone.trim()
      : DEFAULTS.timezone;

  const address =
    typeof b.address === "string" ? b.address.trim().slice(0, 200) || null : null;
  const phone =
    typeof b.phone === "string" ? b.phone.trim().slice(0, 40) || null : null;

  const timeRe = /^\d{2}:\d{2}(:\d{2})?$/;
  const open_hour = typeof b.open_hour === "string" && timeRe.test(b.open_hour) ? b.open_hour : null;
  const close_hour = typeof b.close_hour === "string" && timeRe.test(b.close_hour) ? b.close_hour : null;

  const { rows } = await query(
    `INSERT INTO settings (id, business_name, address, phone, currency, locale, timezone, open_hour, close_hour, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (id) DO UPDATE SET
       business_name = EXCLUDED.business_name,
       address       = EXCLUDED.address,
       phone         = EXCLUDED.phone,
       currency      = EXCLUDED.currency,
       locale        = EXCLUDED.locale,
       timezone      = EXCLUDED.timezone,
       open_hour     = EXCLUDED.open_hour,
       close_hour    = EXCLUDED.close_hour,
       updated_at    = NOW()
     RETURNING *`,
    [business_name, address, phone, currency, locale, timezone, open_hour, close_hour]
  );

  res.json(normalize(rows[0]));
});

export default router;