import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Header from "../components/Header";
import { useAuth } from "../store/auth";
import { money, statusLabels, statusColors } from "../lib/format";
import { todayLocalISO } from "../lib/date";
import { useLiveRefresh } from "../lib/useLiveRefresh";
import {
  DollarSign,
  ShoppingBag,
  Utensils,
  Receipt,
  Clock,
  PackageCheck,
  Bike,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChefHat,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Package,
  Star,
} from "lucide-react";

/* ── Shared UI ─────────────────────────────────────────────── */

function SectionTitle({ title, hint }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold uppercase tracking-widest text-ink-700 dark:text-white">
        {title}
      </h2>
      {hint && (
        <p className="mt-0.5 text-xs text-ink-600 dark:text-white/90">{hint}</p>
      )}
    </div>
  );
}

function Trend({ current, previous }) {
  if (!previous || Number(previous) === 0) return null;
  const diff = ((Number(current) - Number(previous)) / Number(previous)) * 100;
  const up = diff >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        up
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-rose-700 dark:text-rose-300"
      }`}
    >
      <Icon size={12} /> {Math.abs(diff).toFixed(1)}% vs ayer
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "bg-wine-50 text-wine-700",
  darkColor = "dark:bg-wine-900/40 dark:text-wine-300",
  to,
  valueClass = "text-ink-900 dark:text-white",
}) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} ${darkColor}`}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
            {label}
          </div>
          <div
            className={`mt-0.5 truncate text-2xl font-bold tabular-nums sm:text-[1.65rem] ${valueClass}`}
          >
            {value}
          </div>
        </div>
      </div>
      {hint && (
        <div className="mt-3 text-xs leading-relaxed text-ink-600 dark:text-white">
          {hint}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="card group block p-4 transition hover:border-wine-400 hover:shadow-pop dark:hover:border-wine-500/40 sm:p-5"
      >
        {body}
      </Link>
    );
  }

  return <div className="card p-4 sm:p-5">{body}</div>;
}

function OpCard({
  to,
  icon: Icon,
  label,
  value,
  hint,
  color,
  darkColor,
  alert = false,
}) {
  return (
    <Link
      to={to}
      className={`card group block p-4 transition hover:shadow-pop ${
        alert
          ? "border-amber-400 bg-amber-50/80 ring-1 ring-amber-300/60 dark:border-amber-600 dark:bg-amber-900/25 dark:ring-amber-700/40"
          : "hover:border-wine-400 dark:hover:border-wine-500/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color} ${darkColor}`}
          >
            <Icon size={18} />
          </div>
          <span className="truncate text-xs font-semibold text-ink-700 dark:text-white">
            {label}
          </span>
        </div>
        {alert && (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/20 dark:text-white">
            Atención
          </span>
        )}
      </div>
      <div className="text-3xl font-bold tabular-nums text-ink-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-600 dark:text-white">{hint}</span>
        <ArrowRight
          size={14}
          className="shrink-0 text-ink-400 opacity-0 transition group-hover:opacity-100 dark:text-white/70"
        />
      </div>
    </Link>
  );
}

function KpiSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-ink-200 dark:bg-obsidian-700" />
        <div className="flex-1">
          <div className="mb-2 h-3 w-20 rounded bg-ink-200 dark:bg-obsidian-700" />
          <div className="h-6 w-16 rounded bg-ink-200 dark:bg-obsidian-700" />
        </div>
      </div>
      <div className="mt-3 h-2 w-24 rounded bg-ink-100 dark:bg-obsidian-800" />
    </div>
  );
}

