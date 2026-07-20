import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import {
  money, formatTime, payMethodLabel, statusLabels, statusColors,
  assignTurns, waitMinutes, waitLabel,
} from "../../lib/format";
import { kanbanColumnClass, KANBAN_COUNT_PILL } from "../../lib/kanbanTones";
import { diffNewOrders, playBeep, isNotifyMuted, setNotifyMuted } from "../../lib/notify";
import {
  ShoppingBag, Plus, X, Clock, CheckCircle2, ChefHat,
  ChevronRight, StickyNote, Trash2, ArrowRight, Timer,
  Banknote, CreditCard, Building2, Wallet, AlertTriangle, RotateCcw,
  Volume2, VolumeX, Bell,
} from "lucide-react";

const COLUMNS = [
  { key: "pending",      title: "Pendientes",         icon: Clock },
  { key: "preparing",    title: "En preparación",     icon: ChefHat },
  { key: "ready_to_pay", title: "Listo para recoger", icon: CheckCircle2 },
];

const METHOD_LABELS = {
  cash:     { l: "Efectivo",      icon: Banknote },
  card:     { l: "Tarjeta",       icon: CreditCard },
  transfer: { l: "Transferencia", icon: Building2 },
};

const ESTIMATE_PRESETS = [5, 10, 15, 20, 30];

const PICKUP_STATUS_ACCENT = {
  pending:
    "border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/40 dark:to-obsidian-900",
  preparing:
    "border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/40 dark:to-obsidian-900",
  ready_to_pay:
    "border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-obsidian-900",
};

