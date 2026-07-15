import { useEffect, useState } from "react";
import api from "../lib/api";
import { money, typeLabels, formatTime } from "../lib/format";
import { Printer, X } from "lucide-react";

const METHOD_LABELS = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mixed: "Mixto",
};

/**
 * Ticket de cobro imprimible (navegador).
 * Carga items del pedido si no vienen en `order.items`.
 */
export default function ReceiptTicket({ order, onClose }) {
  const [detail, setDetail] = useState(order);
  const [loading, setLoading] = useState(!order?.items);

  useEffect(() => {
    let cancelled = false;
    if (order?.items) {
      setDetail(order);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/orders/${order.id}`)
      .then(({ data }) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setDetail(order);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [order?.id]);

  const items = detail?.items || [];
  const tip = Number(detail?.tip || 0);
  const total = Number(detail?.total || 0);
  const grand = total + tip;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 no-print-bg">
      <div className="card w-full max-w-sm p-0 overflow-hidden">
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-paper-200 dark:border-obsidian-800">
          <h2 className="font-semibold text-ink-800 dark:text-obsidian-50">Ticket de cobro</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.print()} className="btn-primary text-sm">
              <Printer size={14} /> Imprimir
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              <X size={18} />
            </button>
          </div>
        </div>

        <div id="receipt-ticket" className="p-5 text-ink-800 bg-white">
          <div className="text-center mb-3">
            <div className="text-lg font-bold tracking-tight">AppTurnos</div>
            <div className="text-xs text-ink-500">Comprobante de cobro</div>
            <div className="text-xs text-ink-500 mt-1">
              {detail?.closed_at
                ? new Date(detail.closed_at).toLocaleString("es-MX")
                : new Date().toLocaleString("es-MX")}
            </div>
          </div>

          <div className="border-t border-b border-dashed border-ink-300 py-2 text-xs space-y-0.5 mb-3">
            <div className="flex justify-between">
              <span>Pedido</span>
              <span className="font-mono font-semibold">#{detail?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo</span>
              <span>{typeLabels[detail?.type] || detail?.type}</span>
            </div>
            {detail?.type === "table" && (
              <div className="flex justify-between">
                <span>Mesa</span>
                <span>{detail.table_number}{detail.table_label ? ` · ${detail.table_label}` : ""}</span>
              </div>
            )}
            {(detail?.customer_name || detail?.type === "delivery") && (
              <div className="flex justify-between gap-2">
                <span>Cliente</span>
                <span className="text-right">{detail.customer_name || "—"}</span>
              </div>
            )}
            {detail?.created_at && (
              <div className="flex justify-between">
                <span>Hora pedido</span>
                <span>{formatTime(detail.created_at)}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-xs text-ink-400 text-center py-4">Cargando productos…</div>
          ) : (
            <table className="w-full text-xs mb-3">
              <thead>
                <tr className="text-left text-ink-500 border-b border-ink-200">
                  <th className="py-1 font-medium">Producto</th>
                  <th className="py-1 font-medium text-right">Cant</th>
                  <th className="py-1 font-medium text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-ink-100">
                    <td className="py-1.5 pr-2">
                      {it.name_snapshot}
                      {it.notes && <div className="text-[10px] text-ink-400">{it.notes}</div>}
                    </td>
                    <td className="py-1.5 text-right align-top">{it.quantity}</td>
                    <td className="py-1.5 text-right align-top">
                      {money(Number(it.unit_price) * Number(it.quantity))}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-ink-400">Sin detalle de productos</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="text-xs space-y-1 border-t border-ink-200 pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{money(total)}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between">
                <span>Propina</span>
                <span className="font-medium">{money(tip)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1">
              <span>Total</span>
              <span>{money(grand)}</span>
            </div>
            <div className="flex justify-between text-ink-500 pt-1">
              <span>Pago</span>
              <span>{METHOD_LABELS[detail?.payment_method] || detail?.payment_method || "—"}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-ink-400 mt-4">
            ¡Gracias por su preferencia!
          </div>
        </div>
      </div>
    </div>
  );
}
