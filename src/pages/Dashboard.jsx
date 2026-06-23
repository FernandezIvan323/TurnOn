import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Header from "../components/Header";
import { useAuth } from "../store/auth";
import { money, formatTime, statusLabels, statusColors } from "../lib/format";
import { todayLocalISO } from "../lib/date";
import {
  DollarSign, ShoppingBag, Utensils, Receipt, Clock,
  PackageCheck, Bike, AlertCircle, RefreshCw, TrendingUp, TrendingDown,
  ChefHat, CheckCircle2, BookOpen, ArrowRight, Package, Star,
} from "lucide-react";

function Stat({ icon: Icon, label, value, hint, color = "bg-brand-50 text-brand-700", darkColor = "dark:bg-wine-900/30 dark:text-wine-300" }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} ${darkColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm text-ink-500 dark:text-obsidian-400">{label}</div>
          <div className="text-2xl font-semibold text-ink-800 dark:text-obsidian-50">{value}</div>
        </div>
      </div>
      {hint && <div className="text-xs text-ink-400 dark:text-obsidian-500 mt-3">{hint}</div>}
    </div>
  );
}

function Trend({ current, previous }) {
  if (!previous || Number(previous) === 0) return null;
  const diff = (Number(current) - Number(previous)) / Number(previous) * 100;
  const up = diff >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      <Icon size={12} /> {Math.abs(diff).toFixed(1)}% vs ayer
    </span>
  );
}

function StatSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-ink-200 dark:bg-obsidian-700" />
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-ink-200 dark:bg-obsidian-700 mb-2" />
          <div className="h-6 w-16 rounded bg-ink-200 dark:bg-obsidian-700" />
        </div>
      </div>
      <div className="h-2 w-24 rounded bg-ink-100 dark:bg-obsidian-800 mt-3" />
    </div>
  );
}

function TopProductsSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 w-40 rounded bg-ink-200 dark:bg-obsidian-700 mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-5 h-5 rounded bg-ink-200 dark:bg-obsidian-700" />
          <div className="flex-1 h-3 rounded bg-ink-200 dark:bg-obsidian-700" />
          <div className="h-3 w-8 rounded bg-ink-200 dark:bg-obsidian-700" />
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      try {
        const d = await api.get("/dashboard/summary");
        setData(d.data);
      } catch (e) {
        console.error("[dashboard] Error al cargar resumen:", e);
      }
      try {
        const exp = await api.get("/expenses/summary", { params: { date: todayLocalISO() } });
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
        const top = await api.get("/reports/top-products", { params: { from: todayLocalISO(), to: todayLocalISO(), limit: 5, by: "qty" } });
        setTopProducts(top.data);
      } catch (e) {
        console.error("[dashboard] Error al cargar top productos:", e);
      }
    } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);
  const t = data?.today || {};
  const o = data?.op || {};

  if (loading && !data) {
    return (
      <div>
        <Header title="Resumen del día" subtitle="Vista general del restaurant" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[1, 2].map((i) => <StatSkeleton key={i} />)}
        </div>
        <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
          Operación en tiempo real
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><TopProductsSkeleton /></div>
          <div className="card p-5 animate-pulse">
            <div className="h-4 w-32 rounded bg-ink-200 dark:bg-obsidian-700 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-ink-100 dark:border-obsidian-800 last:border-0">
                <div className="h-3 w-20 rounded bg-ink-200 dark:bg-obsidian-700" />
                <div className="h-3 w-10 rounded bg-ink-200 dark:bg-obsidian-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Resumen del día"
        subtitle="Vista general del restaurant"
        right={
          <button onClick={load} className="btn-ghost w-9 h-9 p-0" title="Refrescar">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* Fila 1: KPIs financieros principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Stat icon={DollarSign} label="Ventas hoy" value={money(t.total_sales || 0)} hint={<Trend current={t.total_sales} previous={data?.yesterday_sales} />} />
        <Stat icon={TrendingUp} label="Ganancia neta" value={money((expensesData?.net ?? 0))} hint={`${money(expensesData?.total_sales || 0)} ventas - ${money(expensesData?.total_expenses || 0)} gastos`} color="bg-emerald-50 text-emerald-700" darkColor="dark:bg-emerald-900/30 dark:text-emerald-300" />
        <Stat icon={ShoppingBag} label="Ticket promedio" value={money(t.avg_ticket || 0)} hint="Promedio por pedido" color="bg-indigo-50 text-indigo-700" darkColor="dark:bg-indigo-900/30 dark:text-indigo-300" />
      </div>

      {/* Fila 2: KPIs secundarios — centrados, pirámide invertida */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="w-72">
          <Stat icon={Receipt} label="Pedidos cobrados" value={t.orders_count || 0} hint={`${t.delivery_count || 0} domicilios · ${t.table_count || 0} mesas · ${t.pickup_count || 0} llevar`} color="bg-amber-50 text-amber-700" darkColor="dark:bg-amber-900/30 dark:text-amber-300" />
        </div>
        <div className="w-72">
          <Link to="/admin/expenses" className="card p-5 hover:shadow-pop transition group block">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                <TrendingDown size={20} />
              </div>
              <div>
                <div className="text-sm text-ink-500 dark:text-obsidian-400">Gastos hoy</div>
                <div className="text-2xl font-semibold text-rose-700 dark:text-rose-400">{money(expensesData?.total_expenses || 0)}</div>
              </div>
            </div>
            <div className="text-xs text-ink-400 dark:text-obsidian-500 mt-3">
              {expensesData?.expense_count || 0} gasto(s) · click para ver
            </div>
          </Link>
        </div>
      </div>

      {/* Operación en tiempo real */}
      <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
        Operación en tiempo real
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center"><AlertCircle size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">Sin asignar</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{o.pending_to_assign || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Domicilios esperando repartidor</div>
        </Link>
        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center"><Clock size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">En preparación</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{o.preparing || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Cocinándose</div>
        </Link>
        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center"><Bike size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">En camino</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{o.on_the_way || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Repartidores en la calle</div>
        </Link>
        <Link to="/tables" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center"><Utensils size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">Mesas activas</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{o.active_tables || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Con clientes en la acera</div>
        </Link>
        <Link to="/cashier" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 flex items-center justify-center"><PackageCheck size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">Por cobrar</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{o.ready_to_pay || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Cuentas listas</div>
        </Link>
        <Link to="/admin/inventory" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center"><Package size={18} /></div>
            <span className="text-xs text-ink-500 dark:text-obsidian-400">Stock bajo</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{lowStockCount}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Productos por reordenar</div>
        </Link>
      </div>

      {/* Bottom: Top productos + Resumen rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Top productos */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
            Top productos del día
          </h2>
          <div className="card p-5">
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 dark:bg-wine-900/30 dark:text-wine-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-800 dark:text-obsidian-50 truncate">{p.name}</div>
                      <div className="text-[11px] text-ink-400 dark:text-obsidian-500">{p.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-ink-800 dark:text-obsidian-50">{p.qty} uds</div>
                      <div className="text-[11px] text-ink-400 dark:text-obsidian-500">{money(p.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Star size={32} className="mx-auto text-ink-300 dark:text-obsidian-600 mb-2" />
                <div className="text-sm text-ink-400 dark:text-obsidian-500">Sin ventas registradas hoy</div>
                <div className="text-xs text-ink-300 dark:text-obsidian-600 mt-1">Los productos más vendidos aparecerán aquí</div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen rápido */}
        <div>
          <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
            Resumen rápido
          </h2>
          <div className="card p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-obsidian-800">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Total pedidos</span>
                <span className="text-sm font-semibold text-ink-800 dark:text-obsidian-50">{t.orders_count || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-obsidian-800">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Domicilios</span>
                <span className="text-sm font-semibold text-ink-800 dark:text-obsidian-50">{t.delivery_count || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-obsidian-800">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Mesas</span>
                <span className="text-sm font-semibold text-ink-800 dark:text-obsidian-50">{t.table_count || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-obsidian-800">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Llevar</span>
                <span className="text-sm font-semibold text-ink-800 dark:text-obsidian-50">{t.pickup_count || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Ticket promedio</span>
                <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">{money(t.avg_ticket || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function WaiterHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
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
    } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const i = setInterval(load, 30_000);
    return () => clearInterval(i);
  }, []);

  const my = data?.my || {};
  const today = data?.today || {};
  const noTables = (user?.assigned_table_ids || []).length === 0;

  return (
    <div>
      <Header
        title={`Hola, ${user?.name?.split(" ")[0] || "mesero"}`}
        subtitle="Tu turno de hoy"
        right={
          <button onClick={load} className="btn-ghost w-9 h-9 p-0" title="Refrescar">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {noTables && (
        <div className="card p-6 mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Utensils size={18}/>
            </div>
            <div>
              <div className="font-semibold text-amber-900 dark:text-amber-200">No tienes mesas asignadas</div>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Pídele al cajero que te asigne mesas desde <b>Personal → Asignaciones</b>.
                Mientras tanto no podrás tomar pedidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs personales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400 mb-1">
            <Utensils size={14}/> Mis mesas
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{my.assigned_count || 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400 mb-1">
            <ChefHat size={14}/> Abiertas ahora
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{my.open_count || 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400 mb-1">
            <CheckCircle2 size={14}/> Listas para cobrar
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{my.ready_to_pay || 0}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400 mb-1">
            <Receipt size={14}/> Total en juego
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">{money(my.open_amount || 0)}</div>
        </div>
      </div>

      {/* Mi turno de hoy */}
      <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
        Mi turno de hoy
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-5">
          <div className="text-xs text-ink-500 dark:text-obsidian-400">Cuentas cerradas</div>
          <div className="text-3xl font-bold text-ink-800 dark:text-obsidian-50 mt-1">{today.closed_count || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Pedidos cobrados</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 dark:text-obsidian-400">Total vendido</div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{money(today.total_sold || 0)}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Suma de tus mesas cerradas hoy</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 dark:text-obsidian-400">Ticket promedio</div>
          <div className="text-3xl font-bold text-ink-800 dark:text-obsidian-50 mt-1">{money(today.avg_ticket || 0)}</div>
          <div className="text-[11px] text-ink-400 dark:text-obsidian-500 mt-1">Promedio por mesa</div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/tables" className="card p-5 hover:shadow-pop transition group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center">
              <Utensils size={22}/>
            </div>
            <div>
              <div className="font-semibold text-ink-800 dark:text-obsidian-50">Ir a mis mesas</div>
              <div className="text-xs text-ink-500 dark:text-obsidian-400">Toma pedidos, agrega productos, marca cuenta</div>
            </div>
          </div>
          <ArrowRight size={20} className="text-ink-400 group-hover:text-brand-600 transition" />
        </Link>
        <Link to="/menu" className="card p-5 hover:shadow-pop transition group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center">
              <BookOpen size={22}/>
            </div>
            <div>
              <div className="font-semibold text-ink-800 dark:text-obsidian-50">Ver catálogo</div>
              <div className="text-xs text-ink-500 dark:text-obsidian-400">Productos disponibles y precios</div>
            </div>
          </div>
          <ArrowRight size={20} className="text-ink-400 group-hover:text-brand-600 transition" />
        </Link>
      </div>

      {/* Estado actual de mesas */}
      {!noTables && tables.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink-500 dark:text-obsidian-400 uppercase tracking-wide mb-3">
            Tus mesas en tiempo real
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tables.map((t) => {
              const occ = !!t.current_order_id;
              const status = t.current_order_status;
              const readyToPay = status === "ready_to_pay";
              const preparing = status === "preparing";
              return (
                <div key={t.id} className={`card p-3 ${
                  readyToPay ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20" :
                  preparing ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-900/20" :
                  occ ? "border-rose-200 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-900/20" :
                  "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/20"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-ink-800 dark:text-obsidian-50">Mesa {t.number}</div>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      readyToPay ? "bg-amber-500" : preparing ? "bg-blue-500" : occ ? "bg-rose-500" : "bg-emerald-500"
                    }`}/>
                  </div>
                  {occ ? (
                    <div className="mt-1">
                      <div className="text-xs text-ink-500 dark:text-obsidian-400">
                        {t.current_order_items || 0} productos
                      </div>
                      <div className="font-semibold text-ink-800 dark:text-obsidian-50">{money(t.current_order_total || 0)}</div>
                      <div className="text-[10px] text-ink-500 dark:text-obsidian-400 mt-0.5">
                        <span className={`badge ${statusColors[status] || ""}`}>{statusLabels[status] || ""}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Libre</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "waiter") return <WaiterHome />;
  return <AdminDashboard />;
}
