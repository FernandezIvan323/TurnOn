import { create } from "zustand";

/**
 * Sistema de notificaciones toast global.
 * Uso:  import { toast } from "../store/toast";
 *       toast.success("Producto guardado");
 *       toast.error("No se pudo guardar");
 *       toastApiError(e)  -> muestra el error de la API o un fallback
 */

let nextId = 1;

const useToastStore = create((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++;
    const toast = { id, type: "success", duration: 3500, ...t };
    set((s) => ({ toasts: [...s.toasts, toast].slice(-4) })); // máx 4 apilados
    if (toast.duration > 0) {
      setTimeout(() => get().dismiss(id), toast.duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const push = (type, message, opts = {}) =>
  useToastStore.getState().push({ ...opts, type, message });

export const toast = {
  success: (message, opts) => push("success", message, opts),
  error: (message, opts) => push("error", message, { duration: 5000, ...opts }),
  info: (message, opts) => push("info", message, opts),
};

/** Traduce un error de axios/red a un toast legible. */
export function toastApiError(e, fallback = "Ocurrió un error inesperado") {
  toast.error(e?.response?.data?.error || e?.message || fallback);
}

export function useToasts() {
  return useToastStore((s) => s.toasts);
}

export function useDismissToast() {
  return useToastStore((s) => s.dismiss);
}
