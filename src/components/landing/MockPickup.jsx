import { ShoppingBag, Clock, ChefHat, CheckCircle2, Timer } from "lucide-react";

const cols = [
  {
    key: "pending",
    title: "Pendientes",
    accent: "border-l-amber-500",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    icon: Clock,
    cards: [
      { id: 4, who: "Mostrador", eta: "5 min", next: true },
      { id: 5, who: "Pedido web", eta: "10 min" },
    ],
  },
  {
    key: "ready",
    title: "En preparación",
    accent: "border-l-blue-500",
    chip: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    icon: ChefHat,
    cards: [
      { id: 2, who: "Mostrador", eta: "8 min", note: "sin cebolla" },
    ],
  },
  {
    key: "done",
    title: "Listo para recoger",
    accent: "border-l-emerald-500",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    icon: CheckCircle2,
    cards: [
      { id: 1, who: "Mostrador", eta: "listo" },
    ],
  },
];

export default function MockPickup() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Para llevar
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Kanban · 3 columnas</p>
        </div>
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          4 activos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {cols.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.key}
              className={`rounded-xl border border-paper-300 border-l-4 bg-white p-1.5 dark:border-obsidian-700 dark:bg-obsidian-900 ${col.accent}`}
            >
              <div className="mb-1.5 flex items-center gap-1 text-[8px] font-bold text-ink-700 dark:text-white">
                <Icon size={10} />
                <span className="truncate">{col.title}</span>
                <span className="ml-auto tabular-nums text-ink-400">{col.cards.length}</span>
              </div>
              <div className="space-y-1">
                {col.cards.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-lg border border-paper-200 bg-paper-50 p-1.5 dark:border-obsidian-700 dark:bg-obsidian-950 ${
                      c.next ? "ring-1 ring-wine-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold tabular-nums text-ink-900 dark:text-white">
                        #{c.id}
                      </span>
                      {c.next && (
                        <span className="rounded bg-wine-600 px-1 text-[7px] font-bold text-white">
                          SIG
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-0.5 text-[8px] text-ink-500 dark:text-obsidian-400">
                      <ShoppingBag size={8} />
                      {c.who}
                    </p>
                    <p className="mt-0.5 flex items-center gap-0.5 text-[8px] tabular-nums text-ink-500 dark:text-obsidian-400">
                      <Timer size={8} /> {c.eta}
                    </p>
                    {c.note && (
                      <p className="truncate text-[8px] italic text-ink-500 dark:text-obsidian-400">
                        "{c.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
