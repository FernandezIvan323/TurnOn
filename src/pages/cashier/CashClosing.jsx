import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header";
import { money, typeLabels, statusLabels } from "../../lib/format";
import { todayLocalISO } from "../../lib/date";
import {
  Calculator,
  Banknote,
  CreditCard,
  Building2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  History,
  Printer,
  ArrowRight,
  XCircle,
  Landmark,
} from "lucide-react";

function todayISO() {
  return todayLocalISO();
}

function n(v) {
  return Number(v || 0);
}

function MethodRow({ icon: Icon, label, value, count }) {
  return (
    <div className="flex items-center justify-between border-b border-paper-200 py-2.5 last:border-b-0 dark:border-obsidian-700">
      <div className="flex min-w-0 items-center gap-2 text-sm text-ink-700 dark:text-white">
        <Icon size={14} className="shrink-0 text-ink-500 dark:text-white/70" />
        <span className="truncate">{label}</span>
        {count != null && (
          <span className="shrink-0 text-[11px] font-medium text-ink-500 dark:text-white/70">
            · {count} {count === 1 ? "pago" : "pagos"}
          </span>
        )}
      </div>
      <div className="shrink-0 text-sm font-semibold tabular-nums text-ink-900 dark:text-white">
        {money(value)}
      </div>
    </div>
  );
}

