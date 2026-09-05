import { useEffect, useState } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import SegmentedControl from "../components/SegmentedControl";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useAuth } from "../store/auth";
import { toast } from "../store/toast";
import { money } from "../lib/format";
import { todayLocalISO } from "../lib/date";
import {
  Store,
  TrendingUp,
  Users,
  Clock,
  Save,
  Loader2,
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
      toast.success("Datos del negocio guardados");
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="text-sm text-ink-500">Cargando…</div>;

  const field = "input";

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <label className="label">Nombre del negocio</label>
        <input className={field} value={form.business_name || ""} onChange={(e) => set("business_name", e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="label">Dirección</label>
        <input className={field} value={form.address || ""} onChange={(e) => set("address", e.target.value)} maxLength={200} placeholder="Av. Siempre Viva 123" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Teléfono</label>
          <input className={field} value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
        </div>
        <div>
          <label className="label">Moneda (código ISO)</label>
          <input className={field} value={form.currency || "COP"} onChange={(e) => set("currency", e.target.value.toUpperCase())} maxLength={3} placeholder="COP" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Zona horaria</label>
          <input className={field} value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} placeholder="America/Mexico_City" />
        </div>
        <div>
          <label className="label">Locale</label>
          <input className={field} value={form.locale || "es-CO"} onChange={(e) => set("locale", e.target.value)} placeholder="es-CO" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Hora de apertura</label>
          <input className={field} type="time" value={form.open_hour || ""} onChange={(e) => set("open_hour", e.target.value)} />
        </div>
        <div>
          <label className="label">Hora de cierre</label>
          <input className={field} type="time" value={form.close_hour || ""} onChange={(e) => set("close_hour", e.target.value)} />
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar datos
      </button>
    </div>
  );
}

function RendimientoTab() {
  const [range, setRange] = useState("7");
  const [data, setData] = useState(null);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = Number(range);
    const from = isoDaysAgo(days - 1);
    const to = todayLocalISO();
    setLoading(true);
    Promise.all([
      api.get("/reports/sales", { params: { from, to } }),
      api.get("/reports/top-products", { params: { from, to, limit: 5, by: "qty" } }),
    ])
      .then(([sales, top]) => {
        setData(sales.data);
        setTop(top.data);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const c = data?.current || {};
  const prev = data?.previous || {};

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
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={TrendingUp} label="Ventas" value={money(c.sales || 0)} hint="En el período" />
            <StatCard icon={Store} label="Pedidos" value={c.orders || 0} hint="Pagados" />
            <StatCard icon={Users} label="Ticket promedio" value={money(c.avg_ticket || 0)} hint="" />
            <StatCard icon={TrendingUp} label="Propinas" value={money(c.tips || 0)} hint={`${prev.sales ? ((Number(c.sales) - Number(prev.sales)) / Number(prev.sales) * 100).toFixed(1) : 0}% vs período anterior`} />
          </div>

          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Top productos (por cantidad)</h3>
            {top.length === 0 ? (
              <div className="text-sm text-ink-500">Sin ventas en este período.</div>
            ) : (
              <div className="space-y-2">
                {top.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-wine-50 text-xs font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">{i + 1}</div>
                    <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 dark:text-white">{p.name}</div>
                    <div className="shrink-0 text-sm font-bold tabular-nums text-ink-900 dark:text-white">{p.qty} uds</div>
                    <div className="shrink-0 text-xs text-ink-500 dark:text-obsidian-400">{money(p.revenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PersonalTab() {
  const [rep, setRep] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = isoDaysAgo(29);
    const to = todayLocalISO();
    Promise.all([
      api.get("/reports/delivery-by-person", { params: { from, to } }),
      api.get("/auth/users"),
    ])
      .then(([r, w]) => {
        setRep(r.data);
        setWaiters(w.data.filter((u) => u.role === "waiter"));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-ink-500">Cargando…</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Repartidores (30 días)</h3>
        {rep.length === 0 ? (
          <div className="text-sm text-ink-500">Sin repartidores.</div>
        ) : (
          <div className="space-y-2">
            {rep.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-paper-200 py-2 last:border-0 dark:border-obsidian-800">
                <div>
                  <div className="font-medium text-ink-800 dark:text-white">{r.name}</div>
                  <div className="text-xs text-ink-500 dark:text-obsidian-400">{r.deliveries || 0} entregas</div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums text-ink-900 dark:text-white">{money(r.revenue || 0)}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">A rendir {money(r.cash_to_settle || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Meseros</h3>
        {waiters.length === 0 ? (
          <div className="text-sm text-ink-500">Sin meseros.</div>
        ) : (
          <div className="space-y-2">
            {waiters.map((w) => (
              <div key={w.id} className="flex items-center justify-between border-b border-paper-200 py-2 last:border-0 dark:border-obsidian-800">
                <div>
                  <div className="font-medium text-ink-800 dark:text-white">{w.name}</div>
                  <div className="text-xs text-ink-500 dark:text-obsidian-400">@{w.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OperacionTab() {
  const [times, setTimes] = useState(null);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = isoDaysAgo(29);
    const to = todayLocalISO();
    Promise.all([
      api.get("/dashboard/business"),
      api.get("/reports/peak-hours", { params: { from, to } }),
    ])
      .then(([t, h]) => {
        setTimes(t.data);
        setHours(h.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-ink-500">Cargando…</div>;

  const fmt = (iso) => (iso ? new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—");

  const peak = hours
    .map((h) => ({ ...h, sales: Number(h.sales || 0) }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label="Primer pedido de hoy" value={fmt(times?.first_order)} />
        <StatCard icon={Clock} label="Último pedido de hoy" value={fmt(times?.last_order)} />
        <StatCard icon={Store} label="Días trabajados (mes)" value={times?.work_days_month || 0} />
        <StatCard icon={TrendingUp} label="Pedidos pagados (mes)" value={times?.paid_orders_month || 0} />
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Horarios pico (últimos 30 días)</h3>
        {peak.length === 0 ? (
          <div className="text-sm text-ink-500">Sin actividad.</div>
        ) : (
          <div className="space-y-2">
            {peak.map((p) => (
              <div key={p.hour} className="flex items-center gap-3">
                <div className="w-14 shrink-0 text-sm font-semibold tabular-nums text-ink-700 dark:text-white">
                  {String(p.hour).padStart(2, "0")}:00
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-200 dark:bg-obsidian-800">
                  <div className="h-full rounded-full bg-wine-600" style={{ width: `${(p.orders / (peak[0]?.orders || 1)) * 100}%` }} />
                </div>
                <div className="w-24 shrink-0 text-right text-xs text-ink-500 dark:text-obsidian-400">
                  {p.orders} pedidos · {money(p.sales)}
                </div>
              </div>
            ))}
          </div>
        )}
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
      <Header title="Negocio" subtitle="Cuenta, rendimiento y operación del local" />
      <div className="mb-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "cuenta", label: "Cuenta", icon: Store },
            { value: "rendimiento", label: "Rendimiento", icon: TrendingUp },
            { value: "personal", label: "Personal", icon: Users },
            { value: "operacion", label: "Operación", icon: Clock },
          ]}
        />
      </div>

      {tab === "cuenta" && <CuentaTab />}
      {tab === "rendimiento" && <RendimientoTab />}
      {tab === "personal" && <PersonalTab />}
      {tab === "operacion" && <OperacionTab />}
    </div>
  );
}