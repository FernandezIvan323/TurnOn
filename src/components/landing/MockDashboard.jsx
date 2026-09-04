import {
  BarChart3,
  Bike,
  DollarSign,
  Package,
  PackageCheck,
  Receipt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";

/**
 * Mock fiel al Dashboard real (AdminDashboard):
 * Dinero del día → Atención ahora → Del día.
 */
const money = [
  { label: "Ventas", value: "$286.400", icon: DollarSign, tone: "text-ink-900 dark:text-white", hint: "+12% vs ayer", hintTone: "text-emerald-600 dark:text-emerald-400" },
  { label: "Gastos", value: "$42.100", icon: TrendingDown, tone: "text-rose-700 dark:text-rose-300", hint: "3 registrados" },
  { label: "Neto", value: "$244.300", icon: TrendingUp, tone: "text-emerald-700 dark:text-emerald-300", hint: "$286.400 − $42.100" },
  { label: "Pedidos", value: "36", icon: Receipt, tone: "text-amber-700 dark:text-amber-300", hint: "Ticket prom. $7.955" },
];

const prep = [
  { label: "Mesas", value: 4, icon: Utensils, tone: "text-blue-700 dark:text-blue-300", alert: true },
  { label: "Domicilios", value: 2, icon: Bike, tone: "text-blue-700 dark:text-blue-300", alert: true },
  { label: "Para llevar", value: 1, icon: ShoppingBag, tone: "text-blue-700 dark:text-blue-300" },
];

const reparto = [
  { label: "Sin asignar", value: 2, icon: BarChart3, tone: "text-amber-700 dark:text-amber-300", alert: true },
  { label: "En camino", value: 3, icon: Bike, tone: "text-indigo-700 dark:text-indigo-300", alert: true },
];

const local = [
  { label: "Mesas activas", value: 8, icon: Utensils, tone: "text-rose-700 dark:text-rose-300" },
  { label: "Por cobrar", value: 3, icon: PackageCheck, tone: "text-sky-700 dark:text-sky-300", alert: true },
  { label: "Stock bajo", value: 2, icon: Package, tone: "text-rose-700 dark:text-rose-300", alert: true },
];

const top = [
  { name: "Muzzarella grande", qty: 12, rev: "$102.000" },
  { name: "Coca-Cola 1,5 L", qty: 8, rev: "$22.400" },
  { name: "Napolitana", qty: 6, rev: "$55.200" },
  { name: "Cerveza artesanal", qty: 5, rev: "$16.000" },
];

const channels = [
  { label: "Domicilios", n: 18, bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
  { label: "Mesas", n: 12, bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
  { label: "Para llevar", n: 6, bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
];

function SectionLabel({ children }) {
  return (
    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
      {children}
    </p>
  );
}

function OpMini({ label, value, icon: Icon, tone, alert }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-white px-2 py-1.5 dark:bg-obsidian-900 ${
        alert
          ? "border-amber-300 dark:border-amber-700"
          : "border-paper-200 dark:border-obsidian-700"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Icon size={11} className={tone} />
        <span className="text-[10px] font-medium text-ink-700 dark:text-obsidian-200">{label}</span>
      </span>
      <span className="text-sm font-bold tabular-nums text-ink-900 dark:text-white">{value}</span>
    </div>
  );
}

export default function MockDashboard({ compact = false }) {
  return (
    <div className="bg-paper-50 p-3 dark:bg-obsidian-950 sm:p-4">
      {/* Mini top bar */}
      <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2 dark:border-obsidian-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-wine-600">
            <img src="/favicon.svg" alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink-900 dark:text-white">TurnOn</p>
            <p className="text-[9px] text-ink-500 dark:text-obsidian-400">Resumen del día · Cajero</p>
          </div>
        </div>
        <span className="rounded-md bg-wine-50 px-1.5 py-0.5 text-[9px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
          Hoy
        </span>
      </div>

      {/* 1. Dinero del día */}
      <SectionLabel>Dinero del día</SectionLabel>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {money.map(({ label, value, icon: Icon, tone, hint, hintTone }) => (
          <div key={label} className="rounded-xl border border-paper-200 bg-white p-2 dark:border-obsidian-700 dark:bg-obsidian-900">
            <div className="flex items-center justify-between">
              <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
                {label}
              </span>
              <Icon size={11} className={`shrink-0 ${tone}`} />
            </div>
            <p className={`mt-0.5 text-lg font-bold tabular-nums ${tone}`}>{value}</p>
            {hint && <p className={`text-[8px] ${hintTone || "text-ink-400 dark:text-obsidian-500"}`}>{hint}</p>}
          </div>
        ))}
      </div>

      {/* 2. Atención ahora */}
      <SectionLabel>Atención ahora</SectionLabel>

      <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-ink-400 dark:text-obsidian-500">
        En preparación
      </p>
      <div className="mb-1.5 grid grid-cols-3 gap-1.5">
        {prep.map((o) => <OpMini key={o.label} {...o} />)}
      </div>

      <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-ink-400 dark:text-obsidian-500">
        Domicilios · reparto
      </p>
      <div className="mb-1.5 grid grid-cols-2 gap-1.5">
        {reparto.map((o) => <OpMini key={o.label} {...o} />)}
      </div>

      <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-ink-400 dark:text-obsidian-500">
        Local e inventario
      </p>
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {local.map((o) => <OpMini key={o.label} {...o} />)}
      </div>

      {/* 3. Del día */}
      {!compact && (
        <>
          <SectionLabel>Del día</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {/* Top productos */}
            <div className="rounded-xl border border-paper-200 bg-white p-2 dark:border-obsidian-700 dark:bg-obsidian-900">
              <p className="mb-1 text-[9px] font-semibold text-ink-700 dark:text-obsidian-100">Top productos</p>
              <div className="space-y-1">
                {top.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-wine-100 text-[8px] font-bold text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-ink-900 dark:text-white">
                      {p.name}
                    </span>
                    <span className="shrink-0 text-[9px] font-bold tabular-nums text-ink-900 dark:text-white">{p.qty} uds</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canales */}
            <div className="rounded-xl border border-paper-200 bg-white p-2 dark:border-obsidian-700 dark:bg-obsidian-900">
              <p className="mb-1 text-[9px] font-semibold text-ink-700 dark:text-obsidian-100">Canales del día</p>
              <div className="space-y-1.5">
                {channels.map((c) => (
                  <div key={c.label}>
                    <div className="mb-0.5 flex items-center justify-between text-[9px]">
                      <span className="font-medium text-ink-700 dark:text-obsidian-200">{c.label}</span>
                      <span className={`font-semibold tabular-nums ${c.text}`}>{c.n}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-paper-200 dark:bg-obsidian-800">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(c.n / 36) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}