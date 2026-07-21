/** Marcos laptop / phone para mockups de la app en la landing. */
export default function DeviceFrame({
  variant = "laptop",
  children,
  className = "",
  label,
}) {
  if (variant === "phone") {
    return (
      <div className={`mx-auto w-full max-w-[280px] ${className}`}>
        {label && (
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            {label}
          </p>
        )}
        <div className="relative rounded-[2rem] border-[6px] border-ink-900 bg-ink-900 p-2 shadow-pop dark:border-obsidian-800">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-950 dark:bg-black" />
          <div className="overflow-hidden rounded-[1.5rem] bg-white dark:bg-obsidian-900">
            <div className="min-h-[480px] max-h-[520px] overflow-hidden pt-6">
              {children}
            </div>
          </div>
          {/* Home indicator */}
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-white/40" />
        </div>
      </div>
    );
  }

  // laptop
  return (
    <div className={`mx-auto w-full max-w-2xl ${className}`}>
      {label && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          {label}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-paper-300 bg-ink-900 shadow-pop dark:border-obsidian-700">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-950 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
          </div>
          <div className="mx-auto flex h-6 max-w-xs flex-1 items-center rounded-md bg-ink-800 px-3 text-[10px] text-ink-400">
            turnon.app / panel
          </div>
        </div>
        <div className="bg-paper-50 dark:bg-obsidian-950">{children}</div>
      </div>
      {/* Base */}
      <div className="mx-auto h-2 w-[92%] rounded-b-lg bg-ink-800 dark:bg-obsidian-800" />
      <div className="mx-auto h-1.5 w-[40%] rounded-b-md bg-ink-700 dark:bg-obsidian-700" />
    </div>
  );
}
