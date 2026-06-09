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
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]">
      <div className="card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-white">{title}</h2>
          <button onClick={onCancel} className="btn-ghost"><X size={18}/></button>
        </div>
        <p className="text-sm text-ink-600 dark:text-obsidian-200 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button onClick={onConfirm} className={`${confirmVariant} flex items-center gap-1.5`}>
            <Icon size={16}/> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
