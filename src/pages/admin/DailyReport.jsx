import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../store/auth";
import { todayLocalISO } from "../../lib/date";
import { money } from "../../lib/format";
import { Printer, ArrowLeft } from "lucide-react";

export default function DailyReport() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reports/daily-complete", {
        params: { date: todayLocalISO() },
      });
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500">Solo administradores.</div>;
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
        <div className="text-sm text-ink-500">Generando reporte…</div>
      ) : !data ? (
        <div className="card p-8 text-center text-ink-500">Error al cargar el reporte.</div>
      ) : (
        <div ref={printRef} id="daily-report" className="space-y-6 max-w-3xl mx-auto">
          {/* Encabezado */}
          <div className="text-center border-b border-ink-200 pb-4 mb-2">
            <h1 className="text-2xl font-bold text-ink-800">Reporte Diario</h1>
            <p className="text-sm text-ink-500">{data.date}</p>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400">Ventas brutas</div>
              <div className="text-xl font-bold text-ink-800">{money(s?.total_sales || 0)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400">Propinas</div>
              <div className="text-xl font-bold text-ink-800">{money(s?.total_tips || 0)}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xs text-ink-400">Gastos</div>
              <div className="text-xl font-bold text-rose-700">{money(e?.total_expenses || 0)}</div>
            </div>
            <div className="card p-4 text-center border-2 border-brand-400">
              <div className="text-xs text-ink-400">Neto del día</div>
              <div className="text-xl font-bold text-brand-700">{money(net)}</div>
            </div>
          </div>

          {/* Pedidos */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400">Total pedidos</div>
              <div className="text-lg font-bold">{s?.orders || 0}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400">Mesas</div>
              <div className="text-lg font-bold">{s?.table_count || 0}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-ink-400">Domicilios</div>
              <div className="text-lg font-bold">{s?.delivery_count || 0}</div>
            </div>
          </div>

          {/* Productos más vendidos */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 mb-2">Productos más vendidos</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b border-ink-200">
                  <th className="py-1 pr-2">Producto</th>
                  <th className="py-1 pr-2">Categoría</th>
                  <th className="py-1 pr-2 text-right">Cantidad</th>
                  <th className="py-1 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products?.map((p, i) => (
                  <tr key={i} className="border-b border-ink-100">
                    <td className="py-1 pr-2 font-medium">{p.name}</td>
                    <td className="py-1 pr-2 text-ink-500">{p.category || "—"}</td>
                    <td className="py-1 pr-2 text-right">{p.qty}</td>
                    <td className="py-1 text-right">{money(p.revenue)}</td>
                  </tr>
                ))}
                {(!data.top_products || data.top_products.length === 0) && (
                  <tr><td colSpan={4} className="py-2 text-center text-ink-400">Sin ventas</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ventas por categoría */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 mb-2">Ventas por categoría</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b border-ink-200">
                  <th className="py-1 pr-2">Categoría</th>
                  <th className="py-1 pr-2 text-right">Unidades</th>
                  <th className="py-1 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.by_category?.map((c, i) => (
                  <tr key={i} className="border-b border-ink-100">
                    <td className="py-1 pr-2 font-medium">{c.category}</td>
                    <td className="py-1 pr-2 text-right">{c.qty}</td>
                    <td className="py-1 text-right">{money(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gastos del día */}
          <div className="card p-4">
            <h2 className="font-semibold text-ink-700 mb-2">Gastos del día</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Total de gastos</span>
              <span className="font-bold text-rose-700">{money(e?.total_expenses || 0)}</span>
            </div>
            <div className="text-xs text-ink-400 mt-1">
              {e?.count || 0} gasto{(e?.count || 0) !== 1 ? "s" : ""} registrado{(e?.count || 0) !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Resumen final */}
          <div className="card p-4 border-2 border-brand-400 bg-brand-50">
            <h2 className="font-semibold text-brand-800 mb-2">Resumen final</h2>
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
                <span className="font-semibold text-rose-700">−{money(e?.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-300 font-bold text-base">
                <span>Neto del día</span>
                <span className="text-brand-800">{money(net)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-ink-400 pb-8">
            Generado el {new Date().toLocaleString("es-MX")} · AppTurnos
          </div>
        </div>
      )}
    </div>
  );
}
