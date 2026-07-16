import { useEffect, useState } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import { money, formatDate, typeLabels } from "../lib/format";
import { AlertTriangle, CheckCircle2, History } from "lucide-react";

function daysSince(iso) {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86400000);
}

const PAY_LABELS = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", mixed: "Mixto" };

export default function Debts() {
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

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
      await load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setPaying(null);
    }
  };

  const totalDebt = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div>
      <Header
        title="Deudas"
        subtitle={tab === "pending" ? "Pendientes de cobro" : "Ya cobradas"}
        right={
          <div className="flex rounded-xl border border-paper-300 p-0.5 dark:border-obsidian-700">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === "pending" ? "bg-wine-600 text-white" : "text-ink-600 dark:text-obsidian-200"
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setTab("settled")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === "settled" ? "bg-wine-600 text-white" : "text-ink-600 dark:text-obsidian-200"
              }`}
            >
              Cobradas
            </button>
          </div>
        }
      />

      {tab === "pending" && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <AlertTriangle size={20} />
            <span className="font-semibold">
              {orders.length} deuda{orders.length === 1 ? "" : "s"} pendiente{orders.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
            {money(totalDebt)}
          </div>
        </div>
      )}

      {tab === "settled" && (
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
          {tab === "pending" ? "No hay deudas pendientes." : "Aún no hay deudas cobradas."}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-[10px] dark:bg-obsidian-800">#{o.id}</span>
                  <span className="badge bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {typeLabels[o.type] || o.type}
                  </span>
                  {tab === "pending" && daysSince(o.closed_at) > 0 && (
                    <span
                      className={`badge text-[10px] ${
                        daysSince(o.closed_at) >= 7
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {daysSince(o.closed_at)}d
                    </span>
                  )}
                  {tab === "settled" && o.payment_method && (
                    <span className="badge bg-emerald-100 text-[10px] text-emerald-800">
                      {PAY_LABELS[o.payment_method] || o.payment_method}
                    </span>
                  )}
                </div>
                <div className="font-medium text-ink-800 dark:text-obsidian-50">
                  {o.customer_name ||
                    (o.table_number ? `Mesa ${o.table_number}` : "Sin nombre")}
                </div>
                {o.type === "delivery" && o.customer_address && (
                  <div className="text-xs text-ink-500">{o.customer_address}</div>
                )}
                {o.type === "table" && o.table_number && (
                  <div className="text-xs text-ink-500">
                    Mesa {o.table_number}
                    {o.table_label ? ` · ${o.table_label}` : ""}
                  </div>
                )}
                <div className="mt-0.5 text-xs text-ink-400">
                  {tab === "settled"
                    ? `Cobrado ${formatDate(o.debt_settled_at || o.closed_at)}`
                    : `${o.delivery_name ? `${o.delivery_name} · ` : ""}${formatDate(o.closed_at || o.created_at)}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold tabular-nums">{money(o.total)}</div>
                {tab === "pending" && (
                  <button
                    type="button"
                    onClick={() => payDebt(o.id)}
                    disabled={paying === o.id}
                    className="btn-primary mt-2 h-8 whitespace-nowrap text-xs"
                  >
                    {paying === o.id ? "Cobrando…" : "Cobrar"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
