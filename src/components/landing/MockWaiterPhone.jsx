import { Utensils, Clock } from "lucide-react";

const myTables = [
  { n: "2", state: "pending", total: "$28.000", ago: "12 min" },
  { n: "4", state: "ready", total: "$62.000", ago: "28 min" },
  { n: "6", state: "preparing", total: "$19.200", ago: "8 min" },
];

const stateStyle = {
  pending: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  ready: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
};

const stateLabel = {
  pending: "Pendiente",
  preparing: "Cocina",
  ready: "Por cobrar",
};

export default function MockWaiterPhone() {
  return (
    <div className="flex h-full min-h-[460px] flex-col bg-paper-50 dark:bg-obsidian-950">
      {/* App header */}
      <div className="flex items-center justify-between border-b border-paper-200 bg-white px-3 py-2.5 dark:border-obsidian-800 dark:bg-obsidian-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-600">
            <img src="/favicon.svg" alt="" className="h-full w-full rounded-lg object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-900 dark:text-white">TurnOn</p>
            <p className="text-[9px] text-ink-500 dark:text-obsidian-400">Mesero · María</p>
          </div>
        </div>
        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          3 mesas
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden p-3">
        <div className="rounded-xl border border-paper-200 bg-white p-3 dark:border-obsidian-700 dark:bg-obsidian-900">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-500">Mi turno</p>
          <p className="text-xl font-bold tabular-nums text-ink-900 dark:text-white">$109.200</p>
          <p className="text-[10px] text-ink-500 dark:text-obsidian-400">En mesas abiertas</p>
        </div>

        <p className="pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          Mis mesas
        </p>
        {myTables.map((t) => (
          <div
            key={t.n}
            className="flex items-center gap-2 rounded-xl border border-paper-200 bg-white p-2.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-wine-50 dark:bg-wine-900/30">
              <Utensils size={12} className="text-wine-600 dark:text-wine-300" />
              <span className="text-sm font-bold text-ink-900 dark:text-white">{t.n}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-ink-900 dark:text-white">Mesa {t.n}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${stateStyle[t.state]}`}>
                  {stateLabel[t.state]}
                </span>
              </div>
              <p className="flex items-center gap-1 text-[9px] text-ink-500 dark:text-obsidian-400">
                <Clock size={9} /> {t.ago}
              </p>
            </div>
            <p className="text-xs font-bold tabular-nums text-ink-900 dark:text-white">{t.total}</p>
          </div>
        ))}
      </div>

      {/* Bottom nav mock */}
      <div className="grid grid-cols-4 border-t border-paper-200 bg-white py-2 text-center text-[8px] font-semibold text-ink-500 dark:border-obsidian-800 dark:bg-obsidian-900 dark:text-obsidian-400">
        <span className="text-wine-600 dark:text-wine-300">Inicio</span>
        <span>Mesas</span>
        <span>Catálogo</span>
        <span>Historial</span>
      </div>
    </div>
  );
}
