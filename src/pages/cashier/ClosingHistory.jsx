import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header";
import { money, dateOnlyUTC } from "../../lib/format";
import { History, ArrowLeft, Receipt, Printer } from "lucide-react";

function dateOnly(iso) {
  return dateOnlyUTC(iso);
}

export default function ClosingHistory() {
  const [closings, setClosings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to)   params.to = to;
    const { data } = await api.get("/cash-closings", { params });
    setClosings(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <Header
        title="Histórico de cortes"
        subtitle="Listado de cierres Z realizados"
        right={
          <Link to="/cashier/closing" className="btn-secondary text-sm">
            <ArrowLeft size={14}/> Volver al corte
          </Link>
        }
      />

      <div className="flex flex-wrap items-end gap-2 mb-4 max-w-3xl">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={load} className="btn-primary">Buscar</button>
        {(from || to) && (
          <button
            onClick={() => { setFrom(""); setTo(""); setTimeout(load, 0); }}
            className="btn-ghost text-sm"
          >
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Cargando…</div>
      ) : closings.length === 0 ? (
        <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">
          <History size={32} className="mx-auto text-ink-300 dark:text-obsidian-300 mb-2"/>
          No hay cortes registrados todavía.
        </div>
      ) : (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[48rem]">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-right">Efectivo</th>
                  <th className="text-right">Esperado</th>
                  <th className="text-right">Contado</th>
                  <th className="text-right">Diferencia</th>
                  <th>Cerrado por</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {closings.map((c) => {
                  const d = Number(c.difference);
                  const diffClass =
                    Math.abs(d) < 0.01
                      ? "text-emerald-700 dark:text-emerald-300"
                      : d > 0
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-rose-700 dark:text-rose-300";
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <td className="cell-strong">{dateOnly(c.closing_date)}</td>
                      <td className="text-right tabular-nums">{c.total_orders}</td>
                      <td className="cell-money">{money(c.total_sales)}</td>
                      <td className="text-right tabular-nums">{money(c.cash_sales)}</td>
                      <td className="text-right tabular-nums">{money(c.expected_cash)}</td>
                      <td className="text-right tabular-nums">{money(c.counted_cash)}</td>
                      <td className={`text-right font-semibold tabular-nums ${diffClass}`}>
                        {d > 0 ? "+" : ""}{money(d)}
                      </td>
                      <td className="cell-muted">{c.closed_by_name || "—"}</td>
                      <td className="text-right">
                        <Receipt size={14} className="text-ink-400"/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div
            className="card w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            id="closing-printable"
          >
            <div className="flex items-start justify-between mb-3 print:hidden">
              <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">Corte del {dateOnly(selected.closing_date)}</h2>
              <button onClick={() => setSelected(null)} className="btn-ghost text-sm">Cerrar</button>
            </div>

            <div className="closing-print-header mb-3 hidden border-b border-obsidian-600 pb-3 print:block">
              <div className="flex items-center gap-3">
                <img
                  src="/favicon.svg"
                  alt="TurnOn"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div>
                  <div className="text-lg font-bold text-white">TurnOn</div>
                  <div className="text-xs text-zinc-300">Gestión del restaurant</div>
                </div>
              </div>
              <h1 className="mt-3 text-base font-bold text-white">Corte de caja</h1>
              <div className="text-sm text-zinc-200">
                {dateOnly(selected.closing_date)} · Cajero: {selected.closed_by_name || "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="bg-paper-100 dark:bg-obsidian-950 rounded-xl p-3">
                <div className="text-xs text-ink-500 dark:text-obsidian-400">Ventas</div>
                <div className="font-bold text-ink-800 dark:text-obsidian-50">{money(selected.total_sales)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{selected.total_orders} pedidos</div>
              </div>
              <div className={`rounded-xl p-3 ${
                Math.abs(Number(selected.difference)) < 0.01
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : Number(selected.difference) > 0
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-rose-50 dark:bg-rose-900/20"
              }`}>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">Diferencia</div>
                <div className="font-bold">{Number(selected.difference) > 0 ? "+" : ""}{money(selected.difference)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">
                  Esp. {money(selected.expected_cash)} · Con. {money(selected.counted_cash)}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-ink-500 dark:text-obsidian-400">Efectivo</span><span className="font-medium">{money(selected.cash_sales)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500 dark:text-obsidian-400">Tarjeta</span><span className="font-medium">{money(selected.card_sales)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500 dark:text-obsidian-400">Transferencia</span><span className="font-medium">{money(selected.transfer_sales)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500 dark:text-obsidian-400">Mixto</span><span className="font-medium">{money(selected.mixed_sales)}</span></div>
            </div>

            {selected.notes && (
              <div className="mt-3 p-3 rounded-xl bg-paper-100 dark:bg-obsidian-950 text-sm text-ink-700 dark:text-obsidian-100 whitespace-pre-wrap">
                {selected.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 print:hidden">
              <button onClick={() => window.print()} className="btn-secondary text-sm">
                <Printer size={14}/> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
