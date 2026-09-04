import { Package, AlertTriangle, Search } from "lucide-react";

const ITEMS = [
  { name: "Harina 000", stock: 24, min: 20 },
  { name: "Muzzarella rallada", stock: 8, min: 5 },
  { name: "Coca-Cola 1,5 L", stock: 3, min: 10, low: true },
  { name: "Jamón cocido", stock: 12, min: 5 },
  { name: "Queso azul", stock: 2, min: 4, low: true },
];

export default function MockInventory() {
  const lowCount = ITEMS.filter((i) => i.low).length;
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Inventario
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Stock</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-paper-300 bg-white px-2 py-1 dark:border-obsidian-700 dark:bg-obsidian-900">
          <Search size={10} className="text-ink-400" />
          <span className="text-[9px] text-ink-400 dark:text-obsidian-500">Buscar…</span>
        </div>
      </div>

      {/* Banner de stock bajo */}
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 dark:border-rose-800 dark:bg-rose-900/30">
        <AlertTriangle size={11} className="shrink-0 text-rose-700 dark:text-rose-300" />
        <p className="text-[10px] font-semibold text-rose-800 dark:text-rose-200">
          {lowCount} productos por debajo del mínimo
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-paper-200 bg-white dark:border-obsidian-700 dark:bg-obsidian-900">
        <div className="grid grid-cols-4 gap-1 border-b border-paper-200 bg-paper-100 px-2 py-1.5 text-[8px] font-bold uppercase tracking-wide text-ink-500 dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-obsidian-400">
          <span>Producto</span>
          <span className="text-right">Stock</span>
          <span className="text-right">Mín.</span>
          <span className="text-right">Estado</span>
        </div>
        {ITEMS.map((i) => (
          <div
            key={i.name}
            className={`grid grid-cols-4 gap-1 border-b border-paper-100 px-2 py-1.5 last:border-0 dark:border-obsidian-800 ${
              i.low ? "bg-rose-50/60 dark:bg-rose-900/10" : ""
            }`}
          >
            <span className="truncate text-[10px] font-medium text-ink-900 dark:text-white">
              {i.name}
            </span>
            <span className="text-right text-[10px] tabular-nums text-ink-700 dark:text-obsidian-200">
              {i.stock}
            </span>
            <span className="text-right text-[10px] tabular-nums text-ink-500 dark:text-obsidian-400">
              {i.min}
            </span>
            <span className="text-right">
              {i.low ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[8px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                  <AlertTriangle size={8} /> Bajo
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <Package size={8} /> OK
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
