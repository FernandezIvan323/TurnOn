import { ChefHat, Clock, Truck, Bike, Check } from "lucide-react";

const cols = [
  {
    key: "pending",
    title: "Pendientes",
    accent: "border-l-amber-500",
    icon: Clock,
    cards: [
      { id: "12", name: "Laura M.", zone: "Centro", total: "$24.000", turn: 1 },
      { id: "14", name: "Café Norte", zone: "Norte", total: "$18.500", turn: 2 },
    ],
  },
  {
    key: "prep",
    title: "Preparación",
    accent: "border-l-blue-500",
    icon: ChefHat,
    cards: [
      { id: "9", name: "Andrés R.", zone: "Sur", total: "$36.200", next: true },
    ],
  },
  {
    key: "ready",
    title: "Listos",
    accent: "border-l-violet-500",
    icon: Bike,
    cards: [
      { id: "21", name: "Mariana G.", zone: "Centro", total: "$22.400" },
    ],
  },
  {
    key: "way",
    title: "En camino",
    accent: "border-l-indigo-500",
    icon: Truck,
    cards: [
      { id: "7", name: "Sofía P.", zone: "Oeste", total: "$29.000", rider: "Carlos" },
    ],
  },
  {
    key: "done",
    title: "Entregados",
    accent: "border-l-emerald-500",
    icon: Check,
    cards: [
      { id: "5", name: "Roberto J.", zone: "Este", total: "$15.700" },
    ],
  },
];

export default function MockKanban() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Domicilios
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">
            Kanban · 5 columnas
          </p>
        </div>
        <span className="rounded-md bg-wine-50 px-2 py-0.5 text-[9px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
          6 activos
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
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
                      <span className="text-[9px] font-bold text-ink-900 dark:text-white">
                        {c.turn != null ? `#${c.turn}` : `#${c.id}`}
                      </span>
                      {c.next && (
                        <span className="rounded bg-wine-600 px-1 text-[7px] font-bold text-white">
                          SIG
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[9px] font-semibold text-ink-800 dark:text-obsidian-100">
                      {c.name}
                    </p>
                    <p className="text-[7px] text-ink-500 dark:text-obsidian-400">
                      {c.zone}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold tabular-nums text-ink-900 dark:text-white">
                      {c.total}
                    </p>
                    {c.rider && (
                      <p className="text-[7px] font-medium text-indigo-600 dark:text-indigo-300">
                        ↗ {c.rider}
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