function ChannelBars({ delivery = 0, table = 0, pickup = 0 }) {
  const total = delivery + table + pickup;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const rows = [
    { label: "Domicilios", n: delivery, bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
    { label: "Mesas", n: table, bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
    { label: "Para llevar", n: pickup, bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
          Canales del día
        </h3>
        <span className="text-xs font-medium text-ink-600 dark:text-white">
          {total} pedido{total === 1 ? "" : "s"}
        </span>
      </div>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-ink-600 dark:text-white">
          Aún no hay pedidos cobrados hoy
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-800 dark:text-white">{r.label}</span>
                <span className={`font-semibold tabular-nums ${r.text}`}>
                  {r.n} · {pct(r.n)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-200 dark:bg-obsidian-800">
                <div
                  className={`h-full rounded-full ${r.bar} transition-all`}
                  style={{ width: `${pct(r.n)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin ─────────────────────────────────────────────────── */

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);
  const load = async () => {
    if (!hasLoaded.current) setLoading(true);
    try {
      try {
        const d = await api.get("/dashboard/summary");
        setData(d.data);
      } catch (e) {
        console.error("[dashboard] Error al cargar resumen:", e);
      }
      try {
        const exp = await api.get("/expenses/summary", {
          params: { date: todayLocalISO() },
        });
        setExpensesData(exp.data);
      } catch (e) {
        console.error("[dashboard] Error al cargar gastos:", e);
      }
      try {
        const inv = await api.get("/inventory");
        setLowStockCount(inv.data.filter((p) => p.low_stock).length);
      } catch (e) {
        console.error("[dashboard] Error al cargar inventario:", e);
      }
      try {
        const top = await api.get("/reports/top-products", {
          params: {
            from: todayLocalISO(),
            to: todayLocalISO(),
            limit: 5,
            by: "qty",
          },
        });
        setTopProducts(top.data);
      } catch (e) {
        console.error("[dashboard] Error al cargar top productos:", e);
      }
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useLiveRefresh(load, { intervalMs: 5000 });

  const t = data?.today || {};
  const o = data?.op || {};
  const dateLabel = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading && !data) {
    return (
      <div>
        <Header title="Resumen del día" subtitle="Cargando vista del restaurant…" />
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="mb-3 h-4 w-40 rounded bg-ink-200 dark:bg-obsidian-700 animate-pulse" />
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card h-48 animate-pulse lg:col-span-2" />
          <div className="card h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Resumen del día"
        subtitle={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
        right={
          <button
            onClick={load}
            className="btn-ghost h-9 w-9 p-0"
            title="Refrescar"
            type="button"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* 1. Dinero del día */}
      <SectionTitle
        title="Dinero del día"
        hint="Ventas, gastos y pedidos cobrados hoy"
      />
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Ventas"
          value={money(t.total_sales || 0)}
          hint={<Trend current={t.total_sales} previous={data?.yesterday_sales} />}
        />
        <KpiCard
          icon={TrendingDown}
          label="Gastos"
          value={money(expensesData?.total_expenses || 0)}
          hint={`${expensesData?.expense_count || 0} registrado(s) · ver detalle`}
          color="bg-rose-50 text-rose-700"
          darkColor="dark:bg-rose-900/30 dark:text-rose-300"
          valueClass="text-rose-700 dark:text-rose-300"
          to="/admin/expenses"
        />
        <KpiCard
          icon={TrendingUp}
          label="Neto"
          value={money(expensesData?.net ?? 0)}
          hint={`${money(expensesData?.total_sales || 0)} − ${money(expensesData?.total_expenses || 0)}`}
          color="bg-emerald-50 text-emerald-700"
          darkColor="dark:bg-emerald-900/30 dark:text-emerald-300"
          valueClass="text-emerald-700 dark:text-emerald-300"
        />
        <KpiCard
          icon={Receipt}
          label="Pedidos"
          value={t.orders_count || 0}
          hint={
            <>
              Ticket prom.{" "}
              <span className="font-semibold text-ink-800 dark:text-white">
                {money(t.avg_ticket || 0)}
              </span>
            </>
          }
          color="bg-amber-50 text-amber-700"
          darkColor="dark:bg-amber-900/30 dark:text-amber-300"
        />
      </div>

      {/* 2. Atención ahora */}
      <SectionTitle
        title="Atención ahora"
        hint="Lo que está en curso y necesita acción"
      />

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
        En preparación
        {(o.preparing || 0) > 0 && (
          <span className="ml-2 font-normal normal-case tracking-normal text-ink-500 dark:text-obsidian-400">
            · total cocina {o.preparing}
          </span>
        )}
      </p>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OpCard
          to="/tables"
          icon={Utensils}
          label="Mesas"
          value={o.preparing_tables || 0}
          hint="En cocina · ir a mesas"
          color="bg-blue-50 text-blue-700"
          darkColor="dark:bg-blue-900/30 dark:text-blue-300"
          alert={(o.preparing_tables || 0) > 0}
        />
        <OpCard
          to="/delivery"
          icon={Bike}
          label="Domicilios"
          value={o.preparing_delivery || 0}
          hint="En cocina · ir a domicilios"
          color="bg-blue-50 text-blue-700"
          darkColor="dark:bg-blue-900/30 dark:text-blue-300"
          alert={(o.preparing_delivery || 0) > 0}
        />
        <OpCard
          to="/pickup"
          icon={ShoppingBag}
          label="Para llevar"
          value={o.preparing_pickup || 0}
          hint="En cocina · ir a para llevar"
          color="bg-blue-50 text-blue-700"
          darkColor="dark:bg-blue-900/30 dark:text-blue-300"
          alert={(o.preparing_pickup || 0) > 0}
        />
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
        Domicilios · reparto
      </p>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <OpCard
          to="/delivery"
          icon={AlertCircle}
          label="Sin asignar"
          value={o.pending_to_assign || 0}
          hint="En cocina sin repartidor"
          color="bg-amber-50 text-amber-700"
          darkColor="dark:bg-amber-900/30 dark:text-amber-300"
          alert={(o.pending_to_assign || 0) > 0}
        />
        <OpCard
          to="/delivery"
          icon={Bike}
          label="En camino"
          value={o.on_the_way || 0}
          hint="Repartidores en la calle"
          color="bg-indigo-50 text-indigo-700"
          darkColor="dark:bg-indigo-900/30 dark:text-indigo-300"
          alert={(o.on_the_way || 0) > 0}
        />
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
        Local e inventario
      </p>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <OpCard
          to="/tables"
          icon={Utensils}
          label="Mesas activas"
          value={o.active_tables || 0}
          hint="Con cuenta abierta"
          color="bg-rose-50 text-rose-700"
          darkColor="dark:bg-rose-900/30 dark:text-rose-300"
        />
        <OpCard
          to="/cashier"
          icon={PackageCheck}
          label="Por cobrar"
          value={o.ready_to_pay || 0}
          hint={
            (o.ready_to_pay || 0) > 0
              ? "Marcadas listas por el mesero"
              : (o.active_tables || 0) > 0
                ? `${o.active_tables} mesa${o.active_tables === 1 ? "" : "s"} aún en curso`
                : "Nada listo en caja"
          }
          color="bg-sky-50 text-sky-700"
          darkColor="dark:bg-sky-900/30 dark:text-sky-300"
          alert={(o.ready_to_pay || 0) > 0}
        />
        <OpCard
          to="/admin/inventory"
          icon={Package}
          label="Stock bajo"
          value={lowStockCount}
          hint="Productos por reordenar"
          color="bg-rose-50 text-rose-700"
          darkColor="dark:bg-rose-900/30 dark:text-rose-300"
          alert={lowStockCount > 0}
        />
      </div>

      {/* 3. Del día */}
      <SectionTitle
        title="Del día"
        hint="Qué se vendió más y por qué canal"
      />
      <div className="mb-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                Top productos
              </h3>
              <Link
                to="/reports"
                className="inline-flex items-center gap-1 text-xs font-semibold text-wine-700 hover:underline dark:text-wine-300"
              >
                Reportes <ArrowRight size={12} />
              </Link>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-wine-50 text-xs font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-ink-600 dark:text-white">
                        {p.category}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold tabular-nums text-ink-900 dark:text-white">
                        {p.qty} uds
                      </div>
                      <div className="text-[11px] text-ink-600 dark:text-white">
                        {money(p.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Star
                  size={32}
                  className="mx-auto mb-2 text-ink-300 dark:text-white/40"
                />
                <div className="text-sm font-medium text-ink-700 dark:text-white">
                  Sin ventas registradas hoy
                </div>
                <div className="mt-1 text-xs text-ink-600 dark:text-white">
                  Los más vendidos aparecerán aquí
                </div>
              </div>
            )}
          </div>
        </div>
        <ChannelBars
          delivery={t.delivery_count || 0}
          table={t.table_count || 0}
          pickup={t.pickup_count || 0}
        />
      </div>
    </div>
  );
}

/* ── Waiter ────────────────────────────────────────────────── */

function WaiterHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);
  const load = async () => {
    if (!hasLoaded.current) setLoading(true);
    try {
      try {
        const d = await api.get("/dashboard/summary");
        setData(d.data);
      } catch (e) {
        console.error("[waiter] Error al cargar resumen:", e);
      }
      try {
        const t = await api.get("/tables");
        setTables(t.data);
      } catch (e) {
        console.error("[waiter] Error al cargar mesas:", e);
      }
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useLiveRefresh(load, { intervalMs: 4000 });

  const my = data?.my || {};
  const today = data?.today || {};
  const noTables = (user?.assigned_table_ids || []).length === 0;

  return (
    <div>
      <Header
        title={`Hola, ${user?.name?.split(" ")[0] || "mesero"}`}
        subtitle="Tu turno de hoy"
        right={
          <button
            onClick={load}
            className="btn-ghost h-9 w-9 p-0"
            title="Refrescar"
            type="button"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {noTables && (
        <div className="card mb-6 border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-white">
              <Utensils size={18} />
            </div>
            <div>
              <div className="font-semibold text-amber-950 dark:text-white">
                No tienes mesas asignadas
              </div>
              <p className="mt-1 text-sm text-amber-900 dark:text-white">
                Pedile al cajero que te asigne mesas en{" "}
                <b>Personal → Asignaciones</b>. Mientras tanto no podrás tomar
                pedidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mesas primero */}
      {!noTables && tables.length > 0 && (
        <div className="mb-8">
          <SectionTitle
            title="Tus mesas"
            hint="Tocá una mesa para abrir el pedido"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tables.map((tbl) => {
              const occ = !!tbl.current_order_id;
              const status = tbl.current_order_status;
              const readyToPay = status === "ready_to_pay";
              const preparing = status === "preparing";
              return (
                <Link
                  key={tbl.id}
                  to={`/tables?open=${tbl.id}`}
                  className={`card block p-3 transition hover:shadow-pop ${
                    readyToPay
                      ? "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/25"
                      : preparing
                        ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/25"
                        : occ
                          ? "border-rose-200 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-900/25"
                          : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-ink-900 dark:text-white">
                      Mesa {tbl.number}
                    </div>
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        readyToPay
                          ? "bg-amber-500"
                          : preparing
                            ? "bg-blue-500"
                            : occ
                              ? "bg-rose-500"
                              : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  {occ ? (
                    <div className="mt-1">
                      <div className="text-xs text-ink-700 dark:text-white">
                        {tbl.current_order_items || 0} productos
                      </div>
                      <div className="font-semibold tabular-nums text-ink-900 dark:text-white">
                        {money(tbl.current_order_total || 0)}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`badge ${statusColors[status] || ""}`}
                        >
                          {statusLabels[status] || ""}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-xs font-medium text-emerald-800 dark:text-white">
                      Libre
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs personales */}
      <SectionTitle title="Ahora" hint="Estado de tus mesas en el turno" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-white">
            <Utensils size={14} /> Mis mesas
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {my.assigned_count || 0}
          </div>
        </div>
        <div className="card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-white">
            <ChefHat size={14} /> Abiertas
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {my.open_count || 0}
          </div>
        </div>
        <div
          className={`card p-4 ${
            (my.ready_to_pay || 0) > 0
              ? "border-amber-400 bg-amber-50/80 dark:border-amber-600 dark:bg-amber-900/25"
              : ""
          }`}
        >
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-white">
            <CheckCircle2 size={14} /> Por cobrar
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {my.ready_to_pay || 0}
          </div>
        </div>
        <div className="card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-white">
            <ShoppingBag size={14} /> En juego
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {money(my.open_amount || 0)}
          </div>
        </div>
      </div>

      {/* Mi turno */}
      <SectionTitle title="Mi turno" hint="Cuentas ya cerradas hoy" />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs font-semibold text-ink-600 dark:text-white">
            Cuentas cerradas
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-ink-900 dark:text-white">
            {today.closed_count || 0}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-ink-600 dark:text-white">
            Total vendido
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {money(today.total_sold || 0)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-ink-600 dark:text-white">
            Ticket promedio
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-ink-900 dark:text-white">
            {money(today.avg_ticket || 0)}
          </div>
        </div>
      </div>

      {/* Accesos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/tables"
          className="card group flex items-center justify-between p-4 transition hover:shadow-pop sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              <Utensils size={20} />
            </div>
            <div>
              <div className="font-semibold text-ink-900 dark:text-white">
                Ir a mis mesas
              </div>
              <div className="text-xs text-ink-600 dark:text-white">
                Pedidos y cuentas
              </div>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-ink-400 transition group-hover:text-wine-600 dark:text-white/70"
          />
        </Link>
        <Link
          to="/menu"
          className="card group flex items-center justify-between p-4 transition hover:shadow-pop sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="font-semibold text-ink-900 dark:text-white">
                Ver catálogo
              </div>
              <div className="text-xs text-ink-600 dark:text-white">
                Productos y precios
              </div>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-ink-400 transition group-hover:text-wine-600 dark:text-white/70"
          />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "waiter") return <WaiterHome />;
  return <AdminDashboard />;
}
