import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/**
 * Modal único con portal, cierre por Escape, bloqueo de scroll del body
 * y semántica de diálogo accesible. Reemplaza los shells inline de las páginas.
 */
export default function Modal({
  open = false,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  hideClose = false,
  children,
  footer = null,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={closeOnBackdrop && onClose ? () => onClose() : undefined}
      role="presentation"
    >
      <div
        className={`card w-full ${SIZES[size] || SIZES.md} max-h-[90vh] overflow-y-auto p-5 shadow-pop`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || (!hideClose && onClose)) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h2>
            {!hideClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost h-9 w-9 shrink-0 p-0"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children}
        {footer && <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}