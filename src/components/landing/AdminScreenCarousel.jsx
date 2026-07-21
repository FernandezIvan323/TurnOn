import { useCallback, useEffect, useState } from "react";
import MockDashboard from "./MockDashboard";
import MockKanban from "./MockKanban";
import MockTables from "./MockTables";

const SLIDES = [
  {
    key: "dashboard",
    label: "Dashboard",
    render: (compact) => <MockDashboard compact={compact} />,
  },
  {
    key: "domicilios",
    label: "Domicilios",
    render: () => <MockKanban />,
  },
  {
    key: "mesas",
    label: "Mesas",
    render: () => <MockTables />,
  },
];

/** Cada módulo se muestra este tiempo antes de pasar al siguiente */
const INTERVAL_MS = 3200;

export default function AdminScreenCarousel({ compact = false }) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0); // reinicia la barra de progreso

  const goTo = useCallback((i) => {
    setIndex(i);
    setTick((t) => t + 1);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const id = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [next, tick]);

  const active = SLIDES[index];

  return (
    <div className="relative overflow-hidden bg-paper-50 dark:bg-obsidian-950">
      {/* Pestañas de módulos — siempre visibles */}
      <div className="flex items-center gap-1 border-b border-paper-200 bg-white px-2 py-1.5 dark:border-obsidian-800 dark:bg-obsidian-900">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => goTo(i)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors sm:text-xs ${
              i === index
                ? "bg-wine-600 text-white shadow-soft"
                : "bg-paper-100 text-ink-600 hover:bg-paper-200 dark:bg-obsidian-800 dark:text-obsidian-200 dark:hover:bg-obsidian-700"
            }`}
          >
            {slide.label}
          </button>
        ))}
        <span className="ml-auto hidden text-[10px] font-medium text-ink-400 sm:inline dark:text-obsidian-500">
          auto · {index + 1}/{SLIDES.length}
        </span>
      </div>

      {/* Barra de progreso del ciclo */}
      <div className="h-0.5 w-full bg-paper-200 dark:bg-obsidian-800">
        <div
          key={tick}
          className="h-full bg-wine-600 dark:bg-wine-400"
          style={{
            width: "100%",
            transformOrigin: "left",
            animation: `admin-carousel-progress ${INTERVAL_MS}ms linear forwards`,
          }}
        />
      </div>

      {/* Pantalla del módulo activo — key fuerza remount + animación de entrada */}
      <div
        key={`${active.key}-${tick}`}
        className="admin-carousel-slide"
      >
        {active.render(compact)}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 border-t border-paper-200 bg-white py-2 dark:border-obsidian-800 dark:bg-obsidian-900">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            aria-label={`Ver ${slide.label}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-wine-600 dark:bg-wine-400"
                : "w-2 bg-paper-400 hover:bg-ink-400 dark:bg-obsidian-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
