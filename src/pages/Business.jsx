import { useEffect, useState } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import Modal from "../components/Modal";
import SegmentedControl from "../components/SegmentedControl";
import BarChart from "../components/BarChart";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useAuth } from "../store/auth";
import { toast } from "../store/toast";
import { money } from "../lib/format";
import { todayLocalISO } from "../lib/date";
import { setSettings } from "../lib/settings";
import {
  Store,
  TrendingUp,
  TrendingDown,
  Clock,
  Save,
  Loader2,
  Users,
  CalendarDays,
  Wallet,
  CreditCard,
  Building2,
  Receipt,
  Truck,
  Utensils,
  ShoppingBag,
  DollarSign,
  Pencil,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Trend({ current, previous }) {
  if (!previous || Number(previous) === 0) return null;
  const diff = ((Number(current) - Number(previous)) / Number(previous)) * 100;
  const up = diff >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      <Icon size={12} /> {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

function CuentaTab() {
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = () => api.get("/settings").then((r) => setForm(r.data));
  useEffect(() => { load(); }, []);

  if (!form) return <div className="text-sm text-ink-500">Cargando…</div>;

  const rows = [
    { icon: MapPin, label: "Dirección", value: form.address || "—" },
    { icon: Phone, label: "Teléfono", value: form.phone || "—" },
    { icon: Mail, label: "Email", value: form.email || "—" },
    { icon: Globe, label: "Sitio web", value: form.website || "—" },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
              <Store size={14} className="text-wine-600 dark:text-wine-300" /> Nombre del negocio
            </div>
            <div className="mt-1 text-xl font-bold text-ink-900 dark:text-white">{form.business_name || "TurnOn"}</div>
          </div>
          <button onClick={() => setEditing(true)} className="btn-secondary h-9">
            <Pencil size={15} /> Editar información de la cuenta
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2 rounded-lg bg-paper-50 px-3 py-2 dark:bg-obsidian-950/40">
              <r.icon size={15} className="text-ink-400 dark:text-obsidian-500" />
              <div className="min-w-0">
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{r.label}</div>
                <div className="truncate text-sm text-ink-800 dark:text-obsidian-50">{r.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">Moneda</div>
            <div className="font-medium text-ink-900 dark:text-white">{form.currency || "COP"}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">Zona horaria</div>
            <div className="font-medium text-ink-900 dark:text-white">{form.timezone || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">Horario</div>
            <div className="font-medium text-ink-900 dark:text-white">
              {form.open_hour || "—"} → {form.close_hour || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">Locale</div>
            <div className="font-medium text-ink-900 dark:text-white">{form.locale || "es-CO"}</div>
          </div>
        </div>
      </div>

      {editing && <CuentaModal initial={form} onClose={() => setEditing(false)} onSaved={(d) => { setForm(d); setSettings(d); }} />}
    </div>
  );
}

function CuentaModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/settings", form);
      setSettings(data);
      toast.success("Datos del negocio guardados");
      onSaved(data);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={<span className="flex items-center gap-2"><Store size={18} /> Editar información de la cuenta</span>} size="lg">
      <div className="space-y-4">
        <div>
          <label className="label">Nombre del negocio</label>
          <input className="input" value={form.business_name || ""} onChange={(e) => set("business_name", e.target.value)} maxLength={120} />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input className="input" value={form.address || ""} onChange={(e) => set("address", e.target.value)} maxLength={200} placeholder="Av. Siempre Viva 123" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Teléfono</label>
            <input className="input" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} maxLength={120} placeholder="contacto@local.com" />
          </div>
        </div>
        <div>
          <label className="label">Sitio web / red social</label>
          <input className="input" value={form.website || ""} onChange={(e) => set("website", e.target.value)} maxLength={200} placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Moneda (código ISO)</label>
            <input className="input" value={form.currency || "COP"} onChange={(e) => set("currency", e.target.value.toUpperCase())} maxLength={3} placeholder="COP" />
          </div>
          <div>
            <label className="label">Locale</label>
            <input className="input" value={form.locale || "es-CO"} onChange={(e) => set("locale", e.target.value)} placeholder="es-CO" />
          </div>
        </div>
        <div>
          <label className="label">Zona horaria</label>
          <input className="input" value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} placeholder="America/Mexico_City" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Hora de apertura</label>
            <input className="input" type="time" value={form.open_hour || ""} onChange={(e) => set("open_hour", e.target.value)} />
          </div>
          <div>
            <label className="label">Hora de cierre</label>
            <input className="input" type="time" value={form.close_hour || ""} onChange={(e) => set("close_hour", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-paper-200 pt-3 dark:border-obsidian-800">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}

const PAYMENT_DEFS = {
  cash: { label: "Efectivo", icon: Wallet, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  card: { label: "Tarjeta", icon: CreditCard, color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20" },
  transfer: { label: "Transferencia", icon: Building2, color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  mixed: { label: "Mixto", icon: Receipt, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20" },
};

function CrecimientoTab() {
  const [range, setRange] = useState("7");
  const [sales, setSales] = useState(null);
  const [history, setHistory] = useState([]);
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = Number(range);
    const from = isoDaysAgo(days - 1);
    const to = todayLocalISO();
    setLoading(true);
    Promise.all([
      api.get("/reports/sales", { params: { from, to } }),
      api.get("/reports/daily-history", { params: { limit: days } }),
      api.get("/dashboard/business"),
    ])
      .then(([sl, hi, t]) => {
        setSales(sl.data);
        setHistory(hi.data || []);
        setTimes(t.data);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const c = sales?.current || {};
  const prev = sales?.previous || {};
  const salesTotal = Number(c.sales || 0);
  const expensesTotal = history.reduce((s, h) => s + Number(h.expenses || 0), 0);
  const netTotal = history.reduce((s, h) => s + Number(h.net || 0), 0);

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—";

  const barData = (sales?.days || []).map((d) => {
    const [, m, day] = d.date.split("-");
    return { label: `${Number(day)}/${m}`, value: Number(d.sales) };
  });

  const channels = [
    { label: "Mesas", icon: Utensils, value: Number(c.table_sales || 0), bar: "bg-sky-500", text: "text-sky-700 dark:text-sky-300" },
    { label: "Domicilios", icon: Truck, value: Number(c.delivery_sales || 0), bar: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300" },
    { label: "Para llevar", icon: ShoppingBag, value: Number(c.pickup_sales || 0), bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  ];
  const channelMax = Math.max(1, ...channels.map((ch) => ch.value));

  const methods = Object.entries(c.payment_methods || {}).map(([k, v]) => ({
    key: k,
    value: Number(v || 0),
  }));
  const methodsTotal = methods.reduce((s, m) => s + m.value, 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={range}
        onChange={setRange}
        options={[{ value: "7", label: "7 días" }, { value: "30", label: "30 días" }]}
      />

      {/* Hero: ventas + ganancia neta */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card border-l-4 border-l-wine-500 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            <DollarSign size={14} className="text-wine-600 dark:text-wine-300" /> Ventas del período
          </div>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-4xl font-extrabold tabular-nums text-ink-900 dark:text-white">{money(salesTotal)}</span>
            <Trend current={salesTotal} previous={prev.sales} />
          </div>
        </div>
        <div className="card border-l-4 border-l-emerald-500 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-300" /> Ganancia neta
          </div>
          <div className="mt-1 text-4xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">{money(netTotal)}</div>
          <div className="mt-1 text-xs text-ink-500 dark:text-obsidian-400">Ventas − gastos ({money(expensesTotal)} gastos)</div>
        </div>
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 dark:text-obsidian-400"><Store size={14} className="text-wine-600 dark:text-wine-300" /> Pedidos</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{c.orders || 0}</span>
            <Trend current={c.orders} previous={prev.orders} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 dark:text-obsidian-400"><Receipt size={14} className="text-wine-600 dark:text-wine-300" /> Ticket promedio</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{money(c.avg_ticket || 0)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 dark:text-obsidian-400"><TrendingUp size={14} className="text-wine-600 dark:text-wine-300" /> Propinas</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{money(c.tips || 0)}</span>
            <Trend current={c.tips} previous={prev.tips} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 dark:text-obsidian-400"><Users size={14} className="text-wine-600 dark:text-wine-300" /> Clientes / mesas</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {c.table_orders || 0} · {c.delivery_orders || 0} · {c.pickup_orders || 0}
          </div>
          <div className="text-xs text-ink-400 dark:text-obsidian-500">M · D · L</div>
        </div>
      </div>

      {/* Gráfico + desglose por canal */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Ventas por día</h3>
          <BarChart data={barData} vertical maxBars={31} height={160} barColor="bg-wine-500 dark:bg-wine-400" showValues={false} />
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Por canal</h3>
          <div className="space-y-3">
            {channels.map((ch) => (
              <div key={ch.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-ink-700 dark:text-obsidian-200"><ch.icon size={14} className={ch.text} /> {ch.label}</span>
                  <span className={`font-semibold tabular-nums ${ch.text}`}>{money(ch.value)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-200 dark:bg-obsidian-800">
                  <div className={`h-full rounded-full ${ch.bar}`} style={{ width: `${(ch.value / channelMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métodos de pago + operativo */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Métodos de pago</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {methods.map((m) => {
              const def = PAYMENT_DEFS[m.key] || { label: m.key, icon: Receipt, color: "text-ink-600 dark:text-obsidian-200", bg: "bg-paper-100 dark:bg-obsidian-800" };
              const pct = methodsTotal > 0 ? Math.round((m.value / methodsTotal) * 100) : 0;
              return (
                <div key={m.key} className={`rounded-xl p-3 text-center ${def.bg}`}>
                  <def.icon size={18} className={`mx-auto mb-1 ${def.color}`} />
                  <div className="text-xs text-ink-500 dark:text-obsidian-400">{def.label}</div>
                  <div className={`text-sm font-bold ${def.color}`}>{money(m.value)}</div>
                  <div className="text-[10px] text-ink-400 dark:text-obsidian-500">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Operativo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-500 dark:text-obsidian-400">Días trabajados (mes)</span>
              <b className="text-ink-900 dark:text-white">{times?.work_days_month || 0}</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500 dark:text-obsidian-400">Pedidos pagados (mes)</span>
              <b className="text-ink-900 dark:text-white">{times?.paid_orders_month || 0}</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500 dark:text-obsidian-400">Primer pedido hoy</span>
              <b className="tabular-nums text-ink-900 dark:text-white">{fmt(times?.first_order)}</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500 dark:text-obsidian-400">Último pedido hoy</span>
              <b className="tabular-nums text-ink-900 dark:text-white">{fmt(times?.last_order)}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Business() {
  useDocumentTitle("Negocio");
  const { user } = useAuth();
  const [tab, setTab] = useState("cuenta");

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el administrador.</div>;
  }

  return (
    <div>
      <Header title="Negocio" subtitle="Datos del local y crecimiento" />

      <div className="mb-4 flex flex-col items-center no-print">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          size="lg"
          options={[
            { value: "cuenta", label: "Cuenta", icon: Store },
            { value: "crecimiento", label: "Crecimiento", icon: TrendingUp },
          ]}
        />
      </div>

      {tab === "cuenta" && <CuentaTab />}
      {tab === "crecimiento" && <CrecimientoTab />}
    </div>
  );
}