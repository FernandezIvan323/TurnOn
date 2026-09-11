import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import DetailModal from "./DetailModal";
import OrderCard from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";
import { money } from "../lib/format";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";

function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Ventana de detalle del repartidor: historial por día (cards) → click abre
 * los pedidos de ese día. Consistente con el historial del mesero.
 */
export default function RiderHistoryModal({ rider, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    api
      .get("/delivery/history", { params: { delivery_person_id: rider.id, limit: 200 } })
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

  const dayGroups = useMemo(() => {
    const map = new Map();
    for (const o of history) {
      const k = dayKey(o.created_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(o);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [history]);

  const selectedOrders = selectedDay
    ? (dayGroups.find(([d]) => d === selectedDay)?.[1] || [])
    : [];

  const selectedTotal = selectedOrders.reduce((s, o) => s + Number(o.total || 0), 0);

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
      ) : selectedDay ? (
        <>
          <button type="button" onClick={() => setSelectedDay(null)} className="btn-secondary mb-4 text-sm">
            <ArrowLeft size={16} /> Días
          </button>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 dark:border-indigo-800 dark:bg-indigo-900/20">
            <span className="font-semibold capitalize text-indigo-800 dark:text-indigo-200">{dayLabel(selectedDay)}</span>
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{money(selectedTotal)}</span>
          </div>
          <div className="space-y-2">
            {selectedOrders.map((o, i) => (
              <OrderCard key={o.id} order={o} rotateIndex={i} onClick={() => setViewOrder(o)} />
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {dayGroups.map(([day, orders]) => {
            const dayTotal = orders.reduce((s, o) => s + Number(o.total || 0), 0);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className="card flex w-full items-center gap-3 p-4 text-left transition hover:border-wine-400 hover:shadow-pop dark:hover:border-wine-500"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold capitalize text-ink-900 dark:text-white">{dayLabel(day)}</div>
                  <div className="mt-0.5 text-xs text-ink-500 dark:text-obsidian-400">
                    {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums text-ink-900 dark:text-white">{money(dayTotal)}</div>
                  <ChevronRight size={16} className="ml-auto mt-0.5 text-ink-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </DetailModal>
  );
}