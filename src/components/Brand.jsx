import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="AppTurnos inicio">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-paper-300 bg-paper-50 p-2 shadow-soft dark:border-obsidian-700 dark:bg-obsidian-900">
        <img src="/favicon.svg" alt="" className="h-full w-full" />
      </span>
      <span>
        <span className="block text-base font-bold leading-tight text-ink-900 dark:text-obsidian-50">AppTurnos</span>
        <span className="block text-xs text-ink-500 dark:text-obsidian-400">Gestion del restaurant</span>
      </span>
    </Link>
  );
}
