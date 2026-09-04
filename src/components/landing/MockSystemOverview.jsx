import {
  AlertTriangle,
  BarChart3,
  Bike,
  BookOpen,
  Calculator,
  DollarSign,
  Home,
  LayoutDashboard,
  Package,
  PackageCheck,
  ScrollText,
  ShoppingBag,
  TrendingDown,
  Truck,
  Users,
  Utensils,
} from "lucide-react";

const MODULES = [
  { label: "Inicio", icon: Home },
  { label: "Mesas", icon: Utensils },
  { label: "Menú", icon: BookOpen },
  { label: "Domicilios", icon: Truck },
  { label: "Para llevar", icon: ShoppingBag },
  { label: "Deudas", icon: AlertTriangle },
  { label: "Caja", icon: Calculator },
  { label: "Corte de caja", icon: ScrollText },
  { label: "Gastos", icon: TrendingDown },
  { label: "Clientes", icon: Users },
  { label: "Personal", icon: LayoutDashboard },
  { label: "Inventario", icon: Package },
  { label: "Reportes", icon: BarChart3 },
];

const KPIS = [
  { label: "Ventas hoy", value: "$286.400", icon: DollarSign, tone: "text-wine-700 dark:text-wine-300" },
  { label: "Por cobrar", value: "3", icon: PackageCheck, tone: "text-sky-700 dark:text-sky-300" },
  { label: "En camino", value: "2", icon: Bike, tone: "text-indigo-700 dark:text-indigo-300" },
];

/**
 * Mock "general" para la home: panorama de TODAS las secciones del sistema.
 * KPIs arriba + grilla de módulos. Variante `compact` para el frame de laptop.
 */
export default function MockSystemOverview({ compact = false }) {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      {/* Top bar */}
      <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2 dark:border-obsidian-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-wine-600">
            <img src="/favicon.svg" alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink-900 dark:text-white">TurnOn</p>
            <p className="text-[9px] text-ink-500 dark:text-obsidian-400">Dashboard · Cajero</p>
          </div>
        </div>
        <span className="rounded-md bg-wine-50 px-1.5 py-0.5 text-[9px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
          Hoy
        </span>
      </div>

      {/* KPIs */}
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {KPIS.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-paper-200 bg-white px-2 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[8px] font-medium text-ink-500 dark:text-obsidian-400">{label}</span>
              <Icon size={10} className={`shrink-0 ${tone}`} />
            </div>
            <p className={`text-sm font-bold tabular-nums ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grilla de módulos */}
      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
        Todas las secciones
      </p>
      <div className={`grid ${compact ? "grid-cols-4 gap-1.5" : "grid-cols-4 gap-1.5 sm:grid-cols-5"}`}>
        {MODULES.map(({ label, icon: Icon }, i) => (
          <div
            key={label}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border bg-white py-2 text-center ${
              i === 0
                ? "border-wine-300 bg-wine-50 dark:border-wine-700 dark:bg-wine-900/30"
                : "border-paper-200 dark:border-obsidian-700 dark:bg-obsidian-900"
            }`}
          >
            <Icon size={14} className={i === 0 ? "text-wine-700 dark:text-wine-300" : "text-ink-500 dark:text-obsidian-400"} />
            <span className={`w-full truncate px-1 text-[8px] font-medium leading-tight ${i === 0 ? "font-semibold text-wine-800 dark:text-wine-200" : "text-ink-700 dark:text-obsidian-200"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}