import { useEffect, useState } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import SegmentedControl from "../components/SegmentedControl";
import ModuleGrid from "../components/ModuleGrid";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useAuth } from "../store/auth";
import { toast } from "../store/toast";
import { money } from "../lib/format";
import { todayLocalISO } from "../lib/date";
import { setSettings } from "../lib/settings";
import {
  Store,
  TrendingUp,
  Clock,
  Save,
  Loader2,
  Users,
  CalendarDays,
} from "lucide-react";

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-white">
        <Icon size={14} className="text-wine-600 dark:text-wine-300" />
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-500 dark:text-obsidian-400">{hint}</div>}
    </div>
  );
}

function CuentaTab() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/settings", form);
      setForm(data);
      setSettings(data);
      toast.success("Datos del negocio guardados");
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="text-sm text-ink-500">Cargando…</div>;

  return (
    <div className="max-w-2xl space-y-4">
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
          <label className="label">Moneda (código ISO)</label>
          <input className="input" value={form.currency || "COP"} onChange={(e) => set("currency", e.target.value.toUpperCase())} maxLength={3} placeholder="COP" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Zona horaria</label>
          <input className="input" value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} placeholder="America/Mexico_City" />
        </div>
        <div>
          <label className="label">Locale</label>
          <input className="input" value={form.locale || "es-CO"} onChange={(e) => set("locale", e.target.value)} placeholder="es-CO" />
        </div>
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
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar datos
      </button>
    </div>
  );
}

function CrecimientoTab() {
  const [range, setRange] = useState("7");
  const [data, setData] = useState(null);
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = Number(range);
    const from = isoDaysAgo(days - 1);
    const to = todayLocalISO();
    setLoading(true);
    Promise.all([
      api.get("/reports/sales", { params: { from, to } }),
      api.get("/dashboard/business"),
    ])
      .then(([sales, t]) => {
        setData(sales.data);
        setTimes(t.data);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const c = data?.current || {};

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={range}
        onChange={setRange}
        options={[{ value: "7", label: "7 días" }, { value: "30", label: "30 días" }]}
      />
      {loading ? (
        <div className="text-sm text-ink-500">Cargando…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Ventas" value={money(c.sales || 0)} hint="En el período" />
          <StatCard icon={Store} label="Pedidos" value={c.orders || 0} hint="Pagados" />
          <StatCard icon={Users} label="Ticket promedio" value={money(c.avg_ticket || 0)} hint="" />
          <StatCard icon={TrendingUp} label="Propinas" value={money(c.tips || 0)} hint="Del período" />
          <StatCard icon={CalendarDays} label="Días trabajados (mes)" value={times?.work_days_month || 0} hint="" />
          <StatCard icon={Clock} label="Primer pedido de hoy" value={fmt(times?.first_order)} hint="" />
          <StatCard icon={Clock} label="Último pedido de hoy" value={fmt(times?.last_order)} hint="" />
          <StatCard icon={Store} label="Pedidos pagados (mes)" value={times?.paid_orders_month || 0} hint="" />
        </div>
      )}
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

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-700 dark:text-white">
          Operaciones
        </h2>
        <ModuleGrid />
      </div>

      <div className="mb-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
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