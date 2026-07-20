import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  title = "Confirmar",
  message,
  confirmText = "Eliminar",
  confirmVariant = "btn-danger",
  icon: Icon = AlertTriangle,
  onConfirm,
  onCancel,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-white">{title}</h2>
          <button type="button" onClick={onCancel} className="btn-ghost" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-ink-600 dark:text-obsidian-200">{message}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${confirmVariant} flex w-full items-center justify-center gap-1.5 sm:w-auto`}
          >
            <Icon size={16} /> {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
