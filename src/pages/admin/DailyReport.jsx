import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../store/auth";
import { todayLocalISO } from "../../lib/date";
import { money } from "../../lib/format";
import { Printer, ArrowLeft, Wallet, CreditCard, Building2, Receipt } from "lucide-react";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function DailyReport() {
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

          {/* Pedidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Total pedidos</div>
              <div className="text-lg font-bold">{s?.orders || 0}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Mesas</div>
              <div className="text-lg font-bold">{s?.table_count || 0}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Domicilios</div>
              <div className="text-lg font-bold">{s?.delivery_count || 0}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400 dark:text-obsidian-500">Para llevar</div>
              <div className="text-lg font-bold">{s?.pickup_count || 0}</div>
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

          {/* Productos más vendidos */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2">Productos más vendidos</h2>
            <table className="data-table-embed">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products?.map((p, i) => (
                  <tr key={i}>
                    <td className="font-medium">{p.name}</td>
                    <td className="cell-muted">{p.category || "—"}</td>
                    <td className="text-right tabular-nums">{p.qty}</td>
                    <td className="text-right font-semibold tabular-nums">{money(p.revenue)}</td>
                  </tr>
                ))}
                {(!data.top_products || data.top_products.length === 0) && (
                  <tr><td colSpan={4} className="py-3 text-center cell-muted">Sin ventas</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ventas por categoría */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2">Ventas por categoría</h2>
            <table className="data-table-embed">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-right">Unidades</th>
                  <th className="text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.by_category?.map((c, i) => (
                  <tr key={i}>
                    <td className="font-medium">{c.category}</td>
                    <td className="text-right tabular-nums">{c.qty}</td>
                    <td className="text-right font-semibold tabular-nums">{money(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gastos del día */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2">Gastos del día</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500 dark:text-obsidian-400">Total de gastos</span>
              <span className="font-bold text-rose-700 dark:text-rose-300">{money(e?.total_expenses || 0)}</span>
            </div>
            <div className="text-xs text-ink-400 dark:text-obsidian-500 mt-1">
              {e?.count || 0} gasto{(e?.count || 0) !== 1 ? "s" : ""} registrado{(e?.count || 0) !== 1 ? "s" : ""}
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
