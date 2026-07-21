/** Marcos laptop / phone realistas para mockups de la landing. */

export default function DeviceFrame({
  variant = "laptop",
  children,
  className = "",
  label,
  /** tilt 3D: "left" | "right" | "none" */
  tilt = "none",
  /** animación flotante sutil */
  float = false,
  /** desfase del float para no sincronizar con otro dispositivo */
  floatDelay = false,
}) {
  const tiltClass =
    tilt === "left"
      ? "device-tilt-left"
      : tilt === "right"
        ? "device-tilt-right"
        : "";
  const floatClass = float
    ? `device-float${floatDelay ? " device-float-delay" : ""}`
    : "";

  if (variant === "phone") {
    return (
      <div className={`mx-auto w-full max-w-[220px] sm:max-w-[240px] ${className}`}>
        {label && (
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            {label}
          </p>
        )}
        <div
          className={`device-3d relative ${tiltClass} ${floatClass}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Cuerpo del teléfono */}
          <div className="relative rounded-[2.1rem] border-[7px] border-ink-900 bg-ink-900 p-1.5 shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.45)] dark:border-obsidian-800 dark:bg-obsidian-900">
            {/* Botones laterales (volumen / power) */}
            <div className="absolute -left-[9px] top-24 h-8 w-[3px] rounded-l-sm bg-ink-700 dark:bg-obsidian-700" />
            <div className="absolute -left-[9px] top-36 h-12 w-[3px] rounded-l-sm bg-ink-700 dark:bg-obsidian-700" />
            <div className="absolute -right-[9px] top-32 h-14 w-[3px] rounded-r-sm bg-ink-700 dark:bg-obsidian-700" />

            {/* Notch */}
            <div className="absolute left-1/2 top-2.5 z-10 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-ink-950 dark:bg-black" />

            {/* Pantalla */}
            <div className="overflow-hidden rounded-[1.55rem] bg-white dark:bg-obsidian-900">
              <div className="min-h-[420px] max-h-[460px] overflow-hidden pt-6 sm:min-h-[440px]">
                {children}
              </div>
            </div>

            {/* Home indicator */}
            <div className="mx-auto mt-1.5 h-1 w-16 rounded-full bg-white/35" />
          </div>
        </div>
      </div>
    );
  }

  // laptop
  return (
    <div className={`mx-auto w-full max-w-xl lg:max-w-2xl ${className}`}>
      {label && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
          {label}
        </p>
      )}
      <div
        className={`device-3d relative ${tiltClass} ${floatClass}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Pantalla / lid */}
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-ink-800 bg-ink-900 shadow-[0_25px_50px_-15px_rgb(0_0_0_/_0.4)] dark:border-obsidian-700">
          {/* Bisel superior fino */}
          <div className="flex items-center justify-center bg-ink-950 py-1.5 dark:bg-black">
            <div className="h-1.5 w-1.5 rounded-full bg-ink-700 ring-1 ring-ink-600/50" />
          </div>
          {/* Chrome bar */}
          <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-950 px-3 py-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
            </div>
            <div className="mx-auto flex h-6 max-w-xs flex-1 items-center rounded-md bg-ink-800 px-3 text-[10px] text-ink-400">
              turnon.app / panel
            </div>
          </div>
          <div className="bg-paper-50 dark:bg-obsidian-950">{children}</div>
        </div>

        {/* Bisagra */}
        <div className="h-1.5 w-full bg-gradient-to-b from-ink-700 to-ink-800 dark:from-obsidian-700 dark:to-obsidian-800" />

        {/* Base / teclado */}
        <div className="relative mx-auto">
          <div className="h-3 w-full rounded-b-xl bg-gradient-to-b from-ink-800 to-ink-900 shadow-md dark:from-obsidian-800 dark:to-obsidian-900" />
          {/* Trackpad hint */}
          <div className="absolute left-1/2 top-0.5 h-1.5 w-[28%] -translate-x-1/2 rounded-sm bg-ink-700/80 dark:bg-obsidian-700" />
          {/* Pie frontal */}
          <div className="mx-auto h-1 w-[38%] rounded-b-md bg-ink-700 dark:bg-obsidian-700" />
        </div>
      </div>
    </div>
  );
}
