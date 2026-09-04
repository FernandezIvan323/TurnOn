import { Utensils, Truck, ShoppingBag, Receipt, Banknote, CreditCard, CheckCircle2 } from "lucide-react";

const summary = [
  { label: "Mesas", count: 3, icon: Utensils, tone: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  { label: "Domicilios", count: 2, icon: Truck, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { label: "Para llevar", count: 1, icon: ShoppingBag, tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];

const pending = [
  { id: 21, who: "Mesa 4 · Patio", total: "$62.000", method: "Efectivo", methodIcon: Banknote },
  { id: 7, who: "Dom. Barrio Norte", total: "$31.500", method: "Tarjeta", methodIcon: CreditCard },
];

export default function MockCashier() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Caja
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Por cobrar</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-paper-200 p-0.5 dark:bg-obsidian-800">
          <span className="rounded-md bg-white px-2 py-0.5 text-[9px] font-bold text-ink-900 shadow-sm dark:bg-obsidian-950 dark:text-white">
            Por cobrar
          </span>
          <span className="px-2 py-0.5 text-[9px] font-semibold text-ink-500 dark:text-obsidian-400">
            Cobrados
          </span>
        </div>
      </div>

      {/* Resumen por canal */}
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {summary.map(({ label, count, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-lg border border-paper-200 bg-white px-2 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tone}`}>
              <Icon size={11} />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-medium text-ink-500 dark:text-obsidian-400">{label}</p>
              <p className="text-sm font-bold tabular-nums text-ink-900 dark:text-white">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos listos */}
      <div className="space-y-1.5">
        {pending.map((p) => {
          const MethodIcon = p.methodIcon;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-paper-200 bg-white px-2.5 py-2 dark:border-obsidian-700 dark:bg-obsidian-900"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink-900 dark:text-white">
                  {p.who}
                </p>
                <p className="flex items-center gap-1 text-[9px] text-ink-500 dark:text-obsidian-400">
                  <MethodIcon size={9} /> {p.method}
                </p>
              </div>
              <p className="text-sm font-bold tabular-nums text-ink-900 dark:text-white">
                {p.total}
              </p>
              <button className="flex h-6 items-center gap-0.5 rounded-md bg-wine-600 px-2 text-[9px] font-bold text-white">
                <CheckCircle2 size={10} /> Cobrar
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between rounded-lg border border-wine-200 bg-wine-50 px-2.5 py-1.5 dark:border-wine-900/50 dark:bg-wine-900/25">
        <span className="flex items-center gap-1 text-[9px] font-semibold text-wine-700 dark:text-wine-200">
          <Receipt size={10} /> Total a cobrar
        </span>
        <span className="text-sm font-bold tabular-nums text-wine-700 dark:text-wine-300">
          $93.500
        </span>
      </div>
    </div>
  );
}
