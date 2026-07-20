import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import {
  money,
  formatTime,
  payMethodLabel,
  assignTurns,
  statusLabels,
  statusColors,
} from "../../lib/format";
import { kanbanColumnClass, KANBAN_COUNT_PILL } from "../../lib/kanbanTones";
import { diffNewOrders, playBeep, isNotifyMuted, setNotifyMuted } from "../../lib/notify";
import {
  Phone, MapPin, Plus, ChevronRight, X, User as UserIcon,
  CheckCircle2, Truck, XCircle, StickyNote, Search,
  ChefHat, ArrowLeft, RotateCcw, AlertTriangle, Package,
  Clock, Volume2, VolumeX, Bell,
} from "lucide-react";

const COLUMNS = [
  { key: "pending",   title: "Pendientes" },
  { key: "preparing", title: "En preparación" },
  { key: "on_the_way",title: "En camino" },
  { key: "delivered", title: "Entregados" },
];

const DELIVERY_STATUS_ACCENT = {
  pending: "border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/40 dark:to-obsidian-900",
  preparing: "border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/40 dark:to-obsidian-900",
  on_the_way: "border-l-indigo-500 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/40 dark:to-obsidian-900",
  delivered: "border-l-emerald-500 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-obsidian-900",
};

function OrderCard({ order, turn, isNext, onClick, onAssign, onCancel, onPreparing, onBackPending, onReopen }) {
  const isPaid = order.payment_status === "paid";
  const accent =
    DELIVERY_STATUS_ACCENT[order.status] ||
    "border-l-paper-400 bg-white dark:border-l-obsidian-600 dark:bg-obsidian-900";

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-paper-300 border-l-4 p-0 shadow-soft transition hover:-translate-y-0.5 hover:border-wine-400 hover:shadow-pop dark:border-obsidian-700 dark:hover:border-wine-500/50 ${accent} ${
        isNext ? "ring-2 ring-wine-500 ring-offset-1 dark:ring-wine-400 dark:ring-offset-obsidian-950" : ""
      }`}
    >
      {isNext && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-wine-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white dark:bg-wine-500">
          Siguiente
        </div>
      )}

      <div className="p-3.5">
        {/* Header: turno + id + total */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {turn != null && (
                <span
                  className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                    isNext
                      ? "bg-wine-600 text-white dark:bg-wine-500"
                      : "bg-paper-200/90 text-ink-800 dark:bg-obsidian-800 dark:text-white"
                  }`}
                >
                  #{turn}
                </span>
              )}
              <span className="text-[11px] font-medium text-ink-500 dark:text-obsidian-300">
                Pedido #{order.id}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] text-ink-500 dark:text-obsidian-400">
                <Clock size={10} /> {formatTime(order.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-wine-100 text-wine-700 dark:bg-wine-900/50 dark:text-wine-300">
                <UserIcon size={15} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink-900 dark:text-white">
                  {order.customer_name || "Sin nombre"}
                </div>
                {order.delivery_name && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                    <Truck size={11} /> {order.delivery_name}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-xl bg-white/80 px-2.5 py-1.5 text-right shadow-sm ring-1 ring-paper-200 dark:bg-obsidian-950/80 dark:ring-obsidian-700">
            <div className="text-base font-bold tabular-nums leading-tight text-ink-900 dark:text-white">
              {money(order.total)}
            </div>
            {isPaid && (
              <div className="mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ {payMethodLabel(order.payment_method)}
              </div>
            )}
          </div>
        </div>

        {/* Chips meta */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {order.customer_phone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-paper-100 px-2 py-0.5 text-[11px] font-medium text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-100">
              <Phone size={11} className="text-ink-400" />
              {order.customer_phone}
            </span>
          )}
          {order.customer_neighborhood && (
            <span className="inline-flex items-center gap-1 rounded-full bg-paper-100 px-2 py-0.5 text-[11px] font-medium text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-100">
              <MapPin size={11} className="text-ink-400" />
              {order.customer_neighborhood}
            </span>
          )}
          {order.notes && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              <StickyNote size={11} /> Nota
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-paper-200/80 pt-3 dark:border-obsidian-700/80">
          {order.status === "pending" && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreparing(order);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                title="Marcar como en preparación"
              >
                <ChefHat size={14} /> Preparar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(order);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-wine-600 px-2 text-xs font-semibold text-white transition hover:bg-wine-700"
                title="Asignar repartidor"
              >
                <Truck size={14} /> Asignar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(order);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-paper-300 bg-white text-ink-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-obsidian-600 dark:bg-obsidian-950 dark:text-obsidian-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/40"
                title="Cancelar"
              >
                <XCircle size={15} />
              </button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(order);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-wine-600 px-2 text-xs font-semibold text-white transition hover:bg-wine-700"
              >
                <Truck size={14} /> Asignar repartidor
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBackPending(order);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-paper-300 bg-white text-ink-600 transition hover:bg-paper-100 dark:border-obsidian-600 dark:bg-obsidian-950 dark:text-obsidian-200"
                title="Volver a pendiente"
              >
                <ArrowLeft size={15} />
              </button>
            </>
          )}
          {order.status === "on_the_way" && (
            <div
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold ${
                isPaid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
              }`}
            >
              <CheckCircle2 size={14} />
              {isPaid ? "Pagado · cerrar al entregar" : "En camino · cobrar al entregar"}
            </div>
          )}
          {order.status === "delivered" && onReopen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReopen(order);
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-paper-300 bg-white text-xs font-semibold text-ink-700 transition hover:bg-paper-50 dark:border-obsidian-600 dark:bg-obsidian-950 dark:text-obsidian-100"
              title="Reabrir este pedido"
            >
              <RotateCcw size={14} /> Reabrir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tarjeta para pedidos entregados / historial (productos + cliente). */
function CompletedDeliveryCard({ order, onReopen, onClick }) {
  const items = order.items || [];
  const isDebt = order.payment_status === "debt";
  return (
    <div
      className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-l-4 border-paper-300 p-0 shadow-soft transition hover:-translate-y-0.5 hover:border-wine-400 hover:shadow-pop dark:border-obsidian-700 dark:hover:border-wine-500/50 ${
        isDebt
          ? "border-l-rose-500 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/30 dark:to-obsidian-900"
          : "border-l-emerald-500 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/25 dark:to-obsidian-900"
      }`}
      onClick={onClick}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-base font-bold text-ink-900 dark:text-white">#{order.id}</span>
              <span className="inline-flex items-center gap-0.5 text-xs text-ink-500 dark:text-obsidian-400">
                <Clock size={11} /> {formatTime(order.closed_at || order.created_at)}
              </span>
            </div>
            {order.payment_status === "paid" && (
              <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                ✓ {payMethodLabel(order.payment_method)}
              </span>
            )}
            {isDebt && (
              <span className="mt-1 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                Deuda
              </span>
            )}
          </div>
          <div className="shrink-0 rounded-xl bg-white/90 px-2.5 py-1.5 text-right shadow-sm ring-1 ring-paper-200 dark:bg-obsidian-950/80 dark:ring-obsidian-700">
            <div className="text-lg font-bold tabular-nums text-ink-900 dark:text-white">
              {money(order.total)}
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <UserIcon size={14} />
          </span>
          <div className="min-w-0 space-y-0.5 text-sm">
            <div className="truncate font-semibold text-ink-900 dark:text-white">
              {order.customer_name || "—"}
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-1 text-xs text-ink-600 dark:text-obsidian-300">
                <Phone size={11} /> {order.customer_phone}
              </div>
            )}
            {(order.customer_address || order.customer_neighborhood) && (
              <div className="flex items-start gap-1 text-xs text-ink-500 dark:text-obsidian-400">
                <MapPin size={11} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {[order.customer_neighborhood, order.customer_address].filter(Boolean).join(" · ")}
                </span>
              </div>
            )}
            {order.delivery_name && (
              <div className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                <Truck size={11} /> {order.delivery_name}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 min-h-0 flex-1 rounded-xl bg-white/60 p-2.5 ring-1 ring-paper-200/80 dark:bg-obsidian-950/50 dark:ring-obsidian-700">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 dark:text-obsidian-400">
            Productos
          </div>
          {items.length === 0 ? (
            <div className="text-xs text-ink-400">Sin detalle de ítems</div>
          ) : (
            <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-ink-700 dark:text-obsidian-200">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="min-w-0">
                    <b className="tabular-nums text-ink-900 dark:text-white">{it.quantity}×</b>{" "}
                    {it.name_snapshot}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-500 dark:text-obsidian-400">
                    {money(Number(it.unit_price) * Number(it.quantity))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {onReopen && order.status === "delivered" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReopen(order);
            }}
            className="mt-auto inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-paper-300 bg-white text-xs font-semibold text-ink-700 transition hover:bg-paper-50 dark:border-obsidian-600 dark:bg-obsidian-950 dark:text-obsidian-100"
          >
            <RotateCcw size={14} /> Reabrir
          </button>
        )}
      </div>
    </div>
  );
}

async function enrichOrdersWithItems(list) {
  const slice = list.slice(0, 40);
  const results = await Promise.all(
    slice.map(async (o) => {
      if (o.items?.length) return o;
      try {
        const { data } = await api.get(`/orders/${o.id}`);
        return { ...o, items: data.items || [] };
      } catch {
        return { ...o, items: [] };
      }
    })
  );
  return results;
}

function NewOrderModal({ onClose, onCreated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data.filter((p) => p.available)));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/customers", { params: { q: searchTerm.trim() } });
        setSuggestions(data);
        setShowSugg(true);
      } catch {}
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const fillFromCustomer = (c) => {
    setCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address || "");
    setNeighborhood(c.neighborhood || "");
    setReference(c.reference || "");
    setSearchTerm("");
    setShowSugg(false);
  };

  const clearCustomer = () => {
    setCustomer(null);
  };

  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((x) => x.product_id === p.id);
      if (ex) return c.map((x) => x.product_id === p.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...c, { product_id: p.id, name: p.name, unit_price: Number(p.price), quantity: 1, notes: "" }];
    });
  };
  const changeQty = (id, q) =>
    setCart((c) => c.flatMap((x) => x.product_id === id ? (q <= 0 ? [] : [{ ...x, quantity: q }]) : [x]));
  const total = cart.reduce((s, x) => s + x.unit_price * x.quantity, 0);

  const submit = async () => {
    setError(null);
    if (cart.length === 0) return setError("Agrega al menos un producto");
    if (!name || !phone) return setError("Nombre y teléfono del cliente son requeridos");
    if (!address) return setError("Dirección de entrega requerida");
    setSaving(true);
    try {
      let cust = customer;
      if (!cust) {
        const { data } = await api.post("/customers", { name, phone, address, neighborhood, reference });
        cust = data;
      }
      await onCreated({
        type: "delivery",
        customer_id: cust.id,
        notes: notes || null,
        items: cart.map((x) => ({ product_id: x.product_id, quantity: x.quantity, notes: x.notes || null })),
      });
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-paper-300 dark:border-obsidian-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">Nuevo pedido a domicilio</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
          <div className="p-5 border-r border-paper-300 dark:border-obsidian-800 overflow-y-auto">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">Datos del cliente</h3>

            {!customer && (
              <div className="relative mb-3" ref={searchRef}>
                <label className="label">Buscar cliente existente (nombre o teléfono)</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-ink-400 dark:text-obsidian-500"/>
                  <input
                    className="input pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                    placeholder="Ej. Juan Pérez o 555-1234…"
                    autoComplete="off"
                  />
                </div>
                {showSugg && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full card border-wine-300 dark:border-wine-700 max-h-64 overflow-y-auto shadow-pop">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={() => fillFromCustomer(s)}
                        className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-obsidian-800 border-b border-paper-200 dark:border-obsidian-800 last:border-0"
                      >
                        <div className="font-medium text-ink-800 dark:text-obsidian-50 text-sm">{s.name}</div>
                        <div className="text-xs text-ink-500 dark:text-obsidian-400 flex items-center gap-2">
                          <Phone size={10}/> {s.phone}
                          {s.neighborhood && <><MapPin size={10}/> {s.neighborhood}</>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showSugg && searchTerm.length >= 2 && suggestions.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full card px-3 py-2 text-sm text-ink-500 dark:text-obsidian-400">
                    Sin coincidencias. Completa los datos abajo para crear el cliente.
                  </div>
                )}
              </div>
            )}

            {customer && (
              <div className="mb-3 card p-3 border-wine-300 bg-wine-50/40 dark:bg-wine-900/20 dark:border-wine-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-wine-600 dark:text-wine-300 font-medium">Cliente seleccionado</div>
                    <div className="font-semibold text-ink-800 dark:text-obsidian-50">{customer.name}</div>
                    <div className="text-xs text-ink-500 dark:text-obsidian-400 flex items-center gap-2">
                      <Phone size={10}/> {customer.phone}
                    </div>
                  </div>
                  <button onClick={clearCustomer} className="btn-ghost text-xs" title="Quitar selección">
                    <X size={14}/>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={!!customer} />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-ink-400 dark:text-obsidian-500"/>
                  <input className="input pl-8" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!!customer} />
                </div>
              </div>
              <div>
                <label className="label">Dirección de entrega</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-ink-400 dark:text-obsidian-500"/>
                  <input className="input pl-8" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Colonia</label>
                  <input className="input" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                </div>
                <div>
                  <label className="label">Referencia</label>
                  <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Notas de la entrega</label>
                <textarea rows={2} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Tocar timbre 2 veces, trae cambio de 1000…" />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mt-5 mb-2">Carrito</h3>
            {cart.length === 0 && <div className="text-sm text-ink-400 dark:text-obsidian-500">Agrega productos del menú →</div>}
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.product_id} className="flex items-center gap-2 text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-ink-700 dark:text-obsidian-100">{c.name}</div>
                    <div className="text-xs text-ink-500 dark:text-obsidian-400">{money(c.unit_price)} c/u</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeQty(c.product_id, c.quantity - 1)} className="w-7 h-7 rounded-lg bg-paper-200 dark:bg-obsidian-800 hover:bg-paper-300 dark:hover:bg-obsidian-700">-</button>
                    <span className="w-7 text-center font-semibold">{c.quantity}</span>
                    <button onClick={() => changeQty(c.product_id, c.quantity + 1)} className="w-7 h-7 rounded-lg bg-paper-200 dark:bg-obsidian-800 hover:bg-paper-300 dark:hover:bg-obsidian-700">+</button>
                  </div>
                  <div className="w-20 text-right font-semibold">{money(c.unit_price * c.quantity)}</div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="mt-3 pt-3 border-t border-paper-200 dark:border-obsidian-800 flex items-center justify-between">
                <span className="text-sm text-ink-500 dark:text-obsidian-400">Total</span>
                <span className="text-xl font-bold text-ink-800 dark:text-obsidian-50">{money(total)}</span>
              </div>
            )}
            {error && <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">{error}</div>}
          </div>

          <div className="p-5 overflow-y-auto bg-paper-100 dark:bg-obsidian-950">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">Menú</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="card p-3 text-left hover:border-wine-400 dark:hover:border-wine-500 transition"
                >
                  <div className="text-xs text-ink-400 dark:text-obsidian-500">{p.category_name || "Sin categoría"}</div>
                  <div className="font-medium text-ink-800 dark:text-obsidian-50 text-sm">{p.name}</div>
                  <div className="text-wine-600 dark:text-wine-300 font-semibold mt-1">{money(p.price)}</div>
                </button>
              ))}
              {products.length === 0 && <div className="text-sm text-ink-400 dark:text-obsidian-500 col-span-full">No hay productos en el menú. Agrega desde "Menú (catálogo)".</div>}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-paper-300 dark:border-obsidian-800 flex items-center justify-between">
          <div className="text-sm text-ink-500 dark:text-obsidian-400">{cart.length} productos · {money(total)}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">Cancelar</button>
            <button onClick={submit} disabled={saving} className="btn-primary">
              {saving ? "Guardando…" : "Crear pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignModal({ order, onClose, onAssigned }) {
  const [persons, setPersons] = useState([]);
  useEffect(() => { api.get("/delivery").then((r) => setPersons(r.data)); }, []);
  const [err, setErr] = useState(null);
  const assign = async (id) => {
    try {
      await api.post(`/orders/${order.id}/assign-delivery`, { delivery_person_id: id });
      onAssigned();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 mb-3">Asignar repartidor · #{order.id}</h2>
        <div className="text-sm text-ink-500 dark:text-obsidian-400 mb-3">{order.customer_name} · {order.customer_address}</div>
        {persons.length === 0 && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">No hay repartidores registrados.</div>}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {persons.map((p) => (
            <button
              key={p.id}
              onClick={() => assign(p.id)}
              className="w-full card p-3 text-left hover:border-wine-400 dark:hover:border-wine-500 flex items-center justify-between transition"
            >
              <div>
                <div className="font-medium text-ink-800 dark:text-obsidian-50">{p.name}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{p.phone || "Sin teléfono"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-ink-600 dark:text-obsidian-200">{p.active_orders} activo{p.active_orders !== 1 ? "s" : ""}</div>
                <ChevronRight size={18} className="text-ink-400 dark:text-obsidian-500 ml-auto" />
              </div>
            </button>
          ))}
        </div>
        {err && <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">{err}</div>}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setItems(data.items || []);
    } catch {
      setItems(order.items || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [order.id]);

  const closePaid = async () => {
    await api.post(`/orders/${order.id}/close`, { payment_method: "cash" });
    onChanged();
    onClose();
  };

  const markDebt = async () => {
    await api.post(`/orders/${order.id}/mark-delivered`);
    onChanged();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">
            Pedido #{order.id}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-ink-400 dark:text-obsidian-500">Cliente:</span>{" "}
            <b>{order.customer_name || "—"}</b>
          </div>
          <div>
            <span className="text-ink-400 dark:text-obsidian-500">Teléfono:</span>{" "}
            {order.customer_phone || "—"}
          </div>
          <div className="col-span-2">
            <span className="text-ink-400 dark:text-obsidian-500">Dirección:</span>{" "}
            {order.customer_address || "—"}
            {order.customer_neighborhood ? ` · ${order.customer_neighborhood}` : ""}
          </div>
          {order.customer_reference && (
            <div className="col-span-2">
              <span className="text-ink-400 dark:text-obsidian-500">Referencia:</span>{" "}
              {order.customer_reference}
            </div>
          )}
          {order.delivery_name && (
            <div>
              <span className="text-ink-400 dark:text-obsidian-500">Repartidor:</span>{" "}
              <b>{order.delivery_name}</b>
            </div>
          )}
          <div>
            <span className="text-ink-400 dark:text-obsidian-500">Estado:</span>{" "}
            <span className={`badge ${statusColors[order.status] || ""}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          {order.payment_status === "paid" && (
            <div>
              <span className="text-ink-400 dark:text-obsidian-500">Pago:</span>{" "}
              {payMethodLabel(order.payment_method)}
            </div>
          )}
        </div>
        {order.notes && (
          <div className="card mb-3 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <StickyNote size={14} className="mr-1 inline" /> {order.notes}
          </div>
        )}
        {loading ? (
          <div className="text-sm text-ink-500 dark:text-obsidian-400">Cargando…</div>
        ) : (
          <div className="space-y-1.5">
            {items.length === 0 && (
              <div className="text-sm text-ink-400">Sin productos en el pedido.</div>
            )}
            {items.map((it, i) => (
              <div
                key={it.id ?? i}
                className="flex items-center justify-between border-b border-paper-200 py-1.5 text-sm dark:border-obsidian-800"
              >
                <div>
                  <div className="font-medium text-ink-800 dark:text-obsidian-50">
                    {it.name_snapshot}{" "}
                    {it.notes && (
                      <span className="text-xs text-amber-700 dark:text-amber-400">· {it.notes}</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-obsidian-400">
                    {money(it.unit_price)} c/u
                  </div>
                </div>
                <div className="font-semibold text-ink-700 dark:text-obsidian-100">
                  x{it.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-paper-200 pt-3 dark:border-obsidian-800">
          <span className="text-ink-500 dark:text-obsidian-400">Total</span>
          <span className="text-2xl font-bold tabular-nums text-ink-800 dark:text-obsidian-50">
            {money(order.total)}
          </span>
        </div>
        {order.status === "on_the_way" && (
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={closePaid} className="btn-primary flex-1">
              <CheckCircle2 size={16} /> Entregado y cobrado
            </button>
            <button
              type="button"
              onClick={markDebt}
              className="btn-secondary flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/20"
            >
              <AlertTriangle size={16} /> Entregado (deuda)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryModal({ onClose }) {
  const [persons, setPersons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { api.get("/delivery").then((r) => setPersons(r.data)); }, []);

  const loadHistory = async (id) => {
    setSelected(id);
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get("/delivery/history", { params: { delivery_person_id: id, limit: 100 } });
      setHistory(data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const pname = persons.find((p) => p.id === selected)?.name || "";
  const totalEarned = history.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="card flex max-h-[90vh] w-full max-w-4xl flex-col">
        <div className="flex items-center justify-between border-b border-paper-300 px-5 py-4 dark:border-obsidian-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-800 dark:text-obsidian-50">
            <Clock size={18}/> Historial de repartidores
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {persons.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadHistory(p.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  selected === p.id
                    ? "border-wine-500 bg-wine-600 text-white"
                    : "border-paper-300 bg-paper-50 text-ink-600 hover:bg-paper-200 dark:border-obsidian-700 dark:bg-obsidian-900 dark:text-obsidian-200"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          {!selected && (
            <div className="py-8 text-center text-sm text-ink-400">Selecciona un repartidor</div>
          )}
          {loading && <div className="text-sm text-ink-500">Cargando…</div>}
          {err && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              {err}
            </div>
          )}
          {selected && !loading && !err && history.length === 0 && (
            <div className="py-8 text-center text-sm text-ink-400">{pname} no tiene entregas.</div>
          )}
          {selected && !loading && history.length > 0 && (
            <div>
              <div className="card mb-4 flex items-center justify-between border-wine-200 bg-wine-50/60 p-3 dark:border-wine-800 dark:bg-wine-900/20">
                <span className="text-sm font-medium">Total entregado · {pname}</span>
                <span className="text-lg font-bold text-wine-600 dark:text-wine-300">{money(totalEarned)}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {history.map((o) => (
                  <CompletedDeliveryCard key={o.id} order={o} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReopenModal({ order, onClose, onReopened }) {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const required = "REABRIR";

  const submit = async () => {
    if (confirmText.trim().toUpperCase() !== required) {
      setErr("Escribe REABRIR para confirmar");
      return;
    }
    setBusy(true); setErr(null);
    try {
      await api.post(`/orders/${order.id}/reopen`);
      onReopened(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 mb-3 flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400"/>
          Reabrir pedido #{order.id}
        </h2>
        <div className="card p-3 bg-amber-50 border-amber-200 mb-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
          <b>Esta acción es delicada.</b> Va a:
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>Deshacer el cobro ({money(order.total)} · {order.payment_method || "?"})</li>
            <li>Devolver el pedido a {order.delivery_person_id ? "En camino (repartidor vuelve a estar ocupado)" : "En preparación"}</li>
            <li>Si ya se contabilizó en reportes de hoy, no se actualizará</li>
          </ul>
        </div>
        <label className="label">Escribe <code className="px-1.5 py-0.5 rounded bg-ink-100 dark:bg-obsidian-800 text-amber-700 dark:text-amber-300 font-mono text-xs">{required}</code> para confirmar:</label>
        <input
          autoFocus
          className="input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={required}
        />
        {err && <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">{err}</div>}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={submit} disabled={busy} className="btn-primary flex-1">
            {busy ? "Reabriendo…" : "Reabrir pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Delivery() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [openNew, setOpenNew] = useState(false);
  const [toAssign, setToAssign] = useState(null);
  const [toView, setToView] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [toReopen, setToReopen] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [muted, setMuted] = useState(() => isNotifyMuted());
  const [newFlash, setNewFlash] = useState(0);
  const [enriched, setEnriched] = useState([]);
  const knownIdsRef = useRef(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { type: "delivery" } });
      if (knownIdsRef.current === null) {
        knownIdsRef.current = new Set(data.map((o) => o.id));
      } else {
        const prev = Array.from(knownIdsRef.current).map((id) => ({ id }));
        const { added, grew } = diffNewOrders(prev, data);
        if (grew) {
          knownIdsRef.current = new Set(data.map((o) => o.id));
          playBeep();
          setNewFlash(added.length);
          setTimeout(() => setNewFlash(0), 8000);
        } else {
          knownIdsRef.current = new Set(data.map((o) => o.id));
        }
      }
      setOrders(data);
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), 12_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let result;
    if (filter === "active") result = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
    else if (filter === "delivered") result = orders.filter((o) => o.status === "delivered");
    else if (filter === "cancelled") result = orders.filter((o) => o.status === "cancelled");
    else result = orders;
    // FIFO: oldest first, then assign turn numbers
    const byDate = [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return assignTurns(byDate);
  }, [orders, filter]);

  const byStatus = (s) => filtered.filter((o) => o.status === s);
  const nextOrder = useMemo(() => filtered.find((o) => o.status === "pending"), [filtered]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveredTodayCount = useMemo(
    () => orders.filter((o) => o.status === "delivered" && new Date(o.created_at) >= today).length,
    [orders]
  );
  const totalDeliveredCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );

  useEffect(() => {
    if (filter !== "delivered" && filter !== "cancelled") {
      setEnriched([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const list = filtered
        .slice()
        .sort((a, b) => new Date(b.closed_at || b.created_at) - new Date(a.closed_at || a.created_at));
      const withItems = await enrichOrdersWithItems(list);
      if (!cancelled) setEnriched(withItems);
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, filtered]);

  const onCreated = async (payload) => { await api.post("/orders", payload); await load(); };
  const setStatus = async (id, status) => {
    await api.post(`/orders/${id}/status`, { status });
    await load();
  };
  const cancel = async () => {
    await api.post(`/orders/${toCancel.id}/status`, { status: "cancelled", cancel_reason: cancelReason || "No especificado" });
    setToCancel(null); setCancelReason(""); await load();
  };

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el cajero/administrador.</div>;
  }

  return (
    <div>
      <Header
        title="Pedidos a domicilio"
        subtitle="Tablero Kanban de pedidos a domicilio"
        right={
          <div className="flex flex-nowrap items-center gap-2">
            {newFlash > 0 && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white animate-pulse">
                <Bell size={12} /> +{newFlash}
              </span>
            )}
            <button
              type="button"
              title={muted ? "Activar sonido" : "Silenciar avisos"}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                setNotifyMuted(next);
              }}
              className="btn-secondary h-9 px-2"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="flex rounded-xl border border-paper-300 p-0.5 dark:border-obsidian-700">
              {[
                { v: "active", l: "Activos" },
                { v: "delivered", l: "Entregados" },
                { v: "cancelled", l: "Cancelados" },
              ].map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFilter(f.v)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f.v
                      ? "bg-wine-600 text-white"
                      : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setHistoryOpen(true)} className="btn-secondary h-9 whitespace-nowrap">
              <Clock size={16}/> Repartidores
            </button>
            <button type="button" onClick={() => setOpenNew(true)} className="btn-primary h-9 whitespace-nowrap">
              <Plus size={16}/> Nuevo pedido
            </button>
          </div>
        }
      />

      {deliveredTodayCount > 0 && filter === "active" && (
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 border-paper-300 p-3 dark:border-obsidian-700">
          <div className="flex items-center gap-2 text-sm text-ink-700 dark:text-white">
            <Package size={16}/>
            <span>
              <b>{deliveredTodayCount}</b> entregado{deliveredTodayCount === 1 ? "" : "s"} hoy
            </span>
          </div>
          <button type="button" onClick={() => setFilter("delivered")} className="btn-secondary h-9 whitespace-nowrap text-xs">
            <Package size={14} /> Ver entregados ({totalDeliveredCount})
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-ink-600 dark:text-white">Cargando…</div>
      ) : filter === "delivered" || filter === "cancelled" ? (
        <div>
          <div className="mb-3 text-sm font-medium text-ink-600 dark:text-obsidian-300">
            {filter === "delivered" ? "Entregados" : "Cancelados"} · {(enriched.length || filtered.length)} pedido
            {(enriched.length || filtered.length) === 1 ? "" : "s"}
          </div>
          {(enriched.length || filtered.length) === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-500">
              No hay pedidos {filter === "delivered" ? "entregados" : "cancelados"}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(enriched.length ? enriched : filtered).map((o) => (
                <CompletedDeliveryCard
                  key={o.id}
                  order={o}
                  onReopen={filter === "delivered" ? (x) => setToReopen(x) : undefined}
                  onClick={() => setToView(o)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 items-start ${
            filter === "active" ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {(filter === "active"
            ? COLUMNS.filter((c) => c.key !== "delivered")
            : COLUMNS
          ).map((col) => (
            <div key={col.key} className={`${kanbanColumnClass(col.key)} max-h-[calc(100vh-12rem)] flex flex-col`}>
              <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                <h3 className="font-semibold text-ink-900 dark:text-white">{col.title}</h3>
                <span className={KANBAN_COUNT_PILL}>
                  {byStatus(col.key).length}
                </span>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {byStatus(col.key).map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    turn={o.turn_number}
                    isNext={nextOrder && o.id === nextOrder.id}
                    onClick={() => setToView(o)}
                    onAssign={(x) => setToAssign(x)}
                    onCancel={(x) => setToCancel(x)}
                    onPreparing={(x) => setStatus(x.id, "preparing")}
                    onBackPending={(x) => setStatus(x.id, "pending")}
                    onReopen={(x) => setToReopen(x)}
                  />
                ))}
                {byStatus(col.key).length === 0 && (
                  <div className="py-6 text-center text-xs text-ink-500 dark:text-white/70">Sin pedidos</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}
      {openNew && <NewOrderModal onClose={() => setOpenNew(false)} onCreated={onCreated} />}
      {toAssign && <AssignModal order={toAssign} onClose={() => setToAssign(null)} onAssigned={load} />}
      {toView && <OrderDetailModal order={toView} onClose={() => setToView(null)} onChanged={load} />}
      {toReopen && <ReopenModal order={toReopen} onClose={() => setToReopen(null)} onReopened={load} />}
      {toCancel && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 mb-3">Cancelar pedido #{toCancel.id}</h2>
            <label className="label">Motivo</label>
            <input className="input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cliente no contesta, dirección errónea…" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setToCancel(null); setCancelReason(""); }} className="btn-secondary">Volver</button>
              <button onClick={cancel} className="btn-danger">Cancelar pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
