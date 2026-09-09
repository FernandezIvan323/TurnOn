/**
 * Control segmentado (tabs/pills) unificado.
 * options: [{ value, label, icon?: LucideIcon }]
 * size: "md" | "lg"
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = "",
  size = "md",
}) {
  return (
    <div
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-paper-300 bg-paper-50 p-1 dark:border-obsidian-700 dark:bg-obsidian-900 ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        const sizeCls =
          size === "lg" ? "px-4 py-2.5 text-sm sm:text-base" : "px-3 py-1.5 text-sm";
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ${sizeCls} ${
              active
                ? "bg-wine-600 text-white shadow-soft"
                : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200 dark:hover:bg-obsidian-800"
            }`}
          >
            {Icon && <Icon size={size === "lg" ? 18 : 16} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}