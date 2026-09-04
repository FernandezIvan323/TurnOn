import { Tag, CheckCircle2, Search } from "lucide-react";

const CATEGORIES = [
  {
    name: "Pizzas",
    items: [
      { name: "Muzzarella grande", price: "$8.500" },
      { name: "Napolitana", price: "$9.200" },
      { name: "Jamón y morrón", price: "$9.000" },
    ],
  },
  {
    name: "Bebidas",
    items: [
      { name: "Coca-Cola 1,5 L", price: "$2.800" },
      { name: "Agua saborizada", price: "$1.800" },
      { name: "Cerveza artesanal", price: "$3.200" },
    ],
  },
];

export default function MockMenu() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Catálogo
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Menú del local</p>
        </div>
        <div className="flex flex-1 max-w-[140px] items-center gap-1 rounded-lg border border-paper-300 bg-white px-2 py-1 dark:border-obsidian-700 dark:bg-obsidian-900">
          <Search size={10} className="text-ink-400" />
          <span className="text-[9px] text-ink-400 dark:text-obsidian-500">Buscar…</span>
        </div>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((c) => (
          <div key={c.name}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-ink-800 dark:text-obsidian-100">
              <Tag size={10} className="text-wine-600 dark:text-wine-300" />
              {c.name}
              <span className="text-[9px] font-normal text-ink-400 dark:text-obsidian-500">
                ({c.items.length})
              </span>
            </div>
            <div className="space-y-1">
              {c.items.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-paper-200 bg-white px-2.5 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-ink-900 dark:text-white">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-semibold tabular-nums text-wine-700 dark:text-wine-300">
                      {p.price}
                    </p>
                  </div>
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
