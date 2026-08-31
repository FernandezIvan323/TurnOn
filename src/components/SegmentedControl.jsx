/**
 * Control segmentado (tabs/pills) unificado.
 * options: [{ value, label, icon?: LucideIcon }]
 */
export default function SegmentedControl({ options = [], value, onChange, className = "" }) {
  return (
    <div
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-paper-300 bg-paper-50 p-1 dark:border-obsidian-700 dark:bg-obsidian-900 ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-wine-600 text-white shadow-soft"
                : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200 dark:hover:bg-obsidian-800"
            }`}
          >
            {Icon && <Icon size={16} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}