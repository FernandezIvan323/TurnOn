import { useEffect, useState, useRef } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import api from "../lib/api";
import { serverEvents } from "../lib/events";

/**
 * Banner cuando el servidor no responde de verdad (no un glitch de 1 request).
 * - Ping /api/health cada 12s
 * - Solo muestra tras 2 fallos seguidos (evita parpadeo en túnel/celular)
 * - Mensaje genérico (no "puerto 3001" — confunde en Cloudflare)
 */
export default function ServerStatus() {
  const [show, setShow] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const failsRef = useRef(0);

  const probe = async () => {
    try {
      await api.get("/health", { timeout: 8000, __retried: false });
      failsRef.current = 0;
      setShow(false);
      return true;
    } catch (_) {
      failsRef.current += 1;
      if (failsRef.current >= 2) setShow(true);
      return false;
    }
  };

  useEffect(() => {
    let timer = null;
    const tick = () => {
      probe();
      timer = setTimeout(tick, 12000);
    };
    // primer check un poco después de montar (no bloquear UI)
    timer = setTimeout(tick, 2000);

    const offDown = serverEvents.on((evt) => {
      if (evt === serverEvents.NETWORK_DOWN) {
        failsRef.current += 1;
        if (failsRef.current >= 2) setShow(true);
      } else if (evt === serverEvents.NETWORK_UP) {
        failsRef.current = 0;
        setShow(false);
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
      offDown();
    };
  }, []);

  const manualRetry = async () => {
    setRetrying(true);
    failsRef.current = 0;
    await probe();
    setRetrying(false);
  };

  if (!show) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[100] bg-rose-600 text-white px-4 py-3 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <WifiOff size={18} className="shrink-0" />
          <span className="font-medium">
            Sin conexión con el servidor. Revisá internet del PC o reintentá.
          </span>
        </div>
        <button
          type="button"
          onClick={manualRetry}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25 disabled:opacity-50"
        >
          <RefreshCw size={14} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    </div>
  );
}
