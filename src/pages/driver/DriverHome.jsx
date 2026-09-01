import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header";
import EmptyState from "../../components/EmptyState";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { Skeleton } from "../../components/Skeleton";
import { money, formatTime, payMethodLabel } from "../../lib/format";
import { useLiveRefresh } from "../../lib/useLiveRefresh";
import { useAuth } from "../../store/auth";
import { toast } from "../../store/toast";
import {
  Truck,
  Phone,
  MapPin,
  Play,
  CheckCircle2,
  XCircle,
  Banknote,
  Building2,
  Wallet,
  CalendarDays,
  ChevronRight,
  Hourglass,
  Navigation,
} from "lucide-react";

/** Mapa para los pedidos en camino: pedidoId -> items (para mostrar resumen en cards) */
function MapsButton({ address }) {
  if (!address) return null;
  const q = encodeURIComponent(address);
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${q}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary text-xs"
      title="Abrir en Maps"
    >
      <Navigation size={12} /> Maps
    </a>
  );
}

function DeliveryActions({ orderId, onUpdated }) {
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/start`);
      toast.success("Saliste a entregar");
      onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  };

  const deliver = async (collected, method = "cash") => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/deliver`, { collected, method });
      toast.success(
        collected
          ? (method === "cash" ? "Cobrado y entregado" : "Entrega registrada")
          : "Marcado como deuda"
      );
      onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <button onClick={start} disabled={busy} className="btn-primary text-sm">
        <Play size={14} /> Salí a entregar
      </button>
    </div>
  );
}

function OnTheWayActions({ orderId, onUpdated }) {
  const [busy, setBusy] = useState(false);

  const deliver = async (collected, method = "cash") => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/deliver`, { collected, method });
      toast.success(
        collected
          ? (method === "cash" ? "Cobrado y entregado" : "Entrega registrada")
          : "Marcado como deuda"
      );
      onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
      <button onClick={() => deliver(true, "cash")} disabled={busy} className="btn-primary flex-1 text-sm">
        <Banknote size={14} /> Entregado — cobré
      </button>
      <button onClick={() => deliver(true, "transfer")} disabled={busy} className="btn-secondary flex-1 text-sm">
        <Building2 size={14} /> Entregado — transfer.
      </button>
      <button onClick={() => deliver(false)} disabled={busy} className="btn-ghost flex-1 text-sm text-rose-600 dark:text-rose-400">
        <XCircle size={14} /> No pagó
      </button>
    </div>
  );
}

function OrderCardReady({ order, onUpdated }) {
  const address = [order.customer_neighborhood, order.customer_address]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400">
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
              Listo para salir
            </span>
            <span>#{order.id}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Hourglass size={11} /> {formatTime(order.created_at)}</span>
          </div>
          <div className="mt-1 font-semibold text-ink-900 dark:text-white">
            {order.customer_name || "Cliente sin nombre"}
          </div>
          {order.customer_phone && (
            <a
              href={`tel:${order.customer_phone}`}
              className="mt-1 inline-flex items-center gap-1 text-xs text-ink-600 hover:text-wine-600 dark:text-obsidian-300 dark:hover:text-wine-400"
            >
              <Phone size={12} /> {order.customer_phone}
            </a>
          )}
          {address && (
            <div className="mt-1 flex items-start gap-1 text-xs text-ink-500 dark:text-obsidian-400">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{address}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold tabular-nums text-ink-900 dark:text-white">
            {money(order.total)}
          </div>
          <div className="text-[11px] text-ink-500 dark:text-obsidian-500">a cobrar</div>
        </div>
      </div>
      <DeliveryActions orderId={order.id} onUpdated={onUpdated} />
    </div>
  );
}

function OrderCardOnWay({ order, onUpdated }) {
  const address = [order.customer_neighborhood, order.customer_address]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="card overflow-hidden border-l-4 border-l-indigo-500">
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-obsidian-400">
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                En camino
              </span>
              <span>#{order.id}</span>
            </div>
            <div className="mt-1 text-lg font-bold text-ink-900 dark:text-white">
              {order.customer_name || "Cliente sin nombre"}
            </div>
            {order.customer_phone && (
              <a
                href={`tel:${order.customer_phone}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-wine-600 dark:text-obsidian-200 dark:hover:text-wine-400"
              >
                <Phone size={14} /> {order.customer_phone}
              </a>
            )}
            {address && (
              <div className="mt-1.5 flex items-start gap-1 text-sm text-ink-700 dark:text-obsidian-200">
                <MapPin size={14} className="mt-0.5 shrink-0 text-wine-600" />
                <span className="line-clamp-2">{address}</span>
              </div>
            )}
          </div>
          <div className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-right dark:bg-indigo-950/40">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              Cobrar
            </div>
            <div className="text-2xl font-bold tabular-nums text-indigo-900 dark:text-indigo-100">
              {money(order.total)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MapsButton address={address} />
        </div>
        <OnTheWayActions orderId={order.id} onUpdated={onUpdated} />
      </div>
    </div>
  );
}

