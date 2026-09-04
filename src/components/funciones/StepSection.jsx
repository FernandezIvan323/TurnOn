import { CheckCircle2 } from "lucide-react";

/**
 * Paso de la página de funciones: título, subtítulo, bullets y mock visual.
 * Vehicle + frame están separados para permitir variantes "none" (baremo) y "phone".
 */
export default function StepSection({
  title,
  subtitle,
  bullets = [],
  children,     // El dispositivo/mock (ya envuelto en DeviceFrame)
  reverse = false,
}) {
  return (
    <div
      className={`flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Texto */}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-ink-600 dark:text-obsidian-300 sm:text-lg">
          {subtitle}
        </p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-wine-600 dark:text-wine-300"
              />
              <span className="text-sm leading-relaxed text-ink-700 dark:text-obsidian-300 sm:text-base">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Dispositivo */}
      <div className="flex flex-1 justify-center lg:max-w-xl">
        {children}
      </div>
    </div>
  );
}
