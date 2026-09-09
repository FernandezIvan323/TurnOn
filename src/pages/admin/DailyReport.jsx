import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { todayLocalISO } from "../../lib/date";
import { money } from "../../lib/format";
import { Printer, ArrowLeft, Wallet, CreditCard, Building2, Receipt, Utensils, Truck, ShoppingBag, AlertTriangle, Bike, TrendingDown } from "lucide-react";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function DailyReport() {
  useDocumentTitle("Reporte diario");
  const { user } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const reportDate = useMemo(() => {
    const q = searchParams.get("date");
    return q && DATE_RE.test(q) ? q : todayLocalISO();
  }, [searchParams]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  const load = async (date) => {
    setLoading(true);
    try {
      const { data } = await api.get("/reports/daily-complete", {
        params: { date },
      });
      setData(data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(reportDate); }, [reportDate]);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Solo administradores.</div>;
  }

  const s = data?.summary;
  const e = data?.expenses;
  const net = s ? Number(s.total_sales) + Number(s.total_tips) - Number(e?.total_expenses || 0) : 0;
  const debts = data?.debts || [];
  const riders = (data?.riders || []).filter((r) => Number(r.deliveries) > 0);
  const totalToSettle = riders.reduce((sum, r) => sum + Number(r.cash_to_settle || 0), 0);

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => nav(-1)} className="btn-secondary">
          <ArrowLeft size={16}/> Volver
        </button>
        <button
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Printer size={16}/> Imprimir / Guardar PDF
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-ink-500 dark:text-obsidian-400">Generando reporte…</div>
      ) : !data ? (
        <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Error al cargar el reporte.</div>
      ) : (
        <div ref={printRef} id="daily-report" className="space-y-6 max-w-3xl mx-auto">
          {/* Encabezado */}
          <div className="text-center border-b border-ink-200 dark:border-obsidian-700 pb-4 mb-2">
            <h1 className="text-2xl font-bold text-ink-800 dark:text-obsidian-50">Reporte Diario</h1>
            <p className="text-sm text-ink-500 dark:text-obsidian-400">{data.date}</p>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Ventas brutas</div>
              <div className="text-xl font-bold text-ink-800 dark:text-obsidian-50">{money(s?.total_sales || 0)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Propinas</div>
              <div className="text-xl font-bold text-ink-800 dark:text-obsidian-50">{money(s?.total_tips || 0)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Gastos</div>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-300">{money(e?.total_expenses || 0)}</div>
            </div>
            <div className="card p-4 text-center border-2 border-wine-400">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Neto del día</div>
              <div className="text-xl font-bold text-wine-600 dark:text-wine-300">{money(net)}</div>
            </div>
          </div>

          {/* Dinero por canal */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-3 flex items-center gap-2">
              <Receipt size={16}/> Dinero por canal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-sky-50 p-3 text-center dark:bg-sky-900/20">
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-300"><Utensils size={14}/> Mesas</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-ink-900 dark:text-white">{money(s?.table_sales || 0)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{s?.table_count || 0} pedidos</div>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-center dark:bg-indigo-900/20">
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"><Truck size={14}/> Domicilios</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-ink-900 dark:text-white">{money(s?.delivery_sales || 0)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{s?.delivery_count || 0} pedidos</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300"><ShoppingBag size={14}/> Para llevar</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-ink-900 dark:text-white">{money(s?.pickup_sales || 0)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{s?.pickup_count || 0} pedidos</div>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          {data.payment_methods && data.payment_methods.length > 0 && (
            <div className="card p-4">
              <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2 flex items-center gap-2">
                <Receipt size={16}/> Ingresos por método de pago
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.payment_methods.map((pm) => {
                  const icons = { cash: Wallet, card: CreditCard, transfer: Building2, mixed: Receipt };
                  const labels = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", mixed: "Mixto" };
                  const colors = { cash: "text-emerald-700 dark:text-emerald-300", card: "text-blue-700 dark:text-blue-300", transfer: "text-indigo-700 dark:text-indigo-300", mixed: "text-amber-700 dark:text-amber-300" };
                  const Icon = icons[pm.payment_method] || Receipt;
                  return (
                    <div key={pm.payment_method} className="text-center p-3 rounded-xl bg-paper-100 dark:bg-obsidian-800">
                      <Icon size={18} className={`mx-auto mb-1 ${colors[pm.payment_method] || ""}`}/>
                      <div className="text-xs text-ink-500 dark:text-obsidian-400">{labels[pm.payment_method] || pm.payment_method}</div>
                      <div className={`text-sm font-bold ${colors[pm.payment_method] || ""}`}>{money(pm.total)}</div>
                      <div className="text-[10px] text-ink-400 dark:text-obsidian-500">{pm.count} pedido{pm.count !== 1 ? "s" : ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deudas del día */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2 flex items-center gap-2">
              <AlertTriangle size={16}/> Deudas del día
            </h2>
            {debts.length === 0 ? (
              <div className="py-3 text-center text-sm text-ink-400 dark:text-obsidian-500">Sin deudas este día.</div>
            ) : (
              <div className="space-y-1.5">
                {debts.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm dark:border-rose-800 dark:bg-rose-900/20">
                    <span className="font-medium text-ink-800 dark:text-obsidian-50">
                      #{d.id} · {d.type === "table" ? `Mesa ${d.table_number || "?"}` : d.customer_name || "Cliente"}
                    </span>
                    <span className="font-bold tabular-nums text-rose-700 dark:text-rose-300">{money(d.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* A rendir por repartidor */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2 flex items-center gap-2">
              <Bike size={16}/> A rendir por repartidor
            </h2>
            {riders.length === 0 ? (
              <div className="py-3 text-center text-sm text-ink-400 dark:text-obsidian-500">Sin domicilios este día.</div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {riders.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-paper-200 px-3 py-2 text-sm dark:border-obsidian-800">
                      <span className="font-medium text-ink-800 dark:text-obsidian-50">{r.name}</span>
                      <span className="text-xs text-ink-500 dark:text-obsidian-400">{r.deliveries} entregas</span>
                      <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{money(r.cash_to_settle || 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-paper-200 pt-2 text-sm dark:border-obsidian-800">
                  <span className="font-medium text-ink-600 dark:text-obsidian-300">Total a rendir (efectivo)</span>
                  <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{money(totalToSettle)}</span>
                </div>
              </>
            )}
          </div>

          {/* Productos más vendidos */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2">Productos más vendidos</h2>
            <table className="data-table-embed">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products?.map((p, i) => (
                  <tr key={i}>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-right tabular-nums">{p.qty}</td>
                    <td className="text-right font-semibold tabular-nums">{money(p.revenue)}</td>
                  </tr>
                ))}
                {(!data.top_products || data.top_products.length === 0) && (
                  <tr><td colSpan={3} className="py-3 text-center cell-muted">Sin ventas</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Gastos del día */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2 flex items-center gap-2">
              <TrendingDown size={16}/> Gastos del día
            </h2>
            {(!data.expense_detail || data.expense_detail.length === 0) ? (
              <div className="py-3 text-center text-sm text-ink-400 dark:text-obsidian-500">Sin gastos registrados.</div>
            ) : (
              <div className="space-y-1.5">
                {data.expense_detail.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-lg border border-paper-200 px-3 py-2 text-sm dark:border-obsidian-800">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-800 dark:text-obsidian-50">{g.category_name || "Gasto"}</div>
                      {g.description && <div className="text-xs text-ink-500 dark:text-obsidian-400">{g.description}</div>}
                    </div>
                    <span className="font-semibold tabular-nums text-rose-700 dark:text-rose-300">{money(g.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-paper-200 pt-2 text-sm dark:border-obsidian-800">
              <span className="font-medium text-ink-600 dark:text-obsidian-300">Total de gastos</span>
              <span className="font-bold tabular-nums text-rose-700 dark:text-rose-300">{money(e?.total_expenses || 0)}</span>
            </div>
          </div>

          {/* Resumen final */}
          <div className="card p-4 border-2 border-wine-400 bg-wine-50 dark:bg-obsidian-800">
            <h2 className="font-semibold text-wine-800 dark:text-wine-200 mb-2">Resumen final</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Ventas brutas</span>
                <span className="font-semibold">{money(s?.total_sales || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Propinas</span>
                <span className="font-semibold">{money(s?.total_tips || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>− Gastos</span>
                <span className="font-semibold text-rose-700 dark:text-rose-300">−{money(e?.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-wine-300 dark:border-wine-700 font-bold text-base">
                <span>Neto del día</span>
                <span className="text-wine-800 dark:text-wine-200">{money(net)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-ink-400 dark:text-obsidian-500 pb-8">
            Generado el {new Date().toLocaleString("es-MX")} · TurnOn
          </div>
        </div>
      )}
    </div>
  );
}