export default function DriverHome() {
  useDocumentTitle("Mi turno");
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingAll, setStartingAll] = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [s, o] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/orders", { params: { type: "delivery" } }),
      ]);
      setSummary(s.data);
      const list = Array.isArray(o.data) ? o.data : [];
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setOrders(list);
    } catch {
      setSummary(null);
      setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, { intervalMs: 12000 });

  const { ready, onTheWay, deliveredToday } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const ready = orders.filter((o) => o.status === "assigned");
    const onTheWay = orders.filter((o) => o.status === "on_the_way");
    const deliveredToday = orders.filter(
      (o) => o.status === "delivered" && (o.closed_at || "").slice(0, 10) === today
    );
    return { ready, onTheWay, deliveredToday };
  }, [orders]);

  const startAll = async () => {
    setStartingAll(true);
    try {
      const { data } = await api.post("/orders/start-assigned");
      toast.success(
        data.count > 0
          ? `Saliste con ${data.count} pedido${data.count === 1 ? "" : "s"}`
          : "No hay pedidos para salir"
      );
      load({ silent: true });
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setStartingAll(false); }
  };

  const my = summary?.my || {};
  const todayKpi = summary?.today || {};
  const readyAmount = Number(my.ready_amount || 0);
  const streetAmount = Number(my.street_amount || 0);
  const cashToSettle = Number(todayKpi.cash_to_settle || 0);
  const transferCollected = Number(todayKpi.transfer_collected || 0);

  if (!user) return null;

  return (
    <div>
      <Header
        title="Mis entregas"
        subtitle={`Hola ${user.name.split(" ")[0]} — esto es lo que tenés en la calle`}
        right={
          <Link to="/my-history" className="btn-secondary text-sm">
            <CalendarDays size={14} /> Mi historial
          </Link>
        }
      />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            <Truck size={14} /> Listos
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {loading ? "—" : ready.length}
          </div>
          {!loading && readyAmount > 0 && (
            <div className="text-[11px] text-ink-500 dark:text-obsidian-400">{money(readyAmount)}</div>
          )}
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            <Navigation size={14} /> En la calle
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {loading ? "—" : onTheWay.length}
          </div>
          {!loading && streetAmount > 0 && (
            <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              {money(streetAmount)}
            </div>
          )}
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={14} /> Entregados hoy
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900 dark:text-white">
            {loading ? "—" : deliveredToday.length}
          </div>
          {!loading && (
            <div className="text-[11px] text-ink-500 dark:text-obsidian-400">
              {money(cashToSettle + transferCollected)}
            </div>
          )}
        </div>
        <div className="card border-l-4 border-l-emerald-500 bg-emerald-50/40 p-3 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            <Banknote size={14} /> A rendir
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {loading ? "—" : money(cashToSettle)}
          </div>
          <div className="text-[11px] text-ink-500 dark:text-obsidian-400">
            efectivo que tenés que entregar
          </div>
        </div>
      </div>

      {/* Listos para salir */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink-900 dark:text-white">
            Listos para llevar
          </h2>
          {!loading && ready.length > 1 && (
            <button
              onClick={startAll}
              disabled={startingAll}
              className="btn-primary text-sm"
            >
              <Play size={14} /> Salí con {ready.length}
            </button>
          )}
        </div>
        {loading ? (
          <div className="space-y-2" aria-hidden="true">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4">
                <Skeleton className="mb-2 h-3 w-1/3" />
                <Skeleton className="mb-2 h-5 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : ready.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No hay pedidos listos"
            description="Cuando el cajero te asigne un pedido, aparecerá acá para que salgas a entregarlo."
          />
        ) : (
          <div className="space-y-2">
            {ready.map((o) => (
              <OrderCardReady key={o.id} order={o} onUpdated={() => load({ silent: true })} />
            ))}
          </div>
        )}
      </section>

      {/* En camino */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink-900 dark:text-white">
          En camino
          {!loading && streetAmount > 0 && (
            <span className="ml-2 text-sm font-normal text-indigo-700 dark:text-indigo-300">
              Llevás {money(streetAmount)}
            </span>
          )}
        </h2>
        {loading ? (
          <div className="space-y-2" aria-hidden="true">
            {[1].map((i) => (
              <div key={i} className="card p-4">
                <Skeleton className="mb-2 h-5 w-1/2" />
                <Skeleton className="mb-2 h-3 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : onTheWay.length === 0 ? (
          <EmptyState
            icon={Navigation}
            title="No tenés pedidos en la calle"
            description="Cuando salgas a entregar un pedido, lo vas a ver acá con la dirección y el monto a cobrar."
          />
        ) : (
          <div className="space-y-2">
            {onTheWay.map((o) => (
              <OrderCardOnWay key={o.id} order={o} onUpdated={() => load({ silent: true })} />
            ))}
          </div>
        )}
      </section>

      {/* Entregados hoy */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900 dark:text-white">
          Entregados hoy
        </h2>
        {loading ? (
          <div className="text-sm text-ink-500 dark:text-obsidian-400">Cargando…</div>
        ) : deliveredToday.length === 0 ? (
          <div className="card border-dashed p-6 text-center text-sm text-ink-500 dark:text-obsidian-400">
            Cuando completes una entrega, la verás acá.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-paper-200 dark:divide-obsidian-800">
              {deliveredToday.map((o) => {
                const isCash = o.payment_method === "cash";
                const isDebt = o.payment_status === "debt";
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-800 dark:text-white">
                        #{o.id} · {o.customer_name || "Cliente"}
                      </div>
                      <div className="text-[11px] text-ink-500 dark:text-obsidian-400">
                        {formatTime(o.closed_at)} · {payMethodLabel(o.payment_method)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[10px] ${
                        isDebt
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : isCash
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                      }`}>
                        {isDebt ? "Deuda" : isCash ? "Cobrado" : "Transf."}
                      </span>
                      <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                        {money(o.total)}
                      </span>
                      <ChevronRight size={14} className="text-ink-300 dark:text-obsidian-500" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
