import { useEffect, useState } from "react";
import api from "../lib/api";
import DetailModal from "./DetailModal";
import { money, payMethodLabel } from "../lib/format";
import { Phone, MapPin, Truck, CreditCard } from "lucide-react";

/**
 * Detalle de solo lectura de un pedido (desde Caja, "Ver"). Usa el shell
 * DetailModal para consistencia visual con las demás ventanas.
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
  const typeLabel =
    detail?.type === "table" ? "Mesa" : detail?.type === "pickup" ? "Para llevar" : "Domicilio";

  return (
    <DetailModal
      title={`#${detail?.id}`}
      badge={typeLabel}
      type={detail?.type || "table"}
      amount={money(detail?.total)}
      onClose={onClose}
    >
      {/* Datos */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-ink-400 dark:text-obsidian-500">Tipo</span>
          <b className="text-ink-900 dark:text-white">{typeLabel}</b>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-ink-400" />
          <b className="text-ink-900 dark:text-white">
            {detail?.payment_method ? payMethodLabel(detail.payment_method) : "—"}
          </b>
        </div>

        {detail?.type === "table" ? (
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-ink-400 dark:text-obsidian-500">Mesa</span>
            <b className="text-ink-900 dark:text-white">
              {detail?.table_number || "—"}
              {detail?.table_label ? ` · ${detail.table_label}` : ""}
            </b>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-ink-400 dark:text-obsidian-500">Cliente</span>
              <b className="truncate text-ink-900 dark:text-white">{detail?.customer_name || "—"}</b>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-ink-400" />
              <span className="text-ink-700 dark:text-obsidian-200">{detail?.customer_phone || "—"}</span>
            </div>
            {(detail?.customer_address || detail?.customer_neighborhood) && (
              <div className="col-span-2 flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-ink-400" />
                <span className="text-ink-700 dark:text-obsidian-200">
                  {[detail?.customer_neighborhood, detail?.customer_address].filter(Boolean).join(" · ")}
                </span>
              </div>
            )}
            {detail?.delivery_name && (
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-indigo-500" />
                <b className="text-ink-900 dark:text-white">{detail.delivery_name}</b>
              </div>
            )}
          </>
        )}

        {Number(detail?.tip) > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-ink-400 dark:text-obsidian-500">Propina</span>
            <b className="text-emerald-700 dark:text-emerald-300">{money(detail.tip)}</b>
          </div>
        )}
      </div>

      {/* Productos */}
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500 dark:text-obsidian-400">
        Productos
      </p>
      <div className="space-y-1.5">
        {loading ? (
          <div className="text-sm text-ink-400">Cargando ítems…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-ink-400">Sin ítems en este pedido.</div>
        ) : (
          items.map((it, i) => (
            <div
              key={it.id ?? i}
              className="flex items-center justify-between border-b border-paper-200 py-1.5 text-sm last:border-0 dark:border-obsidian-800"
            >
              <div className="min-w-0">
                <div className="font-medium text-ink-800 dark:text-obsidian-50">
                  {it.name_snapshot}
                  {it.notes && <span className="text-xs text-amber-700 dark:text-amber-400"> · {it.notes}</span>}
                </div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{money(it.unit_price)} c/u</div>
              </div>
              <div className="shrink-0 font-semibold text-ink-700 dark:text-obsidian-100">×{it.quantity}</div>
            </div>
          ))
        )}
      </div>
    </DetailModal>
  );
}