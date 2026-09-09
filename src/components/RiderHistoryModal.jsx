import { useEffect, useState } from "react";
import api from "../lib/api";
import DetailModal from "./DetailModal";
import OrderCard from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";
import { money } from "../lib/format";

/**
 * Ventana de detalle del repartidor: lista de sus pedidos con su información.
 * Se abre al pulsar una card del historial de repartidores.
 */
export default function RiderHistoryModal({ rider, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    api
      .get("/delivery/history", { params: { delivery_person_id: rider.id, limit: 100 } })
      .then(({ data }) => {
        if (!cancelled) setHistory(data);
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
  }, [rider.id]);

  const total = history.reduce((s, o) => s + Number(o.total || 0), 0);

  // Agrupa por día (fecha local de creación)
  const grouped = history.reduce((acc, o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});
  const dayGroups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));

  const dayLabel = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <DetailModal
      title={rider.name}
      badge="Repartidor"
      type="delivery"
      amount={`${rider.deliveries || history.length} domicilios · ${money(rider.revenue ?? total)}`}
      onClose={onClose}
    >
      {loading ? (
        <div className="text-sm text-ink-500">Cargando pedidos…</div>
      ) : err ? (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink-400">Sin entregas.</div>
      ) : (
        <div className="space-y-5">
          {dayGroups.map(([day, orders]) => {
            const dayTotal = orders.reduce((s, o) => s + Number(o.total || 0), 0);
            return (
              <div key={day}>
                <div className="mb-2 flex items-center justify-between border-b border-paper-200 pb-1.5 dark:border-obsidian-800">
                  <span className="text-sm font-bold capitalize text-ink-900 dark:text-white">{dayLabel(day)}</span>
                  <span className="text-xs text-ink-500 dark:text-obsidian-400">
                    {orders.length} pedido{orders.length !== 1 ? "s" : ""} · <b className="text-ink-900 dark:text-white">{money(dayTotal)}</b>
                  </span>
                </div>
                <div className="space-y-2">
                  {orders.map((o, i) => (
                    <OrderCard key={o.id} order={o} rotateIndex={i} onClick={() => setViewOrder(o)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </DetailModal>
  );
}