/** Panel: lo que debe estar en caja física vs en cuenta/banco */
function CashVsBankPanel({
  cashSales,
  cashCount,
  cardSales,
  cardCount,
  transferSales,
  transferCount,
  mixedSales,
  mixedCount,
  bankSales,
  bankCount,
  compact = false,
}) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
      <div className="rounded-xl border border-paper-300 bg-paper-50/80 p-4 dark:border-obsidian-700 dark:bg-obsidian-950">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Banknote size={16} />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-600 dark:text-white">
              En caja (efectivo)
            </div>
            <div className="text-[11px] text-ink-500 dark:text-white/80">
              Dinero físico en el cajón
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
          {money(cashSales)}
        </div>
        <div className="mt-1 text-xs text-ink-600 dark:text-white">
          {cashCount ?? 0} cobro{(cashCount ?? 0) === 1 ? "" : "s"} en efectivo
        </div>
      </div>

      <div className="rounded-xl border border-paper-300 bg-paper-50/80 p-4 dark:border-obsidian-700 dark:bg-obsidian-950">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            <Landmark size={16} />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-600 dark:text-white">
              En cuenta / banco
            </div>
            <div className="text-[11px] text-ink-500 dark:text-white/80">
              Transferencias + tarjeta (no va a la caja)
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-sky-800 dark:text-sky-300">
          {money(bankSales)}
        </div>
        <div className="mt-1 text-xs text-ink-600 dark:text-white">
          {bankCount ?? 0} pago{(bankCount ?? 0) === 1 ? "" : "s"} · no se arquea en efectivo
        </div>
        <div className="mt-3 space-y-1.5 border-t border-paper-200 pt-3 text-xs dark:border-obsidian-700">
          <div className="flex justify-between gap-2 text-ink-700 dark:text-white">
            <span className="inline-flex items-center gap-1">
              <Building2 size={12} /> Transferencias
              <span className="text-ink-500 dark:text-white/70">
                ({transferCount ?? 0})
              </span>
            </span>
            <span className="font-semibold tabular-nums">{money(transferSales)}</span>
          </div>
          <div className="flex justify-between gap-2 text-ink-700 dark:text-white">
            <span className="inline-flex items-center gap-1">
              <CreditCard size={12} /> Tarjeta
              <span className="text-ink-500 dark:text-white/70">
                ({cardCount ?? 0})
              </span>
            </span>
            <span className="font-semibold tabular-nums">{money(cardSales)}</span>
          </div>
          {n(mixedSales) > 0 && (
            <div className="flex justify-between gap-2 text-ink-700 dark:text-white">
              <span className="inline-flex items-center gap-1">
                <Wallet size={12} /> Mixto
                <span className="text-ink-500 dark:text-white/70">
                  ({mixedCount ?? 0})
                </span>
              </span>
              <span className="font-semibold tabular-nums">{money(mixedSales)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingBanner({ orders }) {
  if (!orders || orders.length === 0) return null;
  return (
    <div className="card border-amber-300/80 bg-amber-50/40 p-4 dark:border-amber-700/50 dark:bg-amber-900/15">
      <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900 dark:text-white">
        <AlertTriangle size={18} />
        Hay {orders.length} pedido{orders.length === 1 ? "" : "s"} pendiente
        {orders.length === 1 ? "" : "s"} de cobro
      </div>
      <p className="mb-3 text-xs text-amber-900 dark:text-white">
        Para hacer el corte, cobrá o cancelá todos los pedidos abiertos.
      </p>
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {orders.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-lg border border-paper-200 bg-paper-50 px-3 py-1.5 text-xs dark:border-obsidian-700 dark:bg-obsidian-950"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-ink-600 dark:text-white">#{o.id}</span>
              <span className="badge bg-paper-200 text-ink-800 dark:bg-obsidian-800 dark:text-white">
                {typeLabels[o.type] || o.type}
              </span>
              <span className="truncate text-ink-800 dark:text-white">
                {o.type === "table"
                  ? `Mesa ${o.table_number || "?"}`
                  : o.customer_name || "—"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="badge bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-white">
                {statusLabels[o.status] || o.status}
              </span>
              <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                {money(o.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link to="/cashier" className="btn-secondary mt-3 w-full text-sm">
        Ir a Caja <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function ClosingDetail({ closing, date, onReset }) {
  const diff = n(closing.difference);
  const exact = Math.abs(diff) < 0.01;
  const over = diff > 0;
  const diffColor = exact
    ? "text-emerald-700 dark:text-emerald-300"
    : over
      ? "text-blue-700 dark:text-blue-300"
      : "text-rose-700 dark:text-rose-300";
  const diffLabel = exact
    ? "Cuadre exacto"
    : over
      ? `Sobrante de ${money(diff)}`
      : `Faltante de ${money(Math.abs(diff))}`;
  const diffBg = exact
    ? "bg-emerald-50/80 dark:bg-emerald-900/20"
    : over
      ? "bg-blue-50/80 dark:bg-blue-900/20"
      : "bg-rose-50/80 dark:bg-rose-900/20";

  const bankSales =
    closing.bank_sales != null
      ? n(closing.bank_sales)
      : n(closing.card_sales) + n(closing.transfer_sales);
  const bankCount =
    closing.bank_count != null
      ? n(closing.bank_count)
      : n(closing.card_count) + n(closing.transfer_count);

  return (
    <div className="space-y-4" id="closing-printable">
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3 print:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
              Corte del día
            </div>
            <h2 className="text-2xl font-bold text-ink-900 dark:text-white">{date}</h2>
            <div className="mt-0.5 text-xs text-ink-600 dark:text-white">
              Cerrado por{" "}
              <span className="font-semibold">{closing.closed_by_name || "—"}</span>
              {" · "}
              {new Date(closing.closed_at).toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-secondary text-sm" type="button">
              <Printer size={14} /> Imprimir
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="btn-ghost text-sm"
                title="Cerrar otro día"
                type="button"
              >
                <XCircle size={14} /> Otro día
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 hidden print:block">
          <h1 className="text-xl font-bold">Corte de caja</h1>
          <div className="text-sm">TurnOn · {date}</div>
          <div className="text-sm">Cajero: {closing.closed_by_name || "—"}</div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-paper-300 bg-paper-100/80 p-4 dark:border-obsidian-700 dark:bg-obsidian-950">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
              Ventas totales
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
              {money(closing.total_sales)}
            </div>
            <div className="mt-1 text-xs text-ink-600 dark:text-white">
              {closing.total_orders} pedido
              {closing.total_orders === 1 ? "" : "s"} cobrado
              {closing.total_orders === 1 ? "" : "s"}
            </div>
          </div>
          <div className={`rounded-xl border border-transparent p-4 ${diffBg}`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
              Diferencia de caja (efectivo)
            </div>
            <div className={`mt-1 text-2xl font-bold ${diffColor}`}>{diffLabel}</div>
            <div className="mt-1 text-xs text-ink-600 dark:text-white">
              Esperado {money(closing.expected_cash)} · Contado {money(closing.counted_cash)}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">
            ¿Dónde está el dinero?
          </h3>
          <CashVsBankPanel
            cashSales={closing.cash_sales}
            cashCount={closing.cash_count}
            cardSales={closing.card_sales}
            cardCount={closing.card_count}
            transferSales={closing.transfer_sales}
            transferCount={closing.transfer_count}
            mixedSales={closing.mixed_sales}
            mixedCount={closing.mixed_count}
            bankSales={bankSales}
            bankCount={bankCount}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-paper-300 p-4 dark:border-obsidian-700">
            <h3 className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">
              Desglose por método
            </h3>
            <MethodRow
              icon={Banknote}
              label="Efectivo"
              value={closing.cash_sales}
              count={closing.cash_count}
            />
            <MethodRow
              icon={Building2}
              label="Transferencia"
              value={closing.transfer_sales}
              count={closing.transfer_count}
            />
            <MethodRow
              icon={CreditCard}
              label="Tarjeta"
              value={closing.card_sales}
              count={closing.card_count}
            />
            <MethodRow
              icon={Wallet}
              label="Mixto"
              value={closing.mixed_sales}
              count={closing.mixed_count}
            />
            <div className="mt-1 flex items-center justify-between border-t border-paper-300 pt-2.5 dark:border-obsidian-700">
              <div className="text-sm font-semibold text-ink-900 dark:text-white">Total</div>
              <div className="text-base font-bold tabular-nums text-ink-900 dark:text-white">
                {money(closing.total_sales)}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-paper-300 p-4 dark:border-obsidian-700">
            <h3 className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">
              Arqueo de efectivo
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-700 dark:text-white">Fondo inicial</span>
                <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                  {money(closing.initial_cash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700 dark:text-white">+ Ventas en efectivo</span>
                <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                  {money(closing.cash_sales)}
                </span>
              </div>
              <div className="flex justify-between border-t border-paper-300 pt-2 dark:border-obsidian-700">
                <span className="font-medium text-ink-900 dark:text-white">Esperado en caja</span>
                <span className="font-bold tabular-nums text-ink-900 dark:text-white">
                  {money(closing.expected_cash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700 dark:text-white">Contado físicamente</span>
                <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                  {money(closing.counted_cash)}
                </span>
              </div>
              <div
                className={`flex justify-between border-t border-paper-300 pt-2 dark:border-obsidian-700 ${diffColor}`}
              >
                <span className="font-medium">Diferencia</span>
                <span className="font-bold tabular-nums">
                  {diff > 0 ? "+" : ""}
                  {money(diff)}
                </span>
              </div>
              <p className="pt-1 text-[11px] text-ink-500 dark:text-white/80">
                Transferencias y tarjeta no entran en este arqueo: ya están en la cuenta.
              </p>
            </div>
          </div>
        </div>

        {closing.notes && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-ink-900 dark:text-white">
              Observaciones
            </h3>
            <div className="rounded-xl border border-paper-300 p-3 text-sm whitespace-pre-wrap text-ink-800 dark:border-obsidian-700 dark:text-white">
              {closing.notes}
            </div>
          </div>
        )}

        <div className="mt-6 hidden border-t border-ink-200 pt-4 text-xs text-ink-500 print:block">
          Generado el {new Date().toLocaleString("es-MX")} · TurnOn
        </div>
      </div>
    </div>
  );
}

function ClosingForm({ preview, date, onSuccess }) {
  const [initialCash, setInitialCash] = useState(0);
  const [countedCash, setCountedCash] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [submitPending, setSubmitPending] = useState([]);

  const cashSales = n(preview.cash_sales);
  const expected = n(initialCash) + cashSales;
  const diff = n(countedCash) - expected;
  const net = preview.expense_summary?.net;

  const bankSales =
    preview.bank_sales != null
      ? n(preview.bank_sales)
      : n(preview.card_sales) + n(preview.transfer_sales);
  const bankCount =
    preview.bank_count != null
      ? n(preview.bank_count)
      : n(preview.card_count) + n(preview.transfer_count);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    setSubmitPending([]);
    try {
      await api.post("/cash-closings", {
        closing_date: date,
        initial_cash: initialCash,
        counted_cash: countedCash,
        notes: notes.trim() || null,
      });
      onSuccess();
    } catch (e) {
      const data = e.response?.data;
      setErr(data?.error || e.message || "No se pudo cerrar la caja");
      if (Array.isArray(data?.pending_orders) && data.pending_orders.length) {
        setSubmitPending(data.pending_orders);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-5 p-5 sm:p-6" id="closing-form">
      {/* Totales del día */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
          Resumen del día · {date}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-paper-300 bg-paper-100/70 p-3 dark:border-obsidian-700 dark:bg-obsidian-950">
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Ventas</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-ink-900 dark:text-white">
              {money(preview.total_sales)}
            </div>
          </div>
          <div className="rounded-xl border border-paper-300 bg-paper-100/70 p-3 dark:border-obsidian-700 dark:bg-obsidian-950">
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Pedidos</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-ink-900 dark:text-white">
              {preview.total_orders}
            </div>
          </div>
          <div className="rounded-xl border border-paper-300 bg-paper-100/70 p-3 dark:border-obsidian-700 dark:bg-obsidian-950">
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">En caja</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-ink-900 dark:text-white">
              {money(cashSales)}
            </div>
            <div className="text-[10px] text-ink-500 dark:text-white/80">
              {preview.cash_count ?? 0} efectivo
            </div>
          </div>
          <div className="rounded-xl border border-paper-300 bg-paper-100/70 p-3 dark:border-obsidian-700 dark:bg-obsidian-950">
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Neto del día</div>
            <div
              className={`mt-0.5 text-lg font-bold tabular-nums ${
                net == null
                  ? "text-ink-900 dark:text-white"
                  : net >= 0
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300"
              }`}
            >
              {money(net ?? preview.total_sales)}
            </div>
            <div className="text-[10px] text-ink-500 dark:text-white/80">
              {preview.expense_summary
                ? `Gastos −${money(preview.expense_summary.total_expenses)}`
                : "Informativo"}
            </div>
          </div>
        </div>
      </div>

      {/* Caja vs cuenta */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
          ¿Dónde está el dinero?
        </div>
        <CashVsBankPanel
          cashSales={cashSales}
          cashCount={preview.cash_count}
          cardSales={preview.card_sales}
          cardCount={preview.card_count}
          transferSales={preview.transfer_sales}
          transferCount={preview.transfer_count}
          mixedSales={preview.mixed_sales}
          mixedCount={preview.mixed_count}
          bankSales={bankSales}
          bankCount={bankCount}
        />
        {n(preview.mixed_sales) > 0 && (
          <p className="mt-2 text-[11px] text-ink-500 dark:text-white/80">
            Los pagos mixtos se listan aparte: parte puede ser efectivo y parte cuenta.
          </p>
        )}
      </div>

      {/* Arqueo solo efectivo */}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-white">
          Arqueo de caja física
        </div>
        <p className="mb-3 text-xs text-ink-600 dark:text-white">
          Solo contás el efectivo. Las {preview.transfer_count ?? 0} transferencia
          {(preview.transfer_count ?? 0) === 1 ? "" : "s"} (
          {money(preview.transfer_sales)}) y la tarjeta ya están en la cuenta.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label text-ink-700 dark:text-white">Fondo inicial (caja chica)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500 dark:text-white/60">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-7"
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <div>
            <label className="label text-ink-700 dark:text-white">Efectivo contado en caja</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500 dark:text-white/60">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-7"
                value={countedCash}
                onChange={(e) => setCountedCash(Number(e.target.value) || 0)}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-paper-300 bg-paper-50 p-4 dark:border-obsidian-700 dark:bg-obsidian-950">
          <div>
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Esperado</div>
            <div className="text-base font-bold tabular-nums text-ink-900 dark:text-white">
              {money(expected)}
            </div>
            <div className="text-[10px] text-ink-500 dark:text-white/70">
              fondo + efectivo
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Contado</div>
            <div className="text-base font-bold tabular-nums text-ink-900 dark:text-white">
              {money(countedCash)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-ink-600 dark:text-white">Diferencia</div>
            <div
              className={`text-base font-bold tabular-nums ${
                Math.abs(diff) < 0.01
                  ? "text-emerald-700 dark:text-emerald-300"
                  : diff > 0
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-rose-700 dark:text-rose-300"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {money(diff)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="label text-ink-700 dark:text-white">Observaciones (opcional)</label>
        <textarea
          className="input min-h-[70px] resize-y"
          placeholder="Ej: Faltante por error en cambio…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {err && (
        <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-white">
          <div className="flex items-center gap-1.5 font-medium">
            <XCircle size={16} className="shrink-0" />
            {err}
          </div>
          {submitPending.length > 0 && (
            <ul className="max-h-28 space-y-1 overflow-y-auto pl-1 text-xs">
              {submitPending.map((o) => (
                <li key={o.id} className="flex justify-between gap-2">
                  <span>
                    #{o.id} · {typeLabels[o.type] || o.type}
                    {o.table_number
                      ? ` · Mesa ${o.table_number}`
                      : o.customer_name
                        ? ` · ${o.customer_name}`
                        : ""}
                  </span>
                  <span className="shrink-0 font-semibold">{money(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
          {submitPending.length > 0 && (
            <Link
              to="/cashier"
              className="inline-flex items-center gap-1 text-xs font-medium underline"
            >
              Ir a Caja <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-paper-300 bg-paper-100/80 p-3 text-xs text-ink-700 dark:border-obsidian-700 dark:bg-obsidian-950 dark:text-white">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
        <div>
          Una vez confirmado, el corte <strong>no se puede modificar ni eliminar</strong>. Queda
          como registro histórico.
        </div>
      </div>

      <button
        onClick={submit}
        disabled={busy}
        className="btn-primary w-full py-3 text-base"
        type="button"
      >
        <CheckCircle2 size={18} />
        {busy ? "Cerrando caja…" : "Confirmar corte de caja"}
      </button>
    </div>
  );
}

export default function CashClosing() {
  const [date, setDate] = useState(todayISO());
  const [preview, setPreview] = useState(null);
  const [closing, setClosing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async (d) => {
    setLoading(true);
    setErr(null);
    try {
      const [{ data }, expRes] = await Promise.all([
        api.get("/cash-closings/preview", { params: { date: d } }),
        api.get("/expenses/summary", { params: { date: d } }).catch(() => ({ data: null })),
      ]);
      data.expense_summary = expRes?.data || null;
      setPreview(data);
      if (data.already_closed) {
        const { data: detail } = await api.get(`/cash-closings/${data.already_closed.id}`);
        setClosing(detail);
      } else {
        setClosing(null);
      }
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(date);
  }, [date]);

  const isToday = date === todayISO();
  const blocked = preview && preview.pending_count > 0;
  const alreadyClosed = !!closing;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Header
        title="Corte de caja"
        subtitle="Cierre Z · Caja física vs cuenta bancaria"
        right={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="input py-1.5 text-sm"
            />
            <Link to="/cashier/closing/history" className="btn-secondary text-sm">
              <History size={14} /> Histórico
            </Link>
          </div>
        }
      />

      <div className="space-y-4">
        {!isToday && !alreadyClosed && (
          <div className="card flex items-center gap-2 border-paper-300 p-3 text-sm text-ink-800 dark:border-obsidian-700 dark:text-white">
            <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-300" />
            Estás cerrando un día anterior ({date}). Confirmá que sea el correcto.
          </div>
        )}

        {loading ? (
          <div className="card p-8 text-center text-ink-600 dark:text-white">Cargando…</div>
        ) : err ? (
          <div className="card p-4 text-sm text-rose-700 dark:text-white">{err}</div>
        ) : !preview ? null : alreadyClosed ? (
          <ClosingDetail closing={closing} date={date} onReset={() => setDate(todayISO())} />
        ) : blocked ? (
          <>
            <PendingBanner orders={preview.pending_orders} />
            <div className="card p-4 text-sm text-ink-700 dark:text-white">
              <Calculator size={18} className="mr-1.5 inline" />
              Cuando cobres o canceles los pendientes, volvé acá para hacer el corte.
            </div>
          </>
        ) : (
          <>
            <div className="card flex items-center gap-2 border-paper-300 p-3 text-sm text-ink-800 dark:border-obsidian-700 dark:text-white">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-300" />
              Sin pedidos pendientes. Podés hacer el corte del {date}.
            </div>
            <ClosingForm preview={preview} date={date} onSuccess={() => load(date)} />
          </>
        )}
      </div>
    </div>
  );
}
