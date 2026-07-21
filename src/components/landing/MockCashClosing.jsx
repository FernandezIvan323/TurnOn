import { Banknote, CreditCard, Landmark, CheckCircle2 } from "lucide-react";

const rows = [
  { label: "Efectivo", amount: "$142.000", icon: Banknote, tone: "text-emerald-700 dark:text-emerald-300" },
  { label: "Tarjeta", amount: "$98.400", icon: CreditCard, tone: "text-sky-700 dark:text-sky-300" },
  { label: "Transferencia", amount: "$46.000", icon: Landmark, tone: "text-indigo-700 dark:text-indigo-300" },
];

export default function MockCashClosing() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2 dark:border-obsidian-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Caja
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Corte de caja · Hoy</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          <CheckCircle2 size={11} />
          Sin pendientes
        </span>
      </div>

      <div className="mb-3 rounded-xl border border-paper-200 bg-white p-3 dark:border-obsidian-700 dark:bg-obsidian-900">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          Total del día
        </p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
          $286.400
        </p>
        <p className="mt-1 text-[10px] text-ink-500 dark:text-obsidian-400">
          24 pedidos · 8 mesas · arqueo OK
        </p>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, amount, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-paper-200 bg-white px-3 py-2.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-paper-100 dark:bg-obsidian-950 ${tone}`}>
                <Icon size={16} />
              </span>
              <span className="text-sm font-medium text-ink-800 dark:text-white">{label}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink-900 dark:text-white">
              {amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-wine-200 bg-wine-50 px-3 py-2 dark:border-wine-900/50 dark:bg-wine-900/25">
        <span className="text-xs font-semibold text-wine-800 dark:text-wine-200">
          Diferencia de arqueo
        </span>
        <span className="text-sm font-bold tabular-nums text-wine-700 dark:text-wine-300">
          $0
        </span>
      </div>
    </div>
  );
}
