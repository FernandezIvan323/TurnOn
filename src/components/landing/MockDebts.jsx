import { AlertTriangle, Truck, Utensils, ShoppingBag } from "lucide-react";

const debts = [
  { id: 18, who: "Roberto J.", type: "delivery", total: "$24.500", ago: "hace 2 días", urgent: true },
  { id: 4, who: "Mesa 6 · Terraza", type: "table", total: "$15.800", ago: "hace 5 días", urgent: true },
  { id: 3, who: "Para llevar #3", type: "pickup", total: "$9.200", ago: "ayer" },
];

const typeIcons = { delivery: Truck, table: Utensils, pickup: ShoppingBag };

export default function MockDebts() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Deudas
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Por cobrar</p>
        </div>
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          3 activas · $49.500
        </span>
      </div>

      <div className="space-y-1.5">
        {debts.map((d) => {
          const TypeIcon = typeIcons[d.type];
          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2 dark:bg-obsidian-900 ${
                d.urgent
                  ? "border-amber-300 dark:border-amber-700"
                  : "border-paper-200 dark:border-obsidian-700"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <TypeIcon size={12} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink-900 dark:text-white">
                  {d.who}
                </p>
                <p className="text-[9px] text-ink-500 dark:text-obsidian-400">{d.ago}</p>
              </div>
              {d.urgent && (
                <AlertTriangle size={11} className="shrink-0 text-amber-500" />
              )}
              <p className="shrink-0 text-xs font-bold tabular-nums text-ink-900 dark:text-white">
                {d.total}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[9px] text-ink-500 dark:text-obsidian-400">
        No bloquean el corte de caja · acción de cobro directa
      </p>
    </div>
  );
}
