import { Sparkles, ShoppingBag, Utensils, MonitorSmartphone, Truck } from "lucide-react";

const ICONS = { Sparkles, ShoppingBag, Utensils, MonitorSmartphone, Truck };

/**
 * Grid bento para "tipos de local": un hero grande + 5 cards compactas.
 * Mobile: grid simple (3 columnas o 2).
 */
export default function BentoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {items.map((t, i) => {
        const Icon = ICONS[t.icon] || Sparkles;
        const isHero = i === 0;
        return (
          <div
            key={t.key}
            className={`group flex flex-col justify-between rounded-2xl border p-4 transition-all hover:border-wine-400 hover:shadow-card dark:hover:border-wine-500/40 sm:p-5 ${
              isHero
                ? "col-span-2 flex-row items-start gap-4 bg-paper-50 sm:col-span-3 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:flex-col lg:gap-6 lg:p-6 dark:border-obsidian-700 dark:bg-obsidian-900"
                : "border-paper-300 bg-white dark:border-obsidian-700 dark:bg-obsidian-900"
            }`}
          >
            <div className={`flex items-center gap-3 ${isHero ? "shrink-0" : "flex-col items-start gap-2"}`}>
              <span
                className={`rounded-xl bg-wine-50 text-wine-600 dark:bg-wine-900/40 dark:text-wine-300 ${
                  isHero ? "flex-row items-center justify-center p-3" : "flex h-10 w-10 items-center justify-center p-0"
                }`}
              >
                <Icon size={isHero ? 20 : 20} />
              </span>
              <div>
                <p
                  className={`font-bold text-ink-900 dark:text-white ${
                    isHero ? "text-lg sm:text-xl lg:text-2xl" : "text-sm sm:text-base"
                  }`}
                >
                  {t.label}
                </p>
                {isHero && (
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-600 dark:text-obsidian-300 lg:text-base">
                    {t.desc}
                  </p>
                )}
              </div>
            </div>
            {/* Descripción oculta en mobile cuando es hero y se ve en mobile */}
            {!isHero && (
              <p className="mt-2 text-xs leading-snug text-ink-500 dark:text-obsidian-400 sm:text-sm">
                {t.desc}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
