import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import { money } from "../../lib/format";
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag, Truck, Utensils,
  Clock, Users as UsersIcon, AlertCircle, Tag, Calendar, Printer,
  Receipt, Building2, CreditCard, Wallet, ShoppingBag as BagIcon,
  History,
} from "lucide-react";

const TABS = [
  { key: "summary",  label: "Resumen" },
  { key: "products", label: "Productos" },
  { key: "customers", label: "Clientes" },
  { key: "ops",      label: "Operación" },
  { key: "history",  label: "Historial" },
];

const PAYMENT_ICONS = { cash: Wallet, card: CreditCard, transfer: Building2, mixed: Receipt };
const PAYMENT_COLORS = {
  cash: "text-emerald-700 dark:text-emerald-300",
  card: "text-blue-700 dark:text-blue-300",
  transfer: "text-indigo-700 dark:text-indigo-300",
  mixed: "text-amber-700 dark:text-amber-300",
};
const PAYMENT_LABELS = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", mixed: "Mixto" };

function StatCard({ icon: Icon, label, value, sub, color = "bg-brand-50 text-brand-700", darkColor = "dark:bg-wine-900/30 dark:text-wine-300" }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} ${darkColor}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-ink-500 dark:text-obsidian-400">{label}</div>
          <div className="text-xl font-semibold text-ink-800 dark:text-obsidian-50 truncate">{value}</div>
          {sub && <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function TrendPill({ current, previous }) {
  if (!previous || Number(previous) === 0) return null;
  const diff = (Number(current) - Number(previous)) / Number(previous) * 100;
  const up = diff >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      <Icon size={12} /> {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

export default function Reports() {
  const nav = useNavigate();
  const [tab, setTab] = useState("summary");
  const [historyPeriod, setHistoryPeriod] = useState("week");

  const today = new Date().toISOString().slice(0, 10);
  const range = useMemo(() => ({ from: today, to: today, label: "Hoy" }), [today]);

  const [sales, setSales] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [neverSold, setNeverSold] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topBy, setTopBy] = useState("qty");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cashClosings, setCashClosings] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, tp, bc, ph, tc, ns] = await Promise.all([
        api.get("/reports/sales", { params: range }),
        api.get("/reports/top-products", { params: { ...range, by: topBy, limit: 10 } }),
        api.get("/reports/by-category", { params: range }),
        api.get("/reports/peak-hours", { params: range }),
        api.get("/reports/top-customers", { params: { ...range, limit: 10 } }),
        api.get("/reports/never-sold"),
      ]);
      setSales(s.data);
      setTopProducts(tp.data);
      setByCategory(bc.data);
      setPeakHours(ph.data);
      setTopCustomers(tc.data);
      setNeverSold(ns.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [range.from, range.to]);
  useEffect(() => {
    api.get("/reports/top-products", { params: { ...range, by: topBy, limit: 10 } }).then((r) => setTopProducts(r.data));
  }, [topBy, range.from, range.to]);

  const loadHistory = async (period) => {
    setHistoryLoading(true);
    try {
      const limit = period === "week" ? 7 : period === "month" ? 30 : 365;
      const [historyRes, closingsRes] = await Promise.all([
        api.get("/reports/daily-history", { params: { limit } }),
        api.get("/cash-closings", { params: { limit } }),
      ]);
      setHistory(historyRes.data);
      setCashClosings(closingsRes.data);
    } catch (e) {
      console.error("[reports] Error al cargar historial:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "history") {
      loadHistory(historyPeriod);
    }
  }, [tab, historyPeriod]);

  const peakActive = useMemo(() => peakHours.filter((h) => h.orders > 0), [peakHours]);

  return (
    <div>
      <Header
        title="Reportes"
        subtitle={tab === "history" ? "Historial de actividad" : "Hoy"}
        right={
          <button onClick={() => nav("/reports/daily")} className="btn-primary text-sm">
            <Printer size={14}/> Diario
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-paper-50 dark:bg-obsidian-900 border border-paper-300 dark:border-obsidian-700 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t.key ? "bg-brand-600 text-white" : "text-ink-600 dark:text-obsidian-200 hover:bg-paper-200 dark:hover:bg-obsidian-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-ink-500 dark:text-obsidian-400">Cargando…</div>
      ) : (
        <>
          {/* ============ TAB: RESUMEN ============ */}
          {tab === "summary" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                <StatCard
                  icon={DollarSign}
                  label="Ventas"
                  value={money(sales?.current?.sales || 0)}
                  sub={<TrendPill current={sales?.current?.sales} previous={sales?.previous?.sales} />}
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Pedidos"
                  value={sales?.current?.orders || 0}
                  sub={`${sales?.current?.delivery_orders || 0} dom · ${sales?.current?.table_orders || 0} mesa · ${sales?.current?.pickup_orders || 0} llevar`}
                  color="bg-amber-50 text-amber-700" darkColor="dark:bg-amber-900/30 dark:text-amber-300"
                />
                <StatCard
                  icon={Tag}
                  label="Ticket promedio"
                  value={money(sales?.current?.avg_ticket || 0)}
                  color="bg-indigo-50 text-indigo-700" darkColor="dark:bg-indigo-900/30 dark:text-indigo-300"
                />
                <StatCard
                  icon={Truck}
                  label="Domicilios"
                  value={money(sales?.delivery_gains?.total || 0)}
                  sub={`${sales?.delivery_gains?.count || 0} pedidos`}
                  color="bg-sky-50 text-sky-700" darkColor="dark:bg-sky-900/30 dark:text-sky-300"
                />
                <StatCard
                  icon={BagIcon}
                  label="Para llevar"
                  value={sales?.current?.pickup_orders || 0}
                  sub="pedidos pickup"
                  color="bg-amber-50 text-amber-700" darkColor="dark:bg-amber-900/30 dark:text-amber-300"
                />
                <StatCard
                  icon={Utensils}
                  label="Mesas"
                  value={sales?.current?.table_orders || 0}
                  sub="pedidos en mesa"
                  color="bg-sky-50 text-sky-700" darkColor="dark:bg-sky-900/30 dark:text-sky-300"
                />
              </div>

              {/* Métodos de pago */}
              {sales?.days?.length > 0 && (
                <div className="card p-4 mb-4">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3 flex items-center gap-2">
                    <Receipt size={16}/> Ingresos por método de pago
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["cash", "card", "transfer", "mixed"].map((m) => {
                      const Icon = PAYMENT_ICONS[m];
                      const total = sales.days.reduce((s, d) => {
                        const methodData = d.payment_methods || {};
                        return s + Number(methodData[m] || 0);
                      }, 0);
                      return (
                        <div key={m} className="flex items-center gap-2 p-3 rounded-xl bg-paper-100 dark:bg-obsidian-800">
                          <Icon size={16} className={PAYMENT_COLORS[m]} />
                          <div>
                            <div className="text-xs text-ink-500 dark:text-obsidian-400">{PAYMENT_LABELS[m]}</div>
                            <div className={`text-sm font-bold ${PAYMENT_COLORS[m]}`}>{money(total)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gráfico de ventas por día */}
              {sales?.days?.length > 0 && (
                <div className="card p-4 mb-4">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">Ventas por día</h3>
                  <BarChart
                    data={sales.days.map((d) => ({
                      label: new Date(d.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
                      value: Number(d.sales),
                    }))}
                    maxBars={31}
                  />
                </div>
              )}

              {/* Comparativa */}
              {sales && (
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3 flex items-center gap-2">
                    <TrendingUp size={16}/> Comparativa con período anterior
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-ink-500 dark:text-obsidian-400">Período actual</div>
                      <div className="text-xl font-bold text-ink-800 dark:text-obsidian-50">{money(sales.current.sales)}</div>
                      <div className="text-xs text-ink-400">{sales.current.orders} pedidos</div>
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-obsidian-400">Período anterior</div>
                      <div className="text-xl font-bold text-ink-500 dark:text-obsidian-400">{money(sales.previous?.sales || 0)}</div>
                      <div className="text-xs text-ink-400">{sales.previous?.orders || 0} pedidos</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-paper-200 dark:border-obsidian-800">
                    <TrendPill current={sales.current.sales} previous={sales.previous?.sales} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ TAB: PRODUCTOS ============ */}
          {tab === "products" && (
            <>
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100">Top productos</h3>
                  <div className="flex gap-1">
                    {[{ v: "qty", l: "Cantidad" }, { v: "revenue", l: "Ganancia" }].map((t) => (
                      <button
                        key={t.v}
                        onClick={() => setTopBy(t.v)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          topBy === t.v ? "bg-brand-600 text-white" : "text-ink-600 dark:text-obsidian-200 hover:bg-paper-200 dark:hover:bg-obsidian-800"
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                {topProducts.length === 0 ? (
                  <div className="text-sm text-ink-400 dark:text-obsidian-500 text-center py-6">Sin ventas en el período.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-ink-500 dark:text-obsidian-400 border-b border-paper-300 dark:border-obsidian-800">
                        <tr>
                          <th className="py-2 pr-3 font-medium">#</th>
                          <th className="py-2 pr-3 font-medium">Producto</th>
                          <th className="py-2 pr-3 font-medium">Categoría</th>
                          <th className="py-2 pr-3 font-medium text-right">Cantidad</th>
                          <th className="py-2 pr-3 font-medium text-right">Pedidos</th>
                          <th className="py-2 pl-3 font-medium text-right">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={i} className="border-b border-paper-200 dark:border-obsidian-800">
                            <td className="py-2 pr-3 text-ink-400 dark:text-obsidian-500">{i + 1}</td>
                            <td className="py-2 pr-3 font-medium text-ink-800 dark:text-obsidian-50">{p.name}</td>
                            <td className="py-2 pr-3 text-ink-500 dark:text-obsidian-400">{p.category || "—"}</td>
                            <td className="py-2 pr-3 text-right font-semibold">{p.qty}</td>
                            <td className="py-2 pr-3 text-right text-ink-500 dark:text-obsidian-400">{p.orders_count}</td>
                            <td className="py-2 pl-3 text-right font-semibold text-brand-700 dark:text-wine-300">{money(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Productos nunca vendidos */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3 flex items-center gap-2">
                  <AlertCircle size={16}/> Productos nunca vendidos
                </h3>
                {neverSold.length === 0 ? (
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 text-center py-4">¡Todo el catálogo se ha vendido!</div>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {neverSold.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-paper-200 dark:border-obsidian-800 last:border-0">
                        <div>
                          <div className="font-medium text-ink-800 dark:text-obsidian-50">{p.name}</div>
                          <div className="text-xs text-ink-500 dark:text-obsidian-400">{p.category || "Sin categoría"}</div>
                        </div>
                        <span className="text-xs text-ink-500 dark:text-obsidian-400">{money(p.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============ TAB: CLIENTES ============ */}
          {tab === "customers" && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3 flex items-center gap-2">
                <UsersIcon size={16}/> Clientes más frecuentes
              </h3>
              {topCustomers.length === 0 ? (
                <div className="text-sm text-ink-400 dark:text-obsidian-500 text-center py-6">Sin clientes en el período.</div>
              ) : (
                <div className="space-y-1.5">
                  {topCustomers.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-paper-200 dark:border-obsidian-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-ink-400 dark:text-obsidian-500 text-xs text-right">{i + 1}</span>
                        <div>
                          <div className="font-medium text-ink-800 dark:text-obsidian-50">{c.name}</div>
                          <div className="text-xs text-ink-500 dark:text-obsidian-400">
                            {c.orders_count} pedidos {c.neighborhood && `· ${c.neighborhood}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand-700 dark:text-wine-300">{money(c.total_spent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB: OPERACIÓN ============ */}
          {tab === "ops" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Horarios pico - compacto con barras verticales */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-1 flex items-center gap-2">
                  <Clock size={16}/> Horarios pico
                </h3>
                <p className="text-[11px] text-ink-500 dark:text-obsidian-400 mb-3">Pedidos por hora del día</p>
                {peakActive.length === 0 ? (
                  <div className="text-sm text-ink-400 dark:text-obsidian-500 text-center py-6">Sin datos de horas.</div>
                ) : (
                  <BarChart
                    data={peakActive.map((h) => ({
                      label: `${String(h.hour).padStart(2, "0")}h`,
                      value: h.orders,
                      sales: Number(h.sales),
                    }))}
                    vertical
                    maxBars={14}
                    height={160}
                    barColor="bg-amber-500 dark:bg-amber-400"
                  />
                )}
              </div>

              {/* Ventas por categoría */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-1 flex items-center gap-2">
                  <Tag size={16}/> Ventas por categoría
                </h3>
                <p className="text-[11px] text-ink-500 dark:text-obsidian-400 mb-3">Ingresos por categoría</p>
                <BarChart
                  data={byCategory.map((c) => ({
                    label: c.category,
                    value: Number(c.revenue),
                  }))}
                  maxBars={10}
                />
              </div>
            </div>
          )}

          {/* ============ TAB: HISTORIAL ============ */}
          {tab === "history" && (
            <>
              {/* Selector de período */}
              <div className="flex gap-1 mb-4 bg-paper-50 dark:bg-obsidian-900 border border-paper-300 dark:border-obsidian-700 rounded-xl p-1 w-fit">
                {[
                  { v: "week",  l: "Semana" },
                  { v: "month", l: "Mes" },
                  { v: "year",  l: "Año" },
                ].map((t) => (
                  <button
                    key={t.v}
                    onClick={() => setHistoryPeriod(t.v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      historyPeriod === t.v ? "bg-brand-600 text-white" : "text-ink-600 dark:text-obsidian-200 hover:bg-paper-200 dark:hover:bg-obsidian-800"
                    }`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>

              {historyLoading ? (
                <div className="text-sm text-ink-500 dark:text-obsidian-400">Cargando historial…</div>
              ) : history.length === 0 ? (
                <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">
                  <Calendar size={32} className="mx-auto text-ink-300 dark:text-obsidian-300 mb-2"/>
                  No hay actividad registrada en este período.
                </div>
              ) : (
                <>
                  {/* Resumen del período */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <StatCard
                      icon={DollarSign}
                      label="Ventas totales"
                      value={money(history.reduce((s, h) => s + Number(h.sales), 0))}
                    />
                    <StatCard
                      icon={TrendingDown}
                      label="Gastos totales"
                      value={money(history.reduce((s, h) => s + Number(h.expenses), 0))}
                      color="bg-rose-50 text-rose-700" darkColor="dark:bg-rose-900/30 dark:text-rose-300"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Ganancia neta"
                      value={money(history.reduce((s, h) => s + Number(h.net), 0))}
                      color="bg-emerald-50 text-emerald-700" darkColor="dark:bg-emerald-900/30 dark:text-emerald-300"
                    />
                    <StatCard
                      icon={ShoppingBag}
                      label="Órdenes totales"
                      value={history.reduce((s, h) => s + h.orders, 0)}
                      color="bg-amber-50 text-amber-700" darkColor="dark:bg-amber-900/30 dark:text-amber-300"
                    />
                  </div>

                  {/* Gráfico de ventas por día */}
                  <div className="card p-4 mb-4">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">Ventas por día</h3>
                    <BarChart
                      data={history.map((h) => ({
                        label: new Date(h.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
                        value: Number(h.sales),
                      }))}
                      maxBars={historyPeriod === "week" ? 7 : historyPeriod === "month" ? 30 : 52}
                    />
                  </div>

                  {/* Tabla de días */}
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-paper-100 dark:bg-obsidian-950 text-ink-600 dark:text-obsidian-200 text-xs uppercase">
                          <tr>
                            <th className="text-left px-4 py-2.5">Fecha</th>
                            <th className="text-right px-4 py-2.5">Órdenes</th>
                            <th className="text-right px-4 py-2.5">Ventas</th>
                            <th className="text-right px-4 py-2.5">Gastos</th>
                            <th className="text-right px-4 py-2.5">Neto</th>
                            <th className="text-center px-4 py-2.5">Tipos</th>
                            <th className="text-center px-4 py-2.5">Corte</th>
                            <th className="px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => {
                            const hasClosing = cashClosings.some((c) => c.closing_date === h.date);
                            return (
                              <tr key={h.date} className="border-t border-paper-200 dark:border-obsidian-800 hover:bg-paper-50 dark:hover:bg-obsidian-900/50 cursor-pointer" onClick={() => nav(`/reports/daily?date=${h.date}`)}>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-ink-800 dark:text-obsidian-50">{new Date(h.date).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{h.orders}</td>
                                <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-medium">{money(h.sales)}</td>
                                <td className="px-4 py-3 text-right text-rose-700 dark:text-rose-400">{money(h.expenses)}</td>
                                <td className={`px-4 py-3 text-right font-bold ${Number(h.net) >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                                  {money(h.net)}
                                </td>
                                <td className="px-4 py-3 text-center text-xs text-ink-500 dark:text-obsidian-400">
                                  <span title="Mesas">🪑{h.table_count}</span>{" · "}
                                  <span title="Domicilios">🛵{h.delivery_count}</span>{" · "}
                                  <span title="Pickup">📦{h.pickup_count}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {hasClosing ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                                      ✅ Cerrado
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); nav(`/cashier/closing?date=${h.date}`); }}
                                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                                    >
                                      Abrir corte
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Printer size={14} className="text-ink-400 dark:text-obsidian-500"/>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
