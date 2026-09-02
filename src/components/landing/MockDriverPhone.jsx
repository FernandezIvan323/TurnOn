import { Bike, Wallet } from "lucide-react";

const readyOrders = [
  { id: "21", name: "Mariana G.", addr: "Av. Mitre 432", turn: 1, next: true },
  { id: "22", name: "Diego F.", addr: "Calle 9 #215", turn: 2 },
];

const onTheWay = [
  { id: "18", name: "Lucía P.", addr: "Belgrano 88", turn: 3 },
];

export default function MockDriverPhone() {
  return (
    <div className="flex h-full min-h-[460px] flex-col bg-paper-50 dark:bg-obsidian-950">
      {/* App header */}
      <div className="flex items-center justify-between border-b border-paper-200 bg-white px-3 py-2.5 dark:border-obsidian-800 dark:bg-obsidian-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Bike size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-900 dark:text-white">TurnOn</p>
            <p className="text-[9px] text-ink-500 dark:text-obsidian-400">Domiciliario · Carlos</p>
          </div>
        </div>
        <span className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          2 para salir
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden p-3">
        {/* KPI A rendir */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              A rendir hoy
            </p>
            <Wallet size={12} className="text-emerald-700 dark:text-emerald-300" />
          </div>
          <p className="text-xl font-bold tabular-nums text-emerald-900 dark:text-emerald-100">
            $42.800
          </p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Efectivo cobrado</p>
        </div>

        {/* Listos para llevar */}
        <p className="pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          Listos para llevar
        </p>
        {readyOrders.map((o) => (
          <div
            key={o.id}
            className={`rounded-xl border border-violet-200 bg-white p-2.5 dark:border-violet-700 dark:bg-obsidian-900 ${
              o.next ? "ring-1 ring-violet-500" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-ink-900 dark:text-white">
                #{o.id}
              </span>
              {o.next && (
                <span className="rounded bg-violet-600 px-1 text-[7px] font-bold text-white">
                  SIG
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-ink-800 dark:text-obsidian-100">
              {o.name}
            </p>
            <p className="truncate text-[9px] text-ink-500 dark:text-obsidian-400">
              {o.addr}
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                Salí
              </span>
            </div>
          </div>
        ))}

        {/* En camino */}
        <p className="pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          En camino
        </p>
        {onTheWay.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-paper-200 bg-white p-2.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-ink-900 dark:text-white">
                #{o.id}
              </span>
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[8px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                Calle
              </span>
            </div>
            <p className="text-[11px] font-semibold text-ink-800 dark:text-obsidian-100">
              {o.name}
            </p>
            <p className="truncate text-[9px] text-ink-500 dark:text-obsidian-400">
              {o.addr}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom nav mock */}
      <div className="grid grid-cols-2 border-t border-paper-200 bg-white py-2 text-center text-[8px] font-semibold text-ink-500 dark:border-obsidian-800 dark:bg-obsidian-900 dark:text-obsidian-400">
        <span className="text-wine-600 dark:text-wine-300">Inicio</span>
        <span>Historial</span>
      </div>
    </div>
  );
}
