/** Shared form field styles for auth pages (Login). */
export function authInputClassName(extra = "") {
  return [
    "w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-sm text-ink-900",
    "placeholder:text-ink-400 focus:border-wine-500 focus:outline-none focus:ring-2 focus:ring-wine-500/40",
    "transition-colors duration-200 disabled:opacity-60",
    "dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-white dark:placeholder:text-white/40",
    "dark:focus:border-wine-400 dark:focus:ring-wine-500/30",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
