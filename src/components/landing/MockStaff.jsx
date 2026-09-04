import { Bike, UserPlus, Utensils, UserCog, KeyRound } from "lucide-react";

const tabs = [
  { label: "Repartidores", icon: Bike, active: true },
  { label: "Meseros", icon: UserPlus },
  { label: "Mesas", icon: Utensils },
  { label: "Asignar", icon: UserCog },
];

const riders = [
  { name: "Carlos Gómez", phone: "555-1234", status: "available" },
  { name: "Luis Peralta", phone: "555-9876", status: "busy" },
  { name: "Nadia Ruiz", phone: "555-5555", status: "offduty" },
];

const statusMeta = {
  available: { label: "Disponible", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  busy: { label: "Ocupado", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  offduty: { label: "Fuera de turno", cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
};

export default function MockStaff() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Personal y mesas
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Repartidores · 3 activos</p>
        </div>
        <span className="rounded-md bg-wine-50 px-2 py-0.5 text-[9px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
          3 mesas · 2 meseros
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-2 flex gap-1 rounded-lg bg-paper-200 p-0.5 dark:bg-obsidian-800">
        {tabs.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-1 text-[8px] font-bold sm:text-[9px] ${
              active
                ? "bg-white text-ink-900 shadow-sm dark:bg-obsidian-950 dark:text-white"
                : "text-ink-500 dark:text-obsidian-400"
            }`}
          >
            <Icon size={10} />
            <span className="hidden sm:inline">{label}</span>
          </span>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-paper-200 bg-white dark:border-obsidian-700 dark:bg-obsidian-900">
        <div className="grid grid-cols-4 gap-1 border-b border-paper-200 bg-paper-100 px-2 py-1.5 text-[8px] font-bold uppercase tracking-wide text-ink-500 dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-obsidian-400">
          <span>Nombre</span>
          <span>Teléfono</span>
          <span>Estado</span>
          <span className="text-right">Acceso</span>
        </div>
        {riders.map((r) => {
          const m = statusMeta[r.status];
          return (
            <div
              key={r.name}
              className="grid grid-cols-4 gap-1 border-b border-paper-100 px-2 py-1.5 last:border-0 dark:border-obsidian-800"
            >
              <span className="truncate text-[10px] font-semibold text-ink-900 dark:text-white">
                {r.name}
              </span>
              <span className="truncate text-[10px] tabular-nums text-ink-500 dark:text-obsidian-400">
                {r.phone}
              </span>
              <span>
                <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold ${m.cls}`}>
                  {m.label}
                </span>
              </span>
              <span className="text-right">
                {r.status !== "offduty" ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                    <KeyRound size={7} /> Con acceso
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-paper-200 px-1.5 py-0.5 text-[8px] font-bold text-ink-500 dark:bg-obsidian-800 dark:text-obsidian-300">
                    Sin acceso
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}