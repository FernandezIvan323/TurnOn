import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

export default function LogoutConfirm({ onConfirm, onCancel }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="logout-confirm-title"
            className="text-lg font-semibold text-ink-800 dark:text-white"
          >
            Cerrar sesión
          </h2>
          <button type="button" onClick={onCancel} className="btn-ghost" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-ink-600 dark:text-obsidian-200">
          ¿Seguro que quieres cerrar sesión? Volverás a la pantalla de inicio.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger flex w-full items-center justify-center gap-1.5 sm:w-auto"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
