import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Truck,
  Utensils,
  WalletCards,
} from "lucide-react";

const DEFAULT_BULLETS = [
  { icon: Utensils, text: "Mesas y turnos en un solo tablero" },
  { icon: Truck, text: "Domicilios y para llevar sin caos" },
  { icon: WalletCards, text: "Caja, cobros y reportes del día" },
];

function BackToHomeButton({ compact = false }) {
  if (compact) {
    return (
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 rounded-full border border-wine-200 bg-wine-50 px-3 py-1.5 text-xs font-semibold text-wine-700 transition-all duration-200 hover:border-wine-400 hover:bg-wine-100 dark:border-wine-500/40 dark:bg-wine-900/30 dark:text-wine-300 dark:hover:border-wine-400 dark:hover:bg-wine-900/50"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Inicio
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-paper-300 bg-paper-50 px-5 py-3 text-sm font-semibold text-ink-900 shadow-soft transition-all duration-200 hover:border-wine-400 hover:shadow-card dark:border-obsidian-700 dark:bg-obsidian-900 dark:text-white dark:hover:border-wine-500/50"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-wine-600" />
      <span className="flex size-8 items-center justify-center rounded-lg border border-wine-200 bg-wine-50 transition-colors group-hover:bg-wine-100 dark:border-wine-500/30 dark:bg-wine-900/40">
        <Home className="size-4 text-wine-600 dark:text-wine-300" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wider text-wine-600 dark:text-wine-300">
          TurnOn
        </span>
        <span className="text-sm font-semibold text-ink-900 transition-colors group-hover:text-wine-600 dark:text-white dark:group-hover:text-wine-300">
          Volver al inicio
        </span>
      </span>
      <ArrowLeft className="ml-auto size-4 text-ink-400 transition-all group-hover:-translate-x-1 group-hover:text-wine-600 dark:text-white/70 dark:group-hover:text-wine-300" />
    </Link>
  );
}

/**
 * Split layout for Login — brand only on left panel (desktop).
 * Form side has no logo/name to avoid duplication.
 */
export default function AuthSplitLayout({
  title,
  subtitle,
  badge = "Acceso al sistema",
  children,
  footer,
  bullets = DEFAULT_BULLETS,
}) {
  return (
    <div className="flex min-h-svh w-full overflow-x-hidden bg-white text-ink-800 dark:bg-obsidian-950 dark:text-white">
      {/* Panel marca — negro; único lugar con logo + nombre en desktop */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-950 p-10 text-white lg:flex xl:p-14 dark:bg-obsidian-950">
        <div className="pointer-events-none absolute inset-0 bg-ink-950 dark:bg-obsidian-950" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-wine-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-1/4 size-64 rounded-full bg-white/5 blur-[90px]" />

        <div className="relative z-10">
          <Link to="/" className="group inline-flex items-center gap-2.5">
            <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl shadow-soft ring-1 ring-white/15">
              <img
                src="/favicon.svg"
                alt=""
                className="h-full w-full object-cover"
                width={44}
                height={44}
              />
            </span>
            <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-wine-300">
              TurnOn
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-300">
              Acceso al panel
            </p>
            <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
              Tu turno empieza{" "}
              <span className="text-wine-300">aquí</span>
            </h2>
          </div>
          <ul className="space-y-3">
            {bullets.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-wine-400/30 bg-wine-900/40">
                  <Icon className="size-4 text-wine-300" />
                </span>
                <span className="text-sm text-white">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          TurnOn · mesas · domicilios · caja
        </p>
      </aside>

      {/* Panel formulario — sin logo/nombre (no se repite) */}
      <main className="relative flex w-full flex-col justify-center overflow-hidden px-6 py-10 sm:px-10 lg:w-1/2 lg:px-12 xl:px-16">
        {/* Mobile: solo volver; logo está en el panel izquierdo en desktop */}
        <div className="relative z-10 mb-6 flex items-center justify-between gap-3 lg:hidden">
          <span className="text-lg font-bold text-ink-900 dark:text-white">TurnOn</span>
          <BackToHomeButton compact />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-5 space-y-2">
            <span className="inline-flex rounded-full border border-wine-200 bg-wine-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-wine-700 dark:border-wine-500/40 dark:bg-wine-900/40 dark:text-wine-300">
              {badge}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-light leading-relaxed text-ink-700 dark:text-white">
                {subtitle}
              </p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-card dark:border-obsidian-700 dark:bg-obsidian-900 sm:p-7">
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-wine-600" />
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-ink-600 dark:text-white">{footer}</div>
          )}

          <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-600 dark:text-white">
            Sistema de gestión para restaurante con mesas y domicilios.
          </p>

          <div className="mt-5 hidden lg:block">
            <BackToHomeButton />
          </div>
        </div>
      </main>
    </div>
  );
}
