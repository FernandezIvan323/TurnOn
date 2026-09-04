import { Wallet, Calculator, AlertTriangle, CheckCircle2, Receipt, Lock } from "lucide-react";

/**
 * Formulario de corte de caja (arqueo) — distinto del MockCashClosing
 * (que muestra el resumen ya cerrado). Este está en modo "en acción".
 */
export default function MockCashierClosing() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2 dark:border-obsidian-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Corte de caja
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Arqueo en curso</p>
        </div>
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          En proceso
        </span>
      </div>

      {/* Resumen esperado */}
      <div className="mb-2 rounded-xl border border-paper-200 bg-white p-2.5 dark:border-obsidian-700 dark:bg-obsidian-900">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          Total del sistema
        </p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">$286.400</p>
          <div className="text-right text-[9px] text-ink-500 dark:text-obsidian-400">
            <p>24 pedidos cobrados</p>
            <p>8 mesas · 2 dom. · 1 pickup</p>
          </div>
        </div>
      </div>

      {/* Conteo del efectivo */}
      <div className="mb-2 rounded-xl border border-paper-200 bg-white p-2.5 dark:border-obsidian-700 dark:bg-obsidian-900">
        <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          <Calculator size={10} /> Efectivo en cajón
        </p>
        <div className="rounded-lg border border-paper-300 bg-paper-50 px-2.5 py-2 text-center text-sm font-bold tabular-nums text-ink-900 dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-white">
          $142.000
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-ink-500 dark:text-obsidian-400">
          <span>Esperado en efectivo</span>
          <span className="tabular-nums">$142.000</span>
        </div>
      </div>

      {/* Diferencia */}
      <div className="mb-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 dark:border-emerald-800 dark:bg-emerald-900/30">
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 size={11} /> Sin diferencia
        </span>
        <span className="text-xs font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
          $0
        </span>
      </div>

      {/* Aviso de pendientes */}
      <div className="mb-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 dark:border-amber-700 dark:bg-amber-900/20">
        <AlertTriangle size={10} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
        <p className="text-[9px] leading-tight text-amber-800 dark:text-amber-200">
          1 mesa sin cobrar no bloquea el corte. Las deudas se gestionan por separado.
        </p>
      </div>

      {/* CTA cierre */}
      <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-wine-600 text-xs font-bold text-white">
        <Lock size={12} /> Confirmar corte del día
      </button>
    </div>
  );
}
