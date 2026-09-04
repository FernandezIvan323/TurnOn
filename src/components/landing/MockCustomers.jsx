import { Search, Phone, MapPin } from "lucide-react";

const customers = [
  { name: "Laura Martínez", phone: "555-3210", addr: "Av. Mitre 432 · Centro" },
  { name: "Andrés Rodríguez", phone: "555-7788", addr: "Calle 9 #215 · Norte" },
  { name: "Sofía Peralta", phone: "555-9900", addr: "Belgrano 88 · Oeste" },
];

export default function MockCustomers() {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
            Clientes
          </p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">
            Historial de domicilios
          </p>
        </div>
        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
          128 clientes
        </span>
      </div>

      {/* Búsqueda */}
      <div className="mb-2 flex items-center gap-1 rounded-lg border border-paper-300 bg-white px-2 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900">
        <Search size={11} className="text-ink-400 dark:text-obsidian-500" />
        <span className="text-[9px] text-ink-400 dark:text-obsidian-500">
          Buscar por teléfono o nombre…
        </span>
      </div>

      <div className="space-y-1">
        {customers.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 rounded-lg border border-paper-200 bg-white px-2.5 py-1.5 dark:border-obsidian-700 dark:bg-obsidian-900"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-ink-900 dark:text-white">
                {c.name}
              </p>
              <p className="flex items-center gap-1 text-[9px] text-ink-500 dark:text-obsidian-400">
                <Phone size={8} /> {c.phone}
                <span className="ml-1 inline-flex items-center gap-0.5">
                  <MapPin size={8} /> {c.addr}
                </span>
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-wine-50 px-1.5 py-0.5 text-[8px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
              Historial
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-ink-500 dark:text-obsidian-400">
        Historial de los últimos 10 pedidos por cliente
      </p>
    </div>
  );
}