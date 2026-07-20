import { useEffect, useState } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import { money, formatDate, formatTime, typeLabels, payMethodLabel } from "../lib/format";
import {
  AlertTriangle,
  CheckCircle2,
  History,
  ChevronRight,
  X,
  User,
  Phone,
  MapPin,
  Utensils,
  Truck,
  ShoppingBag,
  Clock,
  Package,
} from "lucide-react";

function daysSince(iso) {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86400000);
}

const PAY_LABELS = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mixed: "Mixto",
};

function TypeIcon({ type }) {
  if (type === "delivery") return <Truck size={14} />;
  if (type === "pickup") return <ShoppingBag size={14} />;
  return <Utensils size={14} />;
}

function DebtDetailModal({ orderId, pending, onClose, onPay, paying }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    api
      .get(`/orders/${orderId}`)
      .then(({ data }) => {
        if (!cancelled) setDetail(data);
      })
      .catch((e) => {
        if (!cancelled) setErr(e.response?.data?.error || e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const items = detail?.items || [];
  const days = daysSince(detail?.closed_at || detail?.created_at);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-paper-300 p-4 dark:border-obsidian-700">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
              Detalle de deuda
            </div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">
              Pedido #{orderId}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost shrink-0" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-sm text-ink-500">Cargando pedido…</div>
          )}
          {err && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
              {err}
            </div>
          )}
          {detail && !loading && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  <TypeIcon type={detail.type} />
                  {typeLabels[detail.type] || detail.type}
                </span>
                {pending && days > 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      days >= 7
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                        : "bg-paper-200 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-200"
                    }`}
                  >
                    {days} día{days === 1 ? "" : "s"}
                  </span>
                )}
                {!pending && detail.payment_method && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {PAY_LABELS[detail.payment_method] || payMethodLabel(detail.payment_method)}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-paper-50 p-3 ring-1 ring-paper-200 dark:bg-obsidian-950 dark:ring-obsidian-700">
                <div className="flex items-start gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wine-100 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                    <User size={16} />
                  </span>
                  <div className="min-w-0 space-y-1 text-sm">
                    <div className="font-semibold text-ink-900 dark:text-white">
                      {detail.customer_name ||
                        (detail.table_number
                          ? `Mesa ${detail.table_number}${detail.table_label ? ` · ${detail.table_label}` : ""}`
                          : "Sin nombre")}
                    </div>
                    {detail.type === "table" && detail.table_number && detail.customer_name && (
                      <div className="flex items-center gap-1 text-xs text-ink-500 dark:text-obsidian-400">
                        <Utensils size={12} /> Mesa {detail.table_number}
                        {detail.table_label ? ` · ${detail.table_label}` : ""}
                      </div>
                    )}
                    {detail.customer_phone && (
                      <div className="flex items-center gap-1 text-xs text-ink-600 dark:text-obsidian-300">
                        <Phone size={12} /> {detail.customer_phone}
                      </div>
                    )}
                    {(detail.customer_address || detail.customer_neighborhood) && (
                      <div className="flex items-start gap-1 text-xs text-ink-500 dark:text-obsidian-400">
                        <MapPin size={12} className="mt-0.5 shrink-0" />
                        <span>
                          {[detail.customer_neighborhood, detail.customer_address]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    )}
                    {detail.delivery_name && (
                      <div className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        <Truck size={12} /> {detail.delivery_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-ink-400 dark:text-obsidian-500">
                      <Clock size={12} />
                      {pending
                        ? `Registrada ${formatDate(detail.closed_at || detail.created_at)}`
                        : `Cobrada ${formatDate(detail.debt_settled_at || detail.closed_at)}`}
                      {detail.created_at && (
                        <span className="text-ink-400"> · {formatTime(detail.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-obsidian-400">
                  <Package size={12} /> Qué se llevó
                </div>
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-paper-300 p-4 text-center text-sm text-ink-400 dark:border-obsidian-700">
                    Sin detalle de productos
                  </div>
                ) : (
                  <ul className="divide-y divide-paper-200 overflow-hidden rounded-xl border border-paper-300 dark:divide-obsidian-700 dark:border-obsidian-700">
                    {items.map((it, i) => (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-3 bg-white px-3 py-2.5 text-sm dark:bg-obsidian-900"
                      >
                        <span className="min-w-0 text-ink-800 dark:text-obsidian-50">
                          <b className="tabular-nums text-ink-900 dark:text-white">{it.quantity}×</b>{" "}
                          {it.name_snapshot}
                          {it.notes && (
                            <span className="mt-0.5 block text-xs text-ink-400">({it.notes})</span>
                          )}
                        </span>
                        <span className="shrink-0 tabular-nums font-medium text-ink-700 dark:text-obsidian-200">
                          {money(Number(it.unit_price) * Number(it.quantity))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-600 dark:text-obsidian-300">Subtotal</span>
                  <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                    {money(detail.total)}
                  </span>
                </div>
                {Number(detail.tip) > 0 && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-ink-600 dark:text-obsidian-300">Propina</span>
                    <span className="font-semibold tabular-nums">{money(detail.tip)}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-rose-200 pt-2 dark:border-rose-800">
                  <span className="font-semibold text-ink-900 dark:text-white">Total deuda</span>
                  <span className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
                    {money(Number(detail.total) + Number(detail.tip || 0))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-paper-300 p-4 dark:border-obsidian-700 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cerrar
          </button>
          {pending && (
            <button
              type="button"
              onClick={() => onPay(orderId)}
              disabled={paying || loading}
              className="btn-primary w-full sm:w-auto"
            >
              {paying ? "Cobrando…" : "Cobrar deuda"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Debts() {
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const payment = tab === "pending" ? "debt" : "debt_settled";
      const { data } = await api.get("/orders", { params: { payment } });
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [tab]);

  const payDebt = async (id) => {
    setPaying(id);
    try {
      await api.post(`/orders/${id}/pay-debt`, { payment_method: "cash" });
      setSelectedId(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setPaying(null);
    }
  };

  const totalDebt = orders.reduce((s, o) => s + Number(o.total), 0);
  const pending = tab === "pending";

  return (
    <div>
      <Header
        title="Deudas"
        subtitle={pending ? "Pendientes de cobro · Tocá una para ver el pedido" : "Ya cobradas"}
        right={
          <div className="flex rounded-xl border border-paper-300 p-0.5 dark:border-obsidian-700">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                pending ? "bg-wine-600 text-white" : "text-ink-600 dark:text-obsidian-200"
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setTab("settled")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                !pending ? "bg-wine-600 text-white" : "text-ink-600 dark:text-obsidian-200"
              }`}
            >
              Cobradas
            </button>
          </div>
        }
      />

      {pending && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <AlertTriangle size={20} />
            <span className="font-semibold">
              {orders.length} deuda{orders.length === 1 ? "" : "s"} pendiente
              {orders.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
            {money(totalDebt)}
          </div>
        </div>
      )}

      {!pending && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          <History size={16} />
          Deudas cobradas · Total listado: <b className="tabular-nums">{money(totalDebt)}</b>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-ink-500">Cargando…</div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center text-ink-500">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
          {pending ? "No hay deudas pendientes." : "Aún no hay deudas cobradas."}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const days = daysSince(o.closed_at);
            const title =
              o.customer_name ||
              (o.table_number ? `Mesa ${o.table_number}` : "Sin nombre");
            return (
              <div
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(o.id);
                  }
                }}
                className={`card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:border-wine-400 hover:shadow-pop dark:hover:border-wine-500/50 ${
                  pending
                    ? "border-l-4 border-l-rose-500"
                    : "border-l-4 border-l-emerald-500"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="badge bg-paper-100 text-[10px] font-semibold dark:bg-obsidian-800">
                      #{o.id}
                    </span>
                    <span className="badge bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      {typeLabels[o.type] || o.type}
                    </span>
                    {pending && days > 0 && (
                      <span
                        className={`badge text-[10px] ${
                          days >= 7
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            : "bg-paper-100 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-300"
                        }`}
                      >
                        {days}d
                      </span>
                    )}
                    {!pending && o.payment_method && (
                      <span className="badge bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {PAY_LABELS[o.payment_method] || o.payment_method}
                      </span>
                    )}
                  </div>
                  <div className="truncate font-semibold text-ink-900 dark:text-white">{title}</div>
                  <div className="mt-0.5 text-xs text-ink-400 dark:text-obsidian-500">
                    Tocá para ver productos y detalle
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold tabular-nums text-ink-900 dark:text-white">
                    {money(o.total)}
                  </div>
                  {pending && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        payDebt(o.id);
                      }}
                      disabled={paying === o.id}
                      className="btn-primary mt-2 h-8 whitespace-nowrap text-xs"
                    >
                      {paying === o.id ? "Cobrando…" : "Cobrar"}
                    </button>
                  )}
                </div>
                <ChevronRight size={18} className="shrink-0 text-ink-400 dark:text-obsidian-500" />
              </div>
            );
          })}
        </div>
      )}

      {selectedId != null && (
        <DebtDetailModal
          orderId={selectedId}
          pending={pending}
          onClose={() => setSelectedId(null)}
          onPay={payDebt}
          paying={paying === selectedId}
        />
      )}
    </div>
  );
}
