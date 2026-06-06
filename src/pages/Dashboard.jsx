import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Header from "../components/Header";
import { money } from "../lib/format";
import {
  DollarSign, ShoppingBag, Truck, Utensils, Receipt, Clock,
  PackageCheck, Bike, AlertCircle, RefreshCw, TrendingUp, TrendingDown,
} from "lucide-react";

function Stat({ icon: Icon, label, value, hint, color = "bg-brand-50 text-brand-700", darkColor = "dark:bg-brand-900/30 dark:text-brand-300" }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} ${darkColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm text-ink-500 dark:text-ink-400">{label}</div>
          <div className="text-2xl font-semibold text-ink-800 dark:text-ink-100">{value}</div>
        </div>
      </div>
      {hint && <div className="text-xs text-ink-400 dark:text-ink-500 mt-3">{hint}</div>}
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard/summary");
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  const t = data?.today || {};
  const o = data?.op || {};

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

      {/* Fila 1: Ventas del día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Stat
          icon={DollarSign}
          label="Ventas hoy"
          value={money(t.total_sales || 0)}
          hint={<Trend current={t.total_sales} previous={data?.yesterday_sales} />}
        />
        <Stat
          icon={Receipt}
          label="Pedidos cobrados"
          value={t.orders_count || 0}
          hint={`${t.delivery_count || 0} domicilios · ${t.table_count || 0} mesas · ${t.pickup_count || 0} llevar`}
          color="bg-amber-50 text-amber-700" darkColor="dark:bg-amber-900/30 dark:text-amber-300"
        />
        <Stat
          icon={ShoppingBag}
          label="Ticket promedio"
          value={money(t.avg_ticket || 0)}
          hint="Promedio por pedido"
          color="bg-indigo-50 text-indigo-700" darkColor="dark:bg-indigo-900/30 dark:text-indigo-300"
        />
        <Stat
          icon={Truck}
          label="Domicilios cobrados"
          value={t.delivery_count || 0}
          hint={`${t.table_count || 0} cuentas de mesa`}
          color="bg-sky-50 text-sky-700" darkColor="dark:bg-sky-900/30 dark:text-sky-300"
        />
      </div>

      {/* Fila 2: Operación en tiempo real */}
      <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-3">
        Operación en tiempo real
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            <span className="text-xs text-ink-500 dark:text-ink-400">Sin asignar</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-ink-100">{o.pending_to_assign || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">Domicilios esperando repartidor</div>
        </Link>

        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <span className="text-xs text-ink-500 dark:text-ink-400">En preparación</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-ink-100">{o.preparing || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">Cocinándose</div>
        </Link>

        <Link to="/delivery" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
              <Bike size={18} />
            </div>
            <span className="text-xs text-ink-500 dark:text-ink-400">En camino</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-ink-100">{o.on_the_way || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">Repartidores en la calle</div>
        </Link>

        <Link to="/tables" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center">
              <Utensils size={18} />
            </div>
            <span className="text-xs text-ink-500 dark:text-ink-400">Mesas activas</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-ink-100">{o.active_tables || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">Con clientes en la acera</div>
        </Link>

        <Link to="/cashier" className="card p-4 hover:shadow-pop transition group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 flex items-center justify-center">
              <PackageCheck size={18} />
            </div>
            <span className="text-xs text-ink-500 dark:text-ink-400">Por cobrar</span>
          </div>
          <div className="text-2xl font-bold text-ink-800 dark:text-ink-100">{o.ready_to_pay || 0}</div>
          <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">Cuentas listas</div>
        </Link>
      </div>

      <div className="card p-6 text-sm text-ink-500 dark:text-ink-400">
        <p className="font-medium text-ink-700 dark:text-ink-200 mb-2">Cómo empezar</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <b>Mesas</b> para tomar pedidos en la acera.</li>
          <li>Ve a <b>Domicilios</b> para registrar pedidos por teléfono (tu prioridad).</li>
          <li>En <b>Menú</b> configura el catálogo de productos.</li>
          <li>En <b>Personal</b> agrega repartidores y meseros.</li>
          <li>En <b>Reportes</b> consulta ventas, productos más vendidos y métricas.</li>
        </ul>
      </div>
    </div>
  );
}
