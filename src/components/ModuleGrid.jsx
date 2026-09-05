import { Link } from "react-router-dom";
import { NAV_ITEMS, navLabel } from "../config/nav";

/**
 * Grilla de módulos (tiles) estilo "hub". Cada tile linkea a su sección.
 * `badges` = { ruta: { count, alert? } } para mostrar pendientes.
 */
export default function ModuleGrid({ items, badges = {}, role = "admin" }) {
  const list = (items || NAV_ITEMS).filter((i) => i.roles.includes(role));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {list.map((item) => {
        const Icon = item.icon;
        const badge = badges[item.to];
        const isHome = item.to === "/dashboard";
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop ${
              isHome
                ? "border-wine-300 bg-wine-50 dark:border-wine-700 dark:bg-wine-900/30"
                : "border-paper-200 bg-white hover:border-wine-400 dark:border-obsidian-800 dark:bg-obsidian-900 dark:hover:border-wine-500/50"
            }`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 size-16 rounded-full bg-wine-600/5 blur-2xl transition-opacity group-hover:bg-wine-600/15" />
            <div className="relative flex items-start justify-between">
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  isHome
                    ? "bg-gradient-to-br from-wine-600 to-wine-800 text-white shadow-lg shadow-wine-600/20"
                    : "bg-wine-50 text-wine-600 dark:bg-wine-900/40 dark:text-wine-300"
                }`}
              >
                <Icon size={20} />
              </span>
              {badge && (
                <span
                  className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    badge.alert
                      ? "bg-rose-600 text-white"
                      : "bg-paper-200 text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-200"
                  }`}
                >
                  {badge.count}
                </span>
              )}
            </div>
            <div className="relative mt-3">
              <p className="font-semibold text-ink-900 dark:text-white">
                {navLabel(item, role)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}