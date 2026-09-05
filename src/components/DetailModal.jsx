import { X } from "lucide-react";

/**
 * Shell unificado de ventana de detalle (moderno, color vivido por tipo).
 * Borde superior de color, cabecera jerarquizada, backdrop oscurecido.
 */
const TYPE_HEADER = {
  table: "from-sky-500 to-sky-600",
  delivery: "from-indigo-500 to-indigo-600",
  pickup: "from-amber-500 to-amber-600",
};

export default function DetailModal({ title, badge, type = "table", amount, onClose, children }) {
  const headerGrad = TYPE_HEADER[type] || TYPE_HEADER.table;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-pop dark:border-obsidian-700 dark:bg-obsidian-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera con gradiente por tipo */}
        <div className={`relative bg-gradient-to-r ${headerGrad} px-5 py-4 text-white`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                {badge}
              </span>
              <h2 className="mt-1.5 text-xl font-bold leading-tight">{title}</h2>
              {amount != null && (
                <div className="mt-1 text-2xl font-extrabold tabular-nums">{amount}</div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}