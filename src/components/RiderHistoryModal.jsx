import { useEffect, useState } from "react";
import api from "../lib/api";
import DetailModal from "./DetailModal";
import OrderCard from "./OrderCard";
import { money } from "../lib/format";

/**
 * Ventana de detalle del repartidor: lista de sus pedidos con su información.
 * Se abre al pulsar una card del historial de repartidores.
 */
export default function RiderHistoryModal({ rider, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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

  return (
    <DetailModal
      title={rider.name}
      badge="Repartidor"
      type="delivery"
      amount={`${rider.deliveries || history.length} domicilios · ${money(rider.revenue ?? total)}`}
      onClose={onClose}
    >
      <div className="mb-3 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-sm dark:border-indigo-800 dark:bg-indigo-900/20">
        <span className="font-semibold text-indigo-800 dark:text-indigo-200">Total entregado</span>
        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{money(total)}</span>
      </div>

      {loading ? (
        <div className="text-sm text-ink-500">Cargando pedidos…</div>
      ) : err ? (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink-400">Sin entregas.</div>
      ) : (
        <div className="space-y-2">
          {history.map((o, i) => (
            <OrderCard key={o.id} order={o} rotateIndex={i} />
          ))}
        </div>
      )}
    </DetailModal>
  );
}