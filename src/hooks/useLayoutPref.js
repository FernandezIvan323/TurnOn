import { useCallback, useEffect, useState } from "react";

const KEY = "turnon.layout";
const VALID = ["list", "grid"];

/**
 * Preferencia de navegación: "list" (sidebar clásico) o "grid" (hub + pantalla completa).
 * Persiste en localStorage.
 */
export function useLayoutPref() {
  const [layout, setLayout] = useState(() => {
    const v = localStorage.getItem(KEY);
    return VALID.includes(v) ? v : "list";
  });

  const toggle = useCallback(() => {
    setLayout((prev) => {
      const next = prev === "list" ? "grid" : "list";
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  const set = useCallback((v) => {
    const next = VALID.includes(v) ? v : "list";
    localStorage.setItem(KEY, next);
    setLayout(next);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, layout);
  }, [layout]);

  return { layout, toggle, set };
}