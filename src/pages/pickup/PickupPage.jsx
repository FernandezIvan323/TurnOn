import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import {
  money, formatTime, statusLabels, statusColors,
  assignTurns, waitMinutes, waitLabel,
} from "../../lib/format";
import {
  ShoppingBag, Plus, X, Clock, CheckCircle2, ChefHat,
  ChevronRight, StickyNote, Trash2, ArrowRight, Timer,
  Banknote, CreditCard, Building2, Wallet, AlertTriangle, RotateCcw,
} from "lucide-react";

const COLUMNS = [
  { key: "pending",    title: "Pendientes",       tone: "bg-amber-50 border-amber-200 dark:bg-amber-900/60 dark:border-amber-700",   icon: Clock },
  { key: "preparing",  title: "En preparación",   tone: "bg-blue-50 border-blue-200 dark:bg-blue-900/60 dark:border-blue-700",     icon: ChefHat },
  { key: "ready_to_pay", title: "Listo para recoger", tone: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/60 dark:border-emerald-700", icon: CheckCircle2 },
];

const METHOD_LABELS = {
  cash:     { l: "Efectivo",      icon: Banknote },
  card:     { l: "Tarjeta",       icon: CreditCard },
  transfer: { l: "Transferencia", icon: Building2 },
};

const ESTIMATE_PRESETS = [5, 10, 15, 20, 30];

function TurnBadge({ turn, isNext }) {
  if (!turn) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
      isNext
        ? "bg-brand-600 text-white dark:bg-wine-500"
        : "bg-paper-200 text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-200"
    }`}>
      #{turn}
      {isNext && <span className="ml-0.5 text-[10px] font-normal opacity-80">SIGUIENTE</span>}
    </span>
  );
}

function WaitTimeBadge({ createdAt, estimateMin }) {
  const elapsed = waitMinutes(createdAt);
  if (estimateMin && elapsed > 0) {
    const remaining = Math.max(0, estimateMin - elapsed);
    if (remaining > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-300">
          <Timer size={11}/> ~{remaining}min restantes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
        <Timer size={11}/> Tiempo cumplido
      </span>
    );
  }
  return (
    <span className="text-[11px] text-ink-400 dark:text-obsidian-500">
      Esperando {waitLabel(createdAt)}
    </span>
  );
}

function OrderCard({ order, turn, isNext, onClick, onPreparing, onReady, onPay, onCancel, onBackPending }) {
  const elapsed = waitMinutes(order.created_at);
  const overEstimate = order.estimate_minutes && elapsed > order.estimate_minutes;

  return (
    <div
      onClick={onClick}
      className={`card p-3 cursor-pointer hover:shadow-pop transition ${
        isNext ? "ring-2 ring-brand-500 dark:ring-wine-400" : ""
      } ${overEstimate ? "ring-2 ring-amber-400 dark:ring-amber-500" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TurnBadge turn={turn} isNext={isNext} />
          <div>
            <div className="text-xs text-ink-400 dark:text-obsidian-500">
              #{order.id} · {formatTime(order.created_at)}
            </div>
            <div className="font-semibold text-ink-800 dark:text-obsidian-50">
              Pedido #{order.id}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-ink-800 dark:text-obsidian-50">{money(order.total)}</div>
          {order.payment_status === "paid" && (
            <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
              Pagado
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <WaitTimeBadge createdAt={order.created_at} estimateMin={order.estimate_minutes} />
      </div>

      {order.estimate_minutes > 0 && (
        <div className="mt-1 text-[11px] text-ink-400 dark:text-obsidian-500">
          Estimado: {order.estimate_minutes}min
        </div>
      )}

      {order.notes && (
        <div className="mt-1.5 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
          <StickyNote size={11}/> {order.notes}
        </div>
      )}

      <div className="mt-3 flex gap-1.5 flex-wrap">
        {order.status === "pending" && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPreparing(order); }}
              className="flex-1 h-8 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition"
            >
              <ChefHat size={14}/> Preparar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(order); }}
              className="btn-secondary text-xs h-8 px-2"
            >
              <Trash2 size={14}/>
            </button>
          </>
        )}
        {order.status === "preparing" && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onReady(order); }}
              className="flex-1 h-8 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition"
            >
              <CheckCircle2 size={14}/> Listo para recoger
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onBackPending(order); }}
              className="btn-secondary text-xs h-8 px-2"
              title="Volver a pendiente"
            >
              <ArrowRight size={14} className="rotate-180"/>
            </button>
          </>
        )}
        {order.status === "ready_to_pay" && (
          <button
            onClick={(e) => { e.stopPropagation(); onPay(order); }}
            className="flex-1 h-8 px-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition dark:bg-wine-600 dark:hover:bg-wine-700"
          >
            <CheckCircle2 size={14}/> Cobrar
          </button>
        )}
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
                    !selectedCat ? "bg-brand-600 text-white" : "bg-paper-200 text-ink-600 hover:bg-paper-300 dark:bg-obsidian-800 dark:text-obsidian-200 dark:hover:bg-obsidian-700"
                  }`}
                >
                  Todos
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id === selectedCat ? null : c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      selectedCat === c.id ? "bg-brand-600 text-white" : "bg-paper-200 text-ink-600 hover:bg-paper-300 dark:bg-obsidian-800 dark:text-obsidian-200 dark:hover:bg-obsidian-700"
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
                  className="card p-3 text-left hover:border-brand-400 dark:hover:border-brand-600 transition group"
                >
                  <div className="font-medium text-sm text-ink-800 dark:text-obsidian-50 group-hover:text-brand-700 dark:group-hover:text-wine-300 truncate">
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
                          ? "bg-brand-600 text-white border-brand-600"
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
                    ? "bg-brand-600 text-white border-brand-600"
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

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/orders", { params: { type: "pickup" } });
    setOrders(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

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
            <select className="input h-9 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="active">Activos</option>
              <option value="paid">Cobrados</option>
              <option value="cancelled">Cancelados</option>
              <option value="all">Todos</option>
            </select>
            <button onClick={() => setOpenNew(true)} className="btn-primary">
              <Plus size={16}/> Nuevo pedido
            </button>
          </div>
        }
      />

      {activeCount > 0 && filter === "active" && (
        <div className="mb-4 card p-3 bg-brand-50 border-brand-200 dark:bg-wine-900/20 dark:border-wine-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-brand-800 dark:text-wine-200">
            <ShoppingBag size={16}/>
            <span><b>{activeCount}</b> pedido{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""} en cola</span>
          </div>
          {nextOrder && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-wine-300">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-600 text-white dark:bg-wine-500">
                #{nextOrder.turn_number} SIGUIENTE
              </span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Cargando…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const ColIcon = col.icon;
            const colOrders = byStatus(col.key);
            return (
              <div key={col.key} className={`rounded-2xl border ${col.tone} p-3 min-h-[200px]`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-ink-800 dark:text-white flex items-center gap-2">
                    <ColIcon size={16}/> {col.title}
                  </h3>
                  <span className="text-xs text-ink-600 dark:text-obsidian-300 bg-paper-50 dark:bg-obsidian-800 px-2 py-0.5 rounded-full border border-paper-300 dark:border-obsidian-600">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      turn={o.turn_number}
                      isNext={nextOrder && o.id === nextOrder.id}
                      onClick={() => {}}
                      onPreparing={(o) => setStatus(o.id, "preparing")}
                      onReady={(o) => setStatus(o.id, "ready_to_pay")}
                      onPay={(o) => setToPay(o)}
                      onCancel={(o) => setToCancel(o)}
                      onBackPending={(o) => setStatus(o.id, "pending")}
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <div className="text-center text-xs text-ink-400 dark:text-obsidian-500 py-6">Sin pedidos</div>
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
