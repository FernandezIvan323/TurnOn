import { BarChart3 } from "lucide-react";

const rows = [
  {
    label: "Mesa 4",
    status: "Lista para cobrar",
    amount: "$42.500",
    color:
      "bg-amber-100 text-amber-900 dark:bg-amber-500/25 dark:text-white",
  },
  {
    label: "Domicilio 18",
    status: "En camino",
    amount: "$31.000",
    color: "bg-blue-100 text-blue-900 dark:bg-blue-500/25 dark:text-white",
  },
  {
    label: "Pickup 7",
    status: "Preparación",
    amount: "$18.900",
    color: "bg-rose-100 text-rose-900 dark:bg-rose-500/25 dark:text-white",
  },
];

export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-paper-300 bg-paper-50 p-4 shadow-pop dark:border-obsidian-700 dark:bg-obsidian-900 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-paper-200 pb-4 dark:border-obsidian-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
            Operación de hoy
          </p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
            $286.400
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-600 text-white dark:bg-wine-600">
          <BarChart3 size={24} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Pedidos", "24"],
          ["Mesas", "8"],
          ["Stock bajo", "3"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-paper-200 bg-paper-100 p-3 dark:border-obsidian-700 dark:bg-obsidian-950"
          >
            <p className="text-xs font-medium text-ink-600 dark:text-white">{label}</p>
            <p className="mt-1 text-xl font-semibold text-ink-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-paper-200 bg-white px-4 py-3 dark:border-obsidian-700 dark:bg-obsidian-950"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                {row.label}
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.color}`}
              >
                {row.status}
              </span>
            </div>
            <p className="shrink-0 pl-3 text-sm font-semibold text-ink-800 dark:text-white">
              {row.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