function WaitTimeBadge({ createdAt, estimateMin }) {
  const elapsed = waitMinutes(createdAt);
  if (estimateMin && elapsed > 0) {
    const remaining = Math.max(0, estimateMin - elapsed);
    if (remaining > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
          <Timer size={11} /> ~{remaining} min
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
        <Timer size={11} /> Tiempo cumplido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-paper-100 px-2 py-0.5 text-[11px] font-medium text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-200">
      <Clock size={11} /> {waitLabel(createdAt)}
    </span>
  );
}

function OrderCard({ order, turn, isNext, onClick, onPreparing, onReady, onPay, onCancel, onBackPending }) {
  const elapsed = waitMinutes(order.created_at);
  const overEstimate = order.estimate_minutes && elapsed > order.estimate_minutes;
  const accent =
    PICKUP_STATUS_ACCENT[order.status] ||
    "border-l-paper-400 bg-white dark:border-l-obsidian-600 dark:bg-obsidian-900";

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-paper-300 border-l-4 p-0 shadow-soft transition hover:-translate-y-0.5 hover:border-wine-400 hover:shadow-pop dark:border-obsidian-700 dark:hover:border-wine-500/50 ${accent} ${
        isNext ? "ring-2 ring-wine-500 ring-offset-1 dark:ring-wine-400 dark:ring-offset-obsidian-950" : ""
      } ${overEstimate && !isNext ? "ring-2 ring-amber-400/70 dark:ring-amber-500/50" : ""}`}
    >
      {isNext && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-wine-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white dark:bg-wine-500">
          Siguiente
        </div>
      )}

      <div className="p-3.5">
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                <ShoppingBag size={15} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink-900 dark:text-white">
                  Para llevar
                </div>
                {order.estimate_minutes > 0 && (
                  <div className="text-[11px] text-ink-500 dark:text-obsidian-400">
                    Estimado {order.estimate_minutes} min
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-xl bg-white/80 px-2.5 py-1.5 text-right shadow-sm ring-1 ring-paper-200 dark:bg-obsidian-950/80 dark:ring-obsidian-700">
            <div className="text-base font-bold tabular-nums leading-tight text-ink-900 dark:text-white">
              {money(order.total)}
            </div>
            {order.payment_status === "paid" && (
              <div className="mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Pagado
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <WaitTimeBadge createdAt={order.created_at} estimateMin={order.estimate_minutes} />
          {order.notes && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              <StickyNote size={11} />
              <span className="truncate">{order.notes}</span>
            </span>
          )}
        </div>

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
              >
                <ChefHat size={14} /> Preparar
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
                <Trash2 size={15} />
              </button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReady(order);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={14} /> Listo
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
                <ArrowRight size={15} className="rotate-180" />
              </button>
            </>
          )}
          {order.status === "ready_to_pay" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPay(order);
              }}
              className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-wine-600 px-2 text-xs font-semibold text-white transition hover:bg-wine-700"
            >
              <CheckCircle2 size={14} /> Cobrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewPickupModal({ onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState("");
  const [estimateMin, setEstimateMin] = useState(10);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/products"),
      api.get("/categories"),
    ]).then(([p, c]) => {
      setProducts(p.data.filter((p) => p.available));
      setCategories(c.data.filter((c) => c.active));
    });
  }, []);

  const filteredProducts = selectedCat
    ? products.filter((p) => p.category_id === selectedCat)
    : products;

  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((x) => x.product_id === p.id);
      if (ex) return c.map((x) => x.product_id === p.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...c, { product_id: p.id, name: p.name, unit_price: Number(p.price), quantity: 1, notes: "" }];
    });
  };

  const changeQty = (id, q) =>
    setCart((c) => c.flatMap((x) => x.product_id === id ? (q <= 0 ? [] : [{ ...x, quantity: q }]) : [x]));

  const updateItemNotes = (id, n) =>
    setCart((c) => c.map((x) => x.product_id === id ? { ...x, notes: n } : x));

  const total = cart.reduce((s, x) => s + x.unit_price * x.quantity, 0);

  const submit = async () => {
    setError(null);
    if (cart.length === 0) return setError("Agregá al menos un producto");
    setSaving(true);
    try {
      await onCreated({
        type: "pickup",
        notes: notes || null,
        estimate_minutes: estimateMin || null,
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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-paper-300 dark:border-obsidian-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 flex items-center gap-2">
            <ShoppingBag size={20}/> Nuevo pedido para llevar
          </h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
          <div className="p-5 border-r border-paper-300 dark:border-obsidian-800 overflow-y-auto">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">Productos</h3>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setSelectedCat(null)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    !selectedCat ? "bg-wine-600 text-white" : "bg-paper-200 text-ink-600 hover:bg-paper-300 dark:bg-obsidian-800 dark:text-obsidian-200 dark:hover:bg-obsidian-700"
                  }`}
                >
                  Todos
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id === selectedCat ? null : c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      selectedCat === c.id ? "bg-wine-600 text-white" : "bg-paper-200 text-ink-600 hover:bg-paper-300 dark:bg-obsidian-800 dark:text-obsidian-200 dark:hover:bg-obsidian-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="card p-3 text-left hover:border-wine-400 dark:hover:border-wine-500 transition group"
                >
                  <div className="font-medium text-sm text-ink-800 dark:text-obsidian-50 group-hover:text-wine-600 dark:group-hover:text-wine-300 truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-obsidian-400 mt-0.5">{money(p.price)}</div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-sm text-ink-400 dark:text-obsidian-500 py-4">
                  No hay productos disponibles
                </div>
              )}
            </div>
          </div>

          <div className="p-5 overflow-y-auto flex flex-col">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-obsidian-100 mb-3">
              Pedido {cart.length > 0 && `(${cart.reduce((s, x) => s + x.quantity, 0)} items)`}
            </h3>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-ink-400 dark:text-obsidian-500">
                Seleccioná productos del menú
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {cart.map((it) => (
                  <div key={it.product_id} className="card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-ink-800 dark:text-obsidian-50 truncate">{it.name}</div>
                        <div className="text-xs text-ink-500 dark:text-obsidian-400">{money(it.unit_price)} c/u</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => changeQty(it.product_id, it.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-paper-200 dark:bg-obsidian-800 flex items-center justify-center text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-ink-800 dark:text-obsidian-50">{it.quantity}</span>
                        <button
                          onClick={() => changeQty(it.product_id, it.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-paper-200 dark:bg-obsidian-800 flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      className="input mt-2 py-1 text-xs"
                      placeholder="Nota (ej: sin cebolla)"
                      value={it.notes}
                      onChange={(e) => updateItemNotes(it.product_id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Tiempo estimado (minutos)</label>
                <div className="flex gap-1.5">
                  {ESTIMATE_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setEstimateMin(m)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
                        estimateMin === m
                          ? "bg-wine-600 text-white border-wine-600"
                          : "bg-paper-50 text-ink-700 border-paper-300 hover:bg-paper-200 dark:bg-obsidian-900 dark:text-obsidian-100 dark:border-obsidian-700 dark:hover:bg-obsidian-800"
                      }`}
                    >
                      {m}min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notas (opcional)</label>
                <textarea
                  className="input min-h-[50px] resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales..."
                />
              </div>

              {cart.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-paper-200 dark:border-obsidian-800">
                  <span className="text-sm text-ink-500 dark:text-obsidian-400">Total</span>
                  <span className="text-xl font-bold text-ink-800 dark:text-obsidian-50">{money(total)}</span>
                </div>
              )}

              {error && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={submit} disabled={saving || cart.length === 0} className="btn-primary flex-1">
                  {saving ? "Creando…" : "Crear pedido"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayModal({ order, onClose, onPaid }) {
  const [method, setMethod] = useState("cash");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      await api.post(`/orders/${order.id}/close`, { payment_method: method, tip: 0 });
      onPaid(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 mb-4 flex items-center gap-2">
          <CheckCircle2 size={20}/> Cobrar pedido #{order.id}
        </h2>
        <div className="bg-paper-100 dark:bg-obsidian-950 rounded-xl p-4 mb-4 text-center">
          <div className="text-sm text-ink-500 dark:text-obsidian-400">Total a cobrar</div>
          <div className="text-3xl font-bold text-ink-800 dark:text-obsidian-50">{money(order.total)}</div>
        </div>
        <label className="label">Método de pago</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(METHOD_LABELS).map(([k, m]) => {
            const Icon = m.icon;
            return (
              <button
                key={k}
                onClick={() => setMethod(k)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 ${
                  method === k
                    ? "bg-wine-600 text-white border-wine-600"
                    : "bg-paper-50 text-ink-700 border-paper-300 hover:bg-paper-200 dark:bg-obsidian-900 dark:text-obsidian-100 dark:border-obsidian-700 dark:hover:bg-obsidian-800"
                }`}
              >
                <Icon size={14}/> {m.l}
              </button>
            );
          })}
        </div>
        {err && <div className="text-sm text-rose-700 dark:text-rose-300 mb-3">{err}</div>}
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={submit} disabled={busy} className="btn-primary flex-1">
            {busy ? "Procesando…" : "Confirmar cobro"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PickupPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [openNew, setOpenNew] = useState(false);
  const [toPay, setToPay] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [muted, setMuted] = useState(() => isNotifyMuted());
  const [newFlash, setNewFlash] = useState(0);
  const [enriched, setEnriched] = useState([]);
  const knownIdsRef = useRef(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { type: "pickup" } });
      if (knownIdsRef.current === null) {
        knownIdsRef.current = new Set(data.map((o) => o.id));
      } else {
        const prev = Array.from(knownIdsRef.current).map((id) => ({ id }));
        const { added, grew } = diffNewOrders(prev, data);
        knownIdsRef.current = new Set(data.map((o) => o.id));
        if (grew) {
          playBeep({ frequency: 740 });
          setNewFlash(added.length);
          setTimeout(() => setNewFlash(0), 8000);
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

  // Ordenar FIFO (más viejo primero) y asignar turnos
  const sorted = useMemo(() => {
    const byDate = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return assignTurns(byDate);
  }, [orders]);

  const filtered = useMemo(() => {
    if (filter === "active") return sorted.filter((o) => !["delivered", "cancelled", "paid"].includes(o.status));
    if (filter === "paid") return sorted.filter((o) => o.status === "delivered" || o.payment_status === "paid");
    if (filter === "cancelled") return sorted.filter((o) => o.status === "cancelled");
    return sorted;
  }, [sorted, filter]);

  const byStatus = (s) => filtered.filter((o) => o.status === s);

  // El "siguiente" es el pending más viejo
  const nextOrder = useMemo(
    () => sorted.find((o) => o.status === "pending"),
    [sorted]
  );

  const activeCount = useMemo(
    () => orders.filter((o) => !["delivered", "cancelled", "paid"].includes(o.status)).length,
    [orders]
  );

  useEffect(() => {
    if (filter !== "paid" && filter !== "cancelled") {
      setEnriched([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const list = filtered
        .slice()
        .sort((a, b) => new Date(b.closed_at || b.created_at) - new Date(a.closed_at || a.created_at));
      const slice = list.slice(0, 40);
      const withItems = await Promise.all(
        slice.map(async (o) => {
          try {
            const { data } = await api.get(`/orders/${o.id}`);
            return { ...o, items: data.items || [] };
          } catch {
            return { ...o, items: [] };
          }
        })
      );
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
    await api.post(`/orders/${toCancel.id}/status`, { status: "cancelled", cancel_reason: cancelReason || "Sin motivo" });
    setToCancel(null); setCancelReason(""); await load();
  };

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el cajero/administrador.</div>;
  }

  return (
    <div>
      <Header
        title="Para llevar"
        subtitle="Pedidos walk-in · Turnos y cola de atención"
        right={
          <div className="flex items-center gap-2">
            {newFlash > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white animate-pulse">
                <Bell size={12} /> +{newFlash} nuevo{newFlash !== 1 ? "s" : ""}
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
                { v: "paid", l: "Cobrados" },
                { v: "cancelled", l: "Cancelados" },
              ].map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFilter(f.v)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    filter === f.v ? "bg-wine-600 text-white" : "text-ink-600 dark:text-obsidian-200"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setOpenNew(true)} className="btn-primary h-9 whitespace-nowrap">
              <Plus size={16}/> Nuevo pedido
            </button>
          </div>
        }
      />

      {activeCount > 0 && filter === "active" && (
        <div className="mb-4 card flex items-center justify-between border-paper-300 p-3 dark:border-obsidian-700">
          <div className="flex items-center gap-2 text-sm text-ink-700 dark:text-white">
            <ShoppingBag size={16}/>
            <span><b>{activeCount}</b> pedido{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""} en cola</span>
          </div>
          {nextOrder && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-wine-600 px-2 py-0.5 text-white dark:bg-wine-500">
                #{nextOrder.turn_number} SIGUIENTE
              </span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-ink-600 dark:text-white">Cargando…</div>
      ) : filter === "paid" || filter === "cancelled" ? (
        <div>
          <div className="mb-3 text-sm font-medium text-ink-600 dark:text-obsidian-300">
            {filter === "paid" ? "Cobrados / recogidos" : "Cancelados"} · {(enriched.length || filtered.length)}{" "}
            pedido{(enriched.length || filtered.length) === 1 ? "" : "s"}
          </div>
          {(enriched.length || filtered.length) === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-500">
              No hay pedidos {filter === "paid" ? "cobrados" : "cancelados"}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(enriched.length ? enriched : filtered).map((o) => {
                const cancelled = o.status === "cancelled";
                return (
                  <div
                    key={o.id}
                    className={`flex h-full flex-col overflow-hidden rounded-2xl border border-l-4 border-paper-300 shadow-soft dark:border-obsidian-700 ${
                      cancelled
                        ? "border-l-rose-500 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/30 dark:to-obsidian-900"
                        : "border-l-emerald-500 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/25 dark:to-obsidian-900"
                    }`}
                  >
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-base font-bold text-ink-900 dark:text-white">
                              #{o.id}
                            </span>
                            {o.turn_number != null && (
                              <span className="rounded-lg bg-paper-200/90 px-2 py-0.5 text-[11px] font-bold dark:bg-obsidian-800">
                                Turno {o.turn_number}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500 dark:text-obsidian-400">
                            <Clock size={11} />
                            {new Date(o.closed_at || o.created_at).toLocaleString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {o.payment_status === "paid" && (
                            <span className="mt-1.5 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ✓ {payMethodLabel(o.payment_method)}
                            </span>
                          )}
                          {cancelled && (
                            <span className="mt-1.5 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                              Cancelado
                            </span>
                          )}
                        </div>
                        <div className="shrink-0 rounded-xl bg-white/90 px-2.5 py-1.5 text-right shadow-sm ring-1 ring-paper-200 dark:bg-obsidian-950/80 dark:ring-obsidian-700">
                          <div className="text-lg font-bold tabular-nums text-ink-900 dark:text-white">
                            {money(o.total)}
                          </div>
                        </div>
                      </div>
                      {o.notes && (
                        <div className="mb-2 flex items-start gap-1 text-xs text-ink-500 dark:text-obsidian-400">
                          <StickyNote size={12} className="mt-0.5 shrink-0" />
                          <span>{o.notes}</span>
                        </div>
                      )}
                      <div className="rounded-xl bg-white/60 p-2.5 ring-1 ring-paper-200/80 dark:bg-obsidian-950/50 dark:ring-obsidian-700">
                        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 dark:text-obsidian-400">
                          Productos
                        </div>
                        {(o.items || []).length === 0 ? (
                          <div className="text-sm text-ink-400">Sin detalle</div>
                        ) : (
                          <ul className="space-y-1 text-sm text-ink-700 dark:text-obsidian-200">
                            {o.items.map((it, i) => (
                              <li key={i} className="flex justify-between gap-2">
                                <span>
                                  <b className="tabular-nums">{it.quantity}×</b> {it.name_snapshot}
                                </span>
                                <span className="shrink-0 tabular-nums text-ink-500">
                                  {money(Number(it.unit_price) * Number(it.quantity))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const ColIcon = col.icon;
            const colOrders = byStatus(col.key);
            return (
              <div key={col.key} className={`${kanbanColumnClass(col.key)} max-h-[calc(100vh-12rem)] flex flex-col`}>
                <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                  <h3 className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                    <ColIcon size={16}/> {col.title}
                  </h3>
                  <span className={KANBAN_COUNT_PILL}>
                    {colOrders.length}
                  </span>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {colOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      turn={o.turn_number}
                      isNext={nextOrder && o.id === nextOrder.id}
                      onClick={() => {}}
                      onPreparing={(x) => setStatus(x.id, "preparing")}
                      onReady={(x) => setStatus(x.id, "ready_to_pay")}
                      onPay={(x) => setToPay(x)}
                      onCancel={(x) => setToCancel(x)}
                      onBackPending={(x) => setStatus(x.id, "pending")}
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <div className="py-6 text-center text-xs text-ink-500 dark:text-white/70">Sin pedidos</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openNew && <NewPickupModal onClose={() => setOpenNew(false)} onCreated={onCreated} />}
      {toPay && <PayModal order={toPay} onClose={() => setToPay(null)} onPaid={load} />}
      {toCancel && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50 mb-3">Cancelar pedido #{toCancel.id}</h2>
            <label className="label">Motivo</label>
            <input className="input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cliente se fue, error…" />
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
