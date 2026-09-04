import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Sparkles } from "lucide-react";

const STATS = [
  { label: "Ventas", value: "$286.400", icon: DollarSign, tone: "text-wine-700 dark:text-wine-300" },
  { label: "Pedidos", value: "36", icon: ShoppingBag, tone: "text-sky-700 dark:text-sky-300" },
  { label: "Ticket prom.", value: "$7.955", icon: TrendingUp, tone: "text-emerald-700 dark:text-emerald-300" },
  { label: "Propinas", value: "$12.400", icon: Sparkles, tone: "text-amber-700 dark:text-amber-300" },
];

const TOP = [
  { name: "Muzzarella grande", qty: 12 },
  { name: "Coca-Cola 1,5 L", qty: 8 },
  { name: "Napolitana", qty: 6 },
  { name: "Cerveza artesanal", qty: 5 },
];

const BARS = [45, 70, 55, 90, 65, 40, 100, 60];
const DAYS = ["L", "M", "M", "J", "V", "S", "D", "Hoy"];

export default function MockReports() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Reportes
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Últimos 7 días</p>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-wine-50 px-1.5 py-0.5 text-[9px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
          <BarChart3 size={10} /> Resumen
        </div>
      </div>

      {/* Stats */}
      <div className="mb-2 grid grid-cols-2 gap-1.5">
        {STATS.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-lg border border-paper-200 bg-white px-2 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <Icon size={12} className={tone} />
            <div className="min-w-0">
              <p className="text-[8px] text-ink-500 dark:text-obsidian-400">{label}</p>
              <p className="truncate text-xs font-bold tabular-nums text-ink-900 dark:text-white">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="mb-2 rounded-lg border border-paper-200 bg-white p-2 dark:border-obsidian-700 dark:bg-obsidian-900">
        <p className="mb-1 text-[9px] font-semibold text-ink-500 dark:text-obsidian-400">
          Ventas por día
        </p>
        <div className="flex h-14 items-end gap-1">
          {BARS.map((v, i) => (
            <div key={i} className="flex-1">
              <div
                className={`w-full rounded-t-sm ${
                  i === BARS.length - 1 ? "bg-wine-600" : "bg-wine-300 dark:bg-wine-800"
                }`}
                style={{ height: `${v}%` }}
              />
              <p className="mt-0.5 text-center text-[7px] text-ink-400 dark:text-obsidian-500">
                {DAYS[i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top productos */}
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          Top productos
        </p>
        <div className="space-y-1">
          {TOP.map((t, i) => (
            <div
              key={t.name}
              className="flex items-center justify-between rounded-lg border border-paper-200 bg-white px-2 py-1 dark:border-obsidian-700 dark:bg-obsidian-900"
            >
              <span className="flex items-center gap-1.5">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-wine-100 text-[8px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                  {i + 1}
                </span>
                <span className="truncate text-[10px] font-medium text-ink-900 dark:text-white">
                  {t.name}
                </span>
              </span>
              <span className="text-[10px] tabular-nums text-ink-500 dark:text-obsidian-400">
                ×{t.qty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
