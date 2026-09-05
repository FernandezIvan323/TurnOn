import { money, formatTime, statusLabels, typeLabels } from "../lib/format";
import { orderAccent, rotateAccent, TYPE_ICON } from "../lib/cardAccent";
import { Clock } from "lucide-react";

/**
 * Card unificada de pedido.
 * Por defecto usa color semántico por estado; con `rotateIndex` usa la paleta
 * rotativa (una card de cada color). Click -> abre el detalle.
 */
export default function OrderCard({ order, onClick, footer = null, rotateIndex = null }) {
  const accent = rotateIndex != null ? rotateAccent(rotateIndex) : orderAccent(order);
  const TypeIcon = TYPE_ICON[order.type] || TYPE_ICON.table;
  const title =
    order.type === "table"
      ? `Mesa ${order.table_number || ""}${order.table_label ? ` · ${order.table_label}` : ""}`
      : order.customer_name || `Pedido #${order.id}`;

  const subtitleParts = [];
  if (order.customer_neighborhood) subtitleParts.push(order.customer_neighborhood);
  if (!order.customer_neighborhood && order.customer_address) subtitleParts.push(order.customer_address);
  if (order.type !== "table" && order.delivery_name) subtitleParts.push(`↗ ${order.delivery_name}`);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full overflow-hidden rounded-2xl border border-paper-200 border-l-4 bg-gradient-to-br text-left shadow-soft transition hover:-translate-y-0.5 hover:border-wine-400 hover:shadow-pop dark:border-obsidian-700 dark:hover:border-wine-500/50 ${accent.border} ${accent.bg}`}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-ink-500 dark:text-obsidian-400">
            <Clock size={11} /> #{order.id} · {formatTime(order.closed_at || order.created_at)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent.badge}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <TypeIcon size={15} className="shrink-0 text-ink-500 dark:text-obsidian-400" />
              <h3 className="truncate text-sm font-bold text-ink-900 dark:text-white sm:text-base">
                {title}
              </h3>
            </div>
            {subtitleParts.length > 0 && (
              <p className="mt-1 truncate text-xs text-ink-500 dark:text-obsidian-400">
                {subtitleParts.join(" · ")}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold tabular-nums text-ink-900 dark:text-white sm:text-xl">
              {money(order.total)}
            </div>
            <div className="text-[10px] font-medium text-ink-400 dark:text-obsidian-500">
              {typeLabels[order.type]}
            </div>
          </div>
        </div>

        {footer && <div className="mt-3 border-t border-paper-200/70 pt-3 dark:border-white/10">{footer}</div>}
      </div>
    </button>
  );
}