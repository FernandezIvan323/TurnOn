export default function BarChart({
  data,
  valueKey = "value",
  labelKey = "label",
  maxBars = 20,
  height = 180,
  vertical = false,
  showValues = true,
  barColor,
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-ink-400 dark:text-obsidian-500 text-center py-6">Sin datos en el período.</div>;
  }
  const sliced = data.slice(0, maxBars);
  const max = Math.max(1, ...sliced.map((d) => Number(d[valueKey]) || 0));

  if (vertical) {
    return (
      <div className="flex items-end gap-1" style={{ height }}>
        {sliced.map((d, i) => {
          const pct = (Number(d[valueKey]) / max) * 100;
          const val = Number(d[valueKey]) || 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0 group relative">
              {showValues && val > 0 && (
                <span className="text-[10px] font-medium text-ink-600 dark:text-obsidian-200 leading-none">
                  {val}
                </span>
              )}
              <div
                className={`w-full rounded-t-md transition-all ${barColor || "bg-wine-500 dark:bg-wine-400"}`}
                style={{ height: `${pct}%`, minHeight: val > 0 ? 4 : 0 }}
              />
              <span className="text-[9px] text-ink-500 dark:text-obsidian-400 leading-none truncate w-full text-center">
                {d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal (default)
  const labelW = vertical ? "w-12" : "w-20 sm:w-28";
  return (
    <div className="space-y-1" style={{ minHeight: height }}>
      {sliced.map((d, i) => {
        const pct = (Number(d[valueKey]) / max) * 100;
        const val = Number(d[valueKey]) || 0;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`${labelW} shrink-0 truncate text-ink-600 dark:text-obsidian-200`} title={d[labelKey]}>
              {d[labelKey]}
            </div>
            <div className="flex-1 bg-paper-200 dark:bg-obsidian-800 rounded-lg overflow-hidden h-5 relative">
              <div
                className={`h-full transition-all ${barColor || "bg-wine-500 dark:bg-wine-400"}`}
                style={{ width: `${pct}%` }}
              />
              {showValues && (
                <span className="absolute right-2 top-0 leading-5 text-ink-600 dark:text-obsidian-200 font-medium">
                  {val % 1 !== 0 ? val.toFixed(2) : val}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
