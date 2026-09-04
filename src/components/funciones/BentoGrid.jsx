import { Sparkles, ShoppingBag, Utensils, MonitorSmartphone, Truck } from "lucide-react";

const ICONS = { Sparkles, ShoppingBag, Utensils, MonitorSmartphone, Truck };

/**
 * Grid "Spotlight" para tipos de local: badge con gradiente wine + icono grande,
 * título y descripción, hover con lift e iluminación de borde.
 */
export default function BentoGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => {
        const Icon = ICONS[t.icon] || Sparkles;
        return (
          <div
            key={t.key}
            className="group relative overflow-hidden rounded-3xl border border-paper-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-wine-400/60 hover:shadow-pop dark:border-obsidian-800 dark:bg-obsidian-900 dark:hover:border-wine-500/50"
          >
            {/* Glow de fondo */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-wine-600/5 blur-2xl transition-opacity duration-300 group-hover:bg-wine-600/15" />

            <div className="relative flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-wine-600 to-wine-800 text-white shadow-lg shadow-wine-600/20 transition-transform duration-300 group-hover:scale-105">
                <Icon size={26} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">
                  {t.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-obsidian-300">
                  {t.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}