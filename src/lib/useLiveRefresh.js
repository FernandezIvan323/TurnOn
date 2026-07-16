import { useEffect, useRef } from "react";

/**
 * Refresca datos en vivo entre dispositivos:
 * - intervalo corto mientras la pestaña está visible
 * - al volver a la pestaña / enfocar la ventana
 * - al recuperar conexión de red
 */
export function useLiveRefresh(loadFn, { intervalMs = 4000, enabled = true } = {}) {
  const loadRef = useRef(loadFn);
  loadRef.current = loadFn;

  useEffect(() => {
    if (!enabled) return undefined;

    let timer = null;
    let stopped = false;

    const run = (opts) => {
      if (stopped) return;
      try {
        const r = loadRef.current(opts);
        if (r && typeof r.catch === "function") r.catch(() => {});
      } catch {
        /* ignore */
      }
    };

    const clear = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      clear();
      if (typeof document !== "undefined" && document.hidden) return;
      timer = setInterval(() => run({ silent: true }), intervalMs);
    };

    // primera pasada la hace el caller; acá solo el loop
    start();

    const onVisibility = () => {
      if (document.hidden) {
        clear();
      } else {
        run({ silent: true });
        start();
      }
    };
    const onFocus = () => run({ silent: true });
    const onOnline = () => run({ silent: true });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      stopped = true;
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [intervalMs, enabled]);
}
