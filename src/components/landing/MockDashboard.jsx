import { BarChart3, PackageCheck, Utensils, Truck } from "lucide-react";

const ops = [
  { label: "Por cobrar", value: "3", hint: "Listas en caja", tone: "text-sky-700 dark:text-sky-300" },
  { label: "Mesas activas", value: "5", hint: "Con cuenta", tone: "text-rose-700 dark:text-rose-300" },
  { label: "En camino", value: "2", hint: "Domicilios", tone: "text-indigo-700 dark:text-indigo-300" },
];

const rows = [
  { name: "Mesa 4 · Patio", status: "Lista para cobrar", amount: "$42.500", badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  { name: "Domicilio #18", status: "En camino", amount: "$31.000", badge: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200" },
  { name: "Para llevar #7", status: "Preparación", amount: "$18.900", badge: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200" },
];

export default function MockDashboard({ compact = false }) {
  return (
    <div className={`bg-paper-50 dark:bg-obsidian-950 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      {/* Mini top bar */}
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

      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Ventas del día
          </p>
          <p className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
            $286.400
          </p>
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            +12% vs ayer
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-600 text-white">
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {ops.map((o) => (
          <div
            key={o.label}
            className="rounded-xl border border-paper-200 bg-white p-2 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <p className="text-[9px] font-medium text-ink-500 dark:text-obsidian-400">{o.label}</p>
            <p className={`text-lg font-bold tabular-nums ${o.tone}`}>{o.value}</p>
            <p className="text-[8px] text-ink-400 dark:text-obsidian-500">{o.hint}</p>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            En juego
          </p>
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-xl border border-paper-200 bg-white px-3 py-2 dark:border-obsidian-700 dark:bg-obsidian-900"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink-900 dark:text-white">{r.name}</p>
                <span className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${r.badge}`}>
                  {r.status}
                </span>
              </div>
              <p className="shrink-0 text-xs font-bold tabular-nums text-ink-800 dark:text-white">
                {r.amount}
              </p>
            </div>
          ))}
        </div>
      )}

      {compact && (
        <div className="mt-2 flex gap-2 text-[9px] text-ink-500 dark:text-obsidian-400">
          <span className="inline-flex items-center gap-1"><Utensils size={10} /> Mesas</span>
          <span className="inline-flex items-center gap-1"><Truck size={10} /> Domicilios</span>
          <span className="inline-flex items-center gap-1"><PackageCheck size={10} /> Caja</span>
        </div>
      )}
    </div>
  );
}
