import { useEffect, useState } from "react";
import api from "../lib/api";
import { money, payMethodLabel } from "../lib/format";
import { X } from "lucide-react";

/**
 * Modal de solo lectura con el detalle completo de un pedido (ítems, cliente,
 * dirección, repartidor, método de pago y total). Reutilizable desde Caja.
 */
export default function OrderDetailModal({ order, onClose }) {
  const [detail, setDetail] = useState(order);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const items = detail?.items || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">
            Pedido #{detail?.id}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-ink-400 dark:text-obsidian-500">Tipo:</span>{" "}
            <b>
              {detail?.type === "table" ? "Mesa" : detail?.type === "pickup" ? "Para llevar" : "Domicilio"}
            </b>
          </div>
          <div>
            <span className="text-ink-400 dark:text-obsidian-500">Método:</span>{" "}
            <b>{detail?.payment_method ? payMethodLabel(detail.payment_method) : "—"}</b>
          </div>
          {detail?.type === "table" ? (
            <div className="col-span-2">
              <span className="text-ink-400 dark:text-obsidian-500">Mesa:</span>{" "}
              <b>
                {detail?.table_number || "—"}
                {detail?.table_label ? ` · ${detail.table_label}` : ""}
              </b>
            </div>
          ) : (
            <>
              <div>
                <span className="text-ink-400 dark:text-obsidian-500">Cliente:</span>{" "}
                <b>{detail?.customer_name || "—"}</b>
              </div>
              <div>
                <span className="text-ink-400 dark:text-obsidian-500">Teléfono:</span>{" "}
                {detail?.customer_phone || "—"}
              </div>
              {(detail?.customer_address || detail?.customer_neighborhood) && (
                <div className="col-span-2">
                  <span className="text-ink-400 dark:text-obsidian-500">Dirección:</span>{" "}
                  {[detail?.customer_neighborhood, detail?.customer_address].filter(Boolean).join(" · ")}
                </div>
              )}
              {detail?.delivery_name && (
                <div>
                  <span className="text-ink-400 dark:text-obsidian-500">Repartidor:</span>{" "}
                  <b>{detail.delivery_name}</b>
                </div>
              )}
            </>
          )}
          {Number(detail?.tip) > 0 && (
            <div>
              <span className="text-ink-400 dark:text-obsidian-500">Propina:</span>{" "}
              <b className="text-emerald-700 dark:text-emerald-300">{money(detail.tip)}</b>
            </div>
          )}
        </div>

        <div className="mb-4 space-y-1.5">
          {loading ? (
            <div className="text-sm text-ink-400">Cargando ítems…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-ink-400">Sin ítems en este pedido.</div>
          ) : (
            items.map((it, i) => (
              <div key={it.id ?? i} className="flex items-center justify-between border-b border-paper-200 py-1.5 text-sm dark:border-obsidian-800">
                <div>
                  <div className="font-medium text-ink-800 dark:text-obsidian-50">
                    {it.name_snapshot}{" "}
                    {it.notes && <span className="text-xs text-amber-700 dark:text-amber-400">· {it.notes}</span>}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-obsidian-400">{money(it.unit_price)} c/u</div>
                </div>
                <div className="font-semibold text-ink-700 dark:text-obsidian-100">×{it.quantity}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-paper-200 pt-3 dark:border-obsidian-800">
          <span className="text-ink-500 dark:text-obsidian-400">Total</span>
          <span className="text-2xl font-bold tabular-nums text-ink-800 dark:text-obsidian-50">
            {money(detail?.total)}
          </span>
        </div>
      </div>
    </div>
  );
}