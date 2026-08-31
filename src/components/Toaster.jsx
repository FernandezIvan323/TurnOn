import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToasts, useDismissToast } from "../store/toast";

const TONE = {
  success: {
    icon: CheckCircle2,
    cls: "border-emerald-300 dark:border-emerald-700",
    iconCls: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    cls: "border-rose-300 dark:border-rose-700",
    iconCls: "text-rose-600 dark:text-rose-400",
  },
  info: {
    icon: Info,
    cls: "border-sky-300 dark:border-sky-700",
    iconCls: "text-sky-600 dark:text-sky-400",
  },
};

/**
 * Pila de toasts fija abajo a la derecha (arriba en móvil para no tapar la barra).
 * Se monta una sola vez en Layout.
 */
export default function Toaster() {
  const toasts = useToasts();
  const dismiss = useDismissToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[300] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:top-auto sm:bottom-5 sm:items-end"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => {
        const tone = TONE[t.type] || TONE.info;
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-white px-3.5 py-3 shadow-pop dark:bg-obsidian-900 ${tone.cls}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconCls}`} aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm font-medium text-ink-800 dark:text-obsidian-50">
              {t.message}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="btn-ghost -mr-1 -mt-1 h-7 w-7 p-0"
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
