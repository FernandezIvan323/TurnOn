/**
 * Primitivas de carga (skeletons) con la animación pulse ya usada en Dashboard.
 */
export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-paper-200 dark:bg-obsidian-800 ${className}`} />;
}

/** Fila de tabla → N filas con C columnas. Mantiene el layout de la tabla mientras carga. */
export function TableSkeleton({ rows = 5, cols = 4, className = "" }) {
  return (
    <div className={`card overflow-hidden ${className}`} aria-hidden="true">
      <div className="space-y-0 border-t border-paper-200 dark:border-obsidian-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 border-b border-paper-200 px-4 py-3.5 dark:border-obsidian-800"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Grid de H×W cards para páginas tipo tablero/catálogo. */
export function CardGridSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <Skeleton className="mb-3 h-4 w-2/3" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Bloque de texto simple (para tarjetas KPI individuales). */
export function KpiSkeleton({ className = "" }) {
  return (
    <div className={`card p-4 ${className}`} aria-hidden="true">
      <Skeleton className="mb-3 h-3 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  );
}