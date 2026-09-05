import { useLayout } from "../store/layout";

/**
 * Preferencia de navegación: "list" (sidebar clásico) o "grid" (pantalla completa).
 * Puente sobre el store zustand: cualquier toggle/set re-renderiza TODOS los
 * consumidores al instante (sin necesidad de recargar la página).
 */
export function useLayoutPref() {
  const layout = useLayout((s) => s.layout);
  const toggle = useLayout((s) => s.toggle);
  const set = useLayout((s) => s.set);
  return { layout, toggle, set };
}