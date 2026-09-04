import { Sparkles, MonitorSmartphone, Cloud, ShieldCheck } from "lucide-react";

const ICONS = { Sparkles, MonitorSmartphone, Cloud, ShieldCheck };

/**
 * Layout horizontal para ventajas: icono → texto → stat grande a la derecha.
 * Más limpio que las cards verticales.
 */
export default function AdvantageRow({ items }) {
  return (
    <div className="space-y-4">
      {items.map((a) => {
        const Icon = ICONS[a.icon] || Sparkles;
        return (
          <div
            key={a.title}
            className="flex items-center gap-5 rounded-2xl border border-paper-300 bg-white p-5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            {/* Stat con emphasis a la derecha */}
            <div className="hidden w-24 shrink-0 text-center text-3xl font-extrabold tabular-nums text-wine-600 dark:text-wine-300 sm:block sm:text-4xl lg:text-5xl">
              {a.stat}
            </div>
            <div className="w-12 shrink-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-wine-50 text-wine-600 dark:bg-wine-900/30 dark:text-wine-300">
                <Icon size={22} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-ink-900 dark:text-white sm:text-lg">
                {a.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-600 dark:text-obsidian-300 sm:text-base">
                {a.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
