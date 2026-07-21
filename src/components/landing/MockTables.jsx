const tables = [
  { n: "1", label: "Madera", state: "free", total: null },
  { n: "2", label: "Patio", state: "pending", total: "$28.000", items: "3 prod." },
  { n: "3", label: "Barra", state: "preparing", total: "$45.500", items: "5 prod." },
  { n: "4", label: "VIP", state: "ready", total: "$62.000", items: "7 prod." },
  { n: "5", label: null, state: "free", total: null },
  { n: "6", label: "Terraza", state: "ready", total: "$19.200", items: "2 prod." },
];

const styles = {
  free: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/25",
  pending: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/25",
  preparing: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/25",
  ready: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/25",
};

const dots = {
  free: "bg-emerald-500",
  pending: "bg-rose-500",
  preparing: "bg-blue-500",
  ready: "bg-amber-500",
};

const labels = {
  free: "Libre",
  pending: "Pendiente",
  preparing: "Cocina",
  ready: "Por cobrar",
};

export default function MockTables() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Mesas
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Sala · turno actual</p>
        </div>
        <span className="rounded-full bg-wine-600 px-2 py-0.5 text-[9px] font-bold text-white">
          #2 SIGUIENTE
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tables.map((t) => (
          <div
            key={t.n}
            className={`rounded-xl border-2 p-2 text-left ${styles[t.state]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] text-ink-500 dark:text-obsidian-400">Mesa</p>
                <p className="text-lg font-bold leading-none text-ink-900 dark:text-white">{t.n}</p>
                {t.label && (
                  <p className="mt-0.5 truncate text-[9px] text-ink-500 dark:text-obsidian-400">
                    {t.label}
                  </p>
                )}
              </div>
              <span className={`mt-0.5 h-2 w-2 rounded-full ${dots[t.state]}`} />
            </div>
            {t.total ? (
              <div className="mt-1.5 border-t border-black/5 pt-1 dark:border-white/10">
                <p className="text-[10px] font-bold tabular-nums text-ink-900 dark:text-white">
                  {t.total}
                </p>
                <p className="text-[8px] text-ink-500">{t.items}</p>
              </div>
            ) : (
              <p className="mt-1.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
                {labels[t.state]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
