/**
 * Estado vacío unificado: icono + título + descripción + acción opcional.
 */
export default function EmptyState({ icon: Icon, title, description, action = null, className = "" }) {
  return (
    <div className={`card border-dashed p-10 text-center ${className}`}>
      {Icon && <Icon size={32} className="mx-auto mb-2 text-ink-300 dark:text-obsidian-500" />}
      <div className="font-semibold text-ink-800 dark:text-white">{title}</div>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500 dark:text-obsidian-400">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}