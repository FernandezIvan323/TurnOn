import { useEffect, useState } from "react";
import MockDashboard from "./MockDashboard";
import MockKanban from "./MockKanban";
import MockTables from "./MockTables";

const SLIDES = [
  { key: "dashboard", label: "Dashboard", render: (compact) => <MockDashboard compact={compact} /> },
  { key: "domicilios", label: "Domicilios", render: () => <MockKanban /> },
  { key: "mesas", label: "Mesas", render: () => <MockTables /> },
];

const INTERVAL_MS = 4200;

export default function AdminScreenCarousel({ compact = false }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const active = SLIDES[index];

  return (
    <div className="relative">
      {/* Badge módulo actual */}
      <div className="pointer-events-none absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
        <span className="inline-flex items-center rounded-full border border-paper-300 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700 shadow-soft dark:border-obsidian-600 dark:bg-obsidian-900/95 dark:text-obsidian-200">
          {active.label}
        </span>
      </div>

      {/* Stack con fade */}
      <div className="relative min-h-[280px]">
        {SLIDES.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.key}
              className={`transition-opacity duration-500 ease-in-out ${
                isActive
                  ? "relative z-10 opacity-100"
                  : "pointer-events-none absolute inset-0 z-0 opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              {slide.render(compact)}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      {!reduceMotion && (
        <div className="flex items-center justify-center gap-1.5 border-t border-paper-200 bg-paper-50 py-2 dark:border-obsidian-800 dark:bg-obsidian-950">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Ver ${slide.label}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-5 bg-wine-600 dark:bg-wine-400"
                  : "w-1.5 bg-paper-400 hover:bg-ink-400 dark:bg-obsidian-600 dark:hover:bg-obsidian-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
