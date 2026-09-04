import { KeyRound, ArrowRight } from "lucide-react";

/**
 * Mock simplificado del login (AuthSplitLayout + teclado PIN visual).
 * Muestra la primera impresión del sistema: acceso con usuario + PIN.
 */
export default function MockLogin() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center bg-gradient-to-br from-paper-100 to-paper-200 p-4 dark:from-obsidian-900 dark:to-obsidian-950">
      <div className="w-full max-w-[280px] rounded-2xl border border-paper-200 bg-white p-5 shadow-card dark:border-obsidian-700 dark:bg-obsidian-900">
        {/* Logo + título */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-wine-600">
            <img src="/favicon.svg" alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">TurnOn</p>
            <p className="text-[10px] text-ink-500 dark:text-obsidian-400">
              Acceso al sistema
            </p>
          </div>
        </div>

        {/* Usuario */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Usuario
          </p>
          <div className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-xs font-medium text-ink-700 dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-obsidian-200">
            maria
          </div>
        </div>

        {/* PIN */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            PIN de 4 dígitos
          </p>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 dark:border-obsidian-700 dark:bg-obsidian-950">
            <KeyRound size={12} className="text-ink-400 dark:text-obsidian-500" />
            <span className="flex gap-1.5">
              {[1, 1, 1, 0].map((filled, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    filled ? "bg-wine-600 dark:bg-wine-400" : "bg-paper-300 dark:bg-obsidian-700"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-wine-600 text-xs font-semibold text-white"
        >
          Entrar al panel
          <ArrowRight size={14} />
        </button>

        <p className="mt-3 text-center text-[9px] text-ink-400 dark:text-obsidian-500">
          Sin tarjeta · Sin licencias · Sin instalación
        </p>
      </div>
    </div>
  );
}
