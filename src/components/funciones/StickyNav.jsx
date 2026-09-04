/**
 * Navegación lateral sticky con scroll-spy para la página /funciones.
 * Resalta la sección activa en el índice y permite saltar directo.
 */
export default function StickyNav({ items, activeId }) {
  if (!items?.length) return null;

  return (
    <nav
      aria-label="Índice de funciones"
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-paper-200 bg-white/50 p-2 backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-900/50"
    >
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-500 dark:text-obsidian-400">
        Índice
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  isActive
                    ? "bg-wine-50 text-wine-700 dark:bg-wine-900/30 dark:text-wine-300"
                    : "text-ink-600 hover:bg-paper-100 dark:text-obsidian-300 dark:hover:bg-obsidian-800"
                }`}
              >
                {item.step && (
                  <span className="mr-1.5 tabular-nums text-ink-400 dark:text-obsidian-500">
                    {item.step}
                  </span>
                )}
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
