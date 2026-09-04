import { useEffect, useState } from "react";

/**
 * Barra de progreso fina en el tope — muestra cuánto se ha scrolleado.
 * Se oculta en pantallas <lg porque el scroll es continuo y vertical.
 */
export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(1, scrollTop / docHeight);
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress <= 0.02) return null;

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .funciones-progress { transition: width 0.15s linear; }
        }
      `}</style>
      <div
        className="fixed left-0 top-0 z-40 h-0.5 w-full bg-paper-200 dark:bg-obsidian-800"
        aria-hidden="true"
      >
        <div
          className="funciones-progress h-full bg-wine-600 dark:bg-wine-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </>
  );
}
