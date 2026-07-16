/** Neutral kanban column shells with a left accent (status color). */
export const KANBAN_SHELL =
  "rounded-2xl border border-paper-300 bg-paper-50/90 p-3 min-h-[200px] dark:border-obsidian-700 dark:bg-obsidian-900/80";

export const KANBAN_ACCENT = {
  pending: "border-l-4 border-l-amber-500",
  preparing: "border-l-4 border-l-blue-500",
  on_the_way: "border-l-4 border-l-indigo-400",
  ready_to_pay: "border-l-4 border-l-emerald-500",
  delivered: "border-l-4 border-l-emerald-500",
};

export function kanbanColumnClass(statusKey) {
  return `${KANBAN_SHELL} ${KANBAN_ACCENT[statusKey] || ""}`;
}

export const KANBAN_COUNT_PILL =
  "text-xs font-semibold tabular-nums text-ink-700 dark:text-white bg-paper-100 dark:bg-obsidian-800 px-2 py-0.5 rounded-full border border-paper-300 dark:border-obsidian-600";
