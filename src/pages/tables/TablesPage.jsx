import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import { money, formatTime, statusLabels, statusColors } from "../../lib/format";
import { useLiveRefresh } from "../../lib/useLiveRefresh";
import {
  X, Minus, Plus, CheckCircle2, Receipt, Clock, ChefHat, ArrowLeft, Utensils, History, AlertTriangle,
} from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

/** Une filas del mismo producto+nota en una sola con cantidad sumada (evita 1x+1x en pantalla). */
function consolidateItems(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const map = new Map();
  for (const it of list) {
    const key = `${it.product_id ?? "x"}|${it.notes || ""}|${it.unit_price}|${it.name_snapshot || ""}`;
    const prev = map.get(key);
    if (prev) {
      map.set(key, {
        ...prev,
        quantity: Number(prev.quantity) + Number(it.quantity || 0),
        id: prev.id ?? it.id,
      });
    } else {
      map.set(key, { ...it, quantity: Number(it.quantity) || 0 });
    }
  }
  return Array.from(map.values());
}

function OrderModal({ table, onClose, onChanged, onGoCashier, isAdmin }) {
  const [orderId, setOrderId] = useState(table.current_order_id || null);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const addQueue = useRef(Promise.resolve());
  const productsLoaded = useRef(false);

  const applyItems = useCallback((list) => {
    setItems(consolidateItems(list || []));
  }, []);

  const refreshOrder = useCallback(async (id) => {
    if (!id) {
      setOrder(null);
      setItems([]);
      return;
    }
    const o = await api.get(`/orders/${id}`);
    setOrder(o.data);
    applyItems(o.data.items || []);
    setOrderId(o.data.id);
  }, [applyItems]);

  // Carga inicial: productos 1 vez + pedido si ya hay
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitialLoading(true);
      setError(null);
      try {
        if (!productsLoaded.current) {
          const ps = await api.get("/products");
          if (!cancelled) {
            setProducts(ps.data.filter((p) => p.available));
            productsLoaded.current = true;
          }
        }
        const id = table.current_order_id || null;
        if (id) {
          const o = await api.get(`/orders/${id}`);
          if (!cancelled) {
            setOrder(o.data);
            applyItems(o.data.items || []);
            setOrderId(o.data.id);
          }
        } else if (!cancelled) {
          setOrder(null);
          setItems([]);
          setOrderId(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || e.message);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [table.id, table.current_order_id, applyItems]);

  // Mientras el modal está abierto: pedido en vivo (otro dispositivo agrega/cobra)
  useLiveRefresh(
    useCallback(async () => {
      if (busy) return;
      const id = orderId || table.current_order_id;
      if (!id) return;
      try {
        await refreshOrder(id);
      } catch {
        /* ignore */
      }
    }, [busy, orderId, table.current_order_id, refreshOrder]),
    { intervalMs: 3500 }
  );

  /** Si la mesa ya tiene pedido (409), recuperar id y seguir */
  const resolveOpenOrderId = async () => {
    const { data: tables } = await api.get("/tables");
    const t = tables.find((x) => x.id === table.id);
    return t?.current_order_id || null;
  };

  /** Suma 1 en pantalla al instante (misma línea = 2x, no otra fila 1x). */
  const bumpLocalQty = (productId) => {
    const p = products.find((x) => x.id === productId);
    setItems((prev) => {
      const list = consolidateItems(prev);
      const idx = list.findIndex(
        (x) => Number(x.product_id) === Number(productId) && !x.notes
      );
      if (idx >= 0) {
        const next = [...list];
        next[idx] = {
          ...next[idx],
          quantity: Number(next[idx].quantity || 0) + 1,
        };
        return next;
      }
      return [
        ...list,
        {
          id: `tmp-${productId}-${Date.now()}`,
          product_id: productId,
          name_snapshot: p?.name || "…",
          unit_price: p?.price ?? 0,
          quantity: 1,
          notes: null,
          status: "pending",
        },
      ];
    });
  };

  const createOrder = async (productId) => {
    setError(null);
    setBusy(true);
    bumpLocalQty(productId);
    try {
      const { data } = await api.post("/orders", {
        type: "table",
        table_id: table.id,
        items: [{ product_id: productId, quantity: 1 }],
      });
      await refreshOrder(data.id);
      onChanged?.();
    } catch (e) {
      if (e.response?.status === 409) {
        try {
          const openId = await resolveOpenOrderId();
          if (openId) {
            const { data: added } = await api.post(`/orders/${openId}/items`, {
              product_id: productId,
              quantity: 1,
            });
            if (added?.items) {
              setOrderId(openId);
              applyItems(added.items);
              setOrder((o) => (o ? { ...o, total: added.total } : o));
            } else {
              await refreshOrder(openId);
            }
            onChanged?.();
            return;
          }
        } catch (e2) {
          setError(e2.response?.data?.error || e2.message);
          await refreshOrder(orderId);
          return;
        }
      }
      setError(e.response?.data?.error || e.message);
      await refreshOrder(orderId);
    } finally {
      setBusy(false);
    }
  };

  const addItem = (productId) => {
    if (!orderId) return createOrder(productId);
    // Cola: doble toque no se pierde y siempre suma cantidad en la misma línea
    bumpLocalQty(productId);
    setError(null);
    setBusy(true);
    addQueue.current = addQueue.current
      .then(async () => {
        try {
          const { data } = await api.post(`/orders/${orderId}/items`, {
            product_id: productId,
            quantity: 1,
          });
          if (data?.items) {
            applyItems(data.items);
            setOrder((o) => (o ? { ...o, total: data.total } : o));
          } else {
            await refreshOrder(orderId);
          }
          onChanged?.();
        } catch (e) {
          setError(e.response?.data?.error || e.message);
          await refreshOrder(orderId);
        }
      })
      .finally(() => setBusy(false));
  };

  const removeItem = async (itemId) => {
    if (!orderId) return;
    setError(null);
    setBusy(true);
    try {
      await api.delete(`/orders/${orderId}/items/${itemId}`);
      await refreshOrder(orderId);
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status) => {
    if (!orderId) return;
    setError(null);
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/status`, { status });
      await refreshOrder(orderId);
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const markDebt = async () => {
    if (!orderId) return;
    setError(null);
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/mark-delivered`);
      await refreshOrder(orderId);
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const total = items.reduce(
    (s, x) => s + Number(x.unit_price) * x.quantity,
    0
  );

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
        <div className="card p-8 text-ink-500 dark:text-obsidian-400">
          Cargando mesa…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <div className="card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-paper-300 px-4 py-3 dark:border-obsidian-800 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink-900 dark:text-white sm:text-lg">
              {table.label || `Mesa ${table.number}`}
              <span className="ml-2 text-sm font-normal text-ink-500 dark:text-obsidian-400">
                (cap. {table.capacity})
              </span>
            </h2>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">
              Mesero:{" "}
              <span className="font-medium text-ink-700 dark:text-obsidian-200">
                {table.assigned_user_name || "Sin asignar"}
              </span>
              {order && (
                <>
                  {" "}
                  · Pedido #{order.id} · abierto {formatTime(order.created_at)} · hace{" "}
                  {timeAgo(order.created_at)}
                </>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost shrink-0">
            <X size={18} />
          </button>
        </div>

        {order && order.status === "ready_to_pay" && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-900/20 sm:px-5">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <Receipt size={14} />
              {isAdmin
                ? "Cuenta lista para cobrar"
                : "Lista para cobrar — avisá al cajero"}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onGoCashier(order)}
                  className="btn-primary h-8 text-xs"
                >
                  <CheckCircle2 size={14} /> Cobrar
                </button>
                <button
                  type="button"
                  onClick={markDebt}
                  disabled={busy}
                  className="btn-secondary h-8 border-rose-300 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/20"
                >
                  <AlertTriangle size={14} /> Deuda
                </button>
              </div>
            )}
          </div>
        )}

        {!order ? (
          isAdmin ? (
            <div className="overflow-y-auto p-4 sm:p-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  Mesa libre
                </div>
                <p className="mt-2 text-sm text-ink-600 dark:text-obsidian-200">
                  El cajero no abre mesas ni toma pedidos. Solo el mesero asignado puede
                  abrir la cuenta desde su celular.
                </p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-ink-500 dark:text-obsidian-400">Nombre</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">
                      {table.label || `Mesa ${table.number}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500 dark:text-obsidian-400">Número</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">{table.number}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500 dark:text-obsidian-400">Capacidad</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">
                      {table.capacity} personas
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500 dark:text-obsidian-400">Mesero asignado</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">
                      {table.assigned_user_name || "Sin asignar"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500 dark:text-obsidian-400">Estado</dt>
                    <dd className="font-semibold text-emerald-700 dark:text-emerald-300">Libre</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto p-4 sm:p-5">
              <p className="mb-3 text-sm text-ink-600 dark:text-white">
                Mesa libre. Tocá el primer producto para abrir la cuenta.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={busy}
                    onClick={() => createOrder(p.id)}
                    className="card p-3 text-left transition hover:border-wine-400 disabled:opacity-60 dark:hover:border-wine-500"
                  >
                    <div className="text-xs text-ink-400 dark:text-obsidian-500">
                      {p.category_name || "—"}
                    </div>
                    <div className="text-sm font-medium text-ink-900 dark:text-white">
                      {p.name}
                    </div>
                    <div className="mt-1 font-semibold text-wine-600 dark:text-wine-300">
                      {money(p.price)}
                    </div>
                  </button>
                ))}
              </div>
              {error && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                  {error}
                </div>
              )}
            </div>
          )
        ) : (
          <div
            className={`grid flex-1 grid-cols-1 overflow-hidden ${
              isAdmin ? "" : "md:grid-cols-2"
            }`}
          >
            <div
              className={`overflow-y-auto p-4 sm:p-5 ${
                isAdmin
                  ? ""
                  : "border-b border-paper-300 dark:border-obsidian-800 md:border-b-0 md:border-r"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink-800 dark:text-white">Cuenta</h3>
                <span className={`badge ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              {items.length === 0 && (
                <div className="text-sm text-ink-500 dark:text-obsidian-400">
                  {isAdmin ? "Sin productos aún" : "Sin productos — agregá del menú"}
                </div>
              )}
              <div className="space-y-1.5">
                {items.map((it) => (
                  <div
                    key={`${it.product_id}-${it.notes || ""}-${it.id}`}
                    className="flex items-center gap-2 border-b border-paper-200 py-1.5 text-sm dark:border-obsidian-800"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink-900 dark:text-white">
                        {it.name_snapshot}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-obsidian-400">
                        {money(it.unit_price)} c/u
                      </div>
                    </div>
                    {!isAdmin && order.status !== "ready_to_pay" ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={busy || String(it.id).startsWith("tmp-")}
                          onClick={() => removeItem(it.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 disabled:opacity-50 dark:bg-rose-900/30 dark:text-rose-300"
                          aria-label="Quitar uno"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[2.25rem] text-center text-base font-bold tabular-nums text-ink-900 dark:text-white">
                          {it.quantity}×
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => addItem(it.product_id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-50 text-wine-700 disabled:opacity-50 dark:bg-wine-900/30 dark:text-wine-300"
                          aria-label="Agregar uno"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="font-semibold tabular-nums">{it.quantity}×</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-paper-200 pt-3 dark:border-obsidian-800">
                <span className="text-ink-500 dark:text-obsidian-400">Total</span>
                <span className="text-2xl font-bold text-ink-900 dark:text-white">
                  {money(total)}
                </span>
              </div>
            </div>
            {!isAdmin && (
              <div className="overflow-y-auto bg-paper-200/40 p-4 dark:bg-obsidian-950 sm:p-5">
                <h3 className="mb-3 font-semibold text-ink-800 dark:text-white">
                  {order.status === "ready_to_pay"
                    ? "Cuenta cerrada para cocina"
                    : "Agregar del menú"}
                </h3>
                {order.status === "ready_to_pay" ? (
                  <p className="text-sm text-ink-600 dark:text-white">
                    Ya no se agregan productos. El cajero cobra desde Caja.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={busy}
                        onClick={() => addItem(p.id)}
                        className="card p-3 text-left transition hover:border-wine-400 disabled:opacity-60 dark:hover:border-wine-500"
                      >
                        <div className="text-xs text-ink-400 dark:text-obsidian-500">
                          {p.category_name || "—"}
                        </div>
                        <div className="text-sm font-medium text-ink-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="mt-1 font-semibold text-wine-600 dark:text-wine-300">
                          {money(p.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isAdmin && order.status !== "ready_to_pay" && (
              <div className="border-t border-paper-300 bg-paper-200/40 px-4 py-3 text-sm text-ink-600 dark:border-obsidian-800 dark:bg-obsidian-950 dark:text-obsidian-200 sm:px-5">
                Solo el mesero gestiona productos y cocina. Cuando la cuenta esté lista para
                cobrar, podés cobrar desde aquí o desde Caja.
              </div>
            )}
          </div>
        )}

        {order && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-paper-300 px-4 py-3 dark:border-obsidian-800 sm:px-5">
            {!isAdmin && order.status === "pending" && (
              <>
                <span className="mr-auto text-xs text-ink-600 dark:text-white">
                  Cuando termines de anotar, enviá a cocina y avisá lo pedido.
                </span>
                <button
                  type="button"
                  disabled={busy || items.length === 0}
                  onClick={() => setStatus("preparing")}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <ChefHat size={14} /> Enviar a cocina
                </button>
              </>
            )}
            {!isAdmin && order.status === "preparing" && (
              <>
                <span className="mr-auto text-xs text-ink-600 dark:text-white">
                  Cocina prepara. Cuando lleves el pedido, marcá listo para cobrar.
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("pending")}
                  className="btn-secondary text-xs"
                  title="Seguir agregando productos"
                >
                  <ArrowLeft size={12} /> Seguir pidiendo
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("ready_to_pay")}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  <Receipt size={14} /> Lista para cobrar
                </button>
              </>
            )}
            {order.status === "ready_to_pay" && (
              <span className="mr-auto text-xs text-ink-600 dark:text-white">
                {isAdmin
                  ? "Cobrá desde Caja o con el botón de arriba."
                  : "El cajero cobra esta cuenta — no hace falta que el cajero marque cocina."}
              </span>
            )}
            <button type="button" onClick={onClose} className="btn-secondary">
              Cerrar
            </button>
          </div>
        )}
        {error && order && (
          <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300 sm:px-5">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function TableHistoryModal({ onClose }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tables").then((r) => setTables(r.data));
  }, []);

  const loadHistory = async (t) => {
    setSelectedTable(t);
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/table-history/${t.id}`);
      setHistory(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="card flex max-h-[90vh] w-full max-w-2xl flex-col">
        <div className="flex items-center justify-between border-b border-paper-300 px-5 py-4 dark:border-obsidian-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900 dark:text-white">
            <History size={18} /> Historial de mesas
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadHistory(t)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  selectedTable?.id === t.id
                    ? "border-wine-500 bg-wine-600 text-white"
                    : "border-paper-300 bg-white text-ink-600 hover:bg-paper-200 dark:border-obsidian-700 dark:bg-obsidian-900 dark:text-obsidian-200"
                }`}
              >
                Mesa {t.number}
              </button>
            ))}
          </div>
          {!selectedTable && (
            <div className="py-8 text-center text-sm text-ink-500">
              Seleccioná una mesa
            </div>
          )}
          {loading && (
            <div className="text-sm text-ink-500">Cargando…</div>
          )}
          {selectedTable && !loading && history.length === 0 && (
            <div className="py-8 text-center text-sm text-ink-500">
              Mesa {selectedTable.number} sin pedidos previos.
            </div>
          )}
          {selectedTable && !loading && history.length > 0 && (
            <div className="space-y-2">
              {history.map((o) => (
                <div
                  key={o.id}
                  className="card flex items-center justify-between p-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-ink-900 dark:text-white">
                      #{o.id}
                    </div>
                    <div className="text-xs text-ink-500">
                      {o.user_name && `por ${o.user_name}`} ·{" "}
                      {o.closed_at
                        ? new Date(o.closed_at).toLocaleDateString()
                        : new Date(o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{money(o.total)}</div>
                    <span
                      className={`badge text-[10px] ${statusColors[o.status]}`}
                    >
                      {statusLabels[o.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TablesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const firstLoad = useRef(true);
  const openHandledId = useRef(null);

  const load = useCallback(async (opts = { silent: false }) => {
    if (!opts.silent && firstLoad.current) setLoading(true);
    try {
      const { data } = await api.get("/tables");
      setTables(data);
      // Si hay modal abierto, refrescar la mesa seleccionada sin cerrar
      setSelected((prev) => {
        if (!prev) return prev;
        const updated = data.find((t) => t.id === prev.id);
        return updated ? { ...prev, ...updated } : prev;
      });
      return data;
    } catch {
      return null;
    } finally {
      if (firstLoad.current) {
        firstLoad.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load({ silent: false });
  }, [load]);

  // Actualización en vivo entre PC y celulares (~3.5s + al volver a la pestaña)
  useLiveRefresh(load, { intervalMs: 3500 });

  // Desde dashboard del mesero: /tables?open=ID → abrir esa mesa al toque
  useEffect(() => {
    const openId = Number(searchParams.get("open"));
    if (!openId || tables.length === 0) return;
    if (openHandledId.current === openId) return;
    const t = tables.find((x) => x.id === openId);
    if (t) {
      openHandledId.current = openId;
      setSelected(t);
      // limpiar query para que atrás/cerrar no reabra
      setSearchParams({}, { replace: true });
    }
  }, [tables, searchParams, setSearchParams]);

  const isAdmin = user?.role === "admin";

  /** Waiter: turn order among occupied, then free. Admin: flat list only used as fallback. */
  const sortedTables = useMemo(() => {
    const occupied = tables.filter((t) => t.current_order_id);
    const free = tables.filter((t) => !t.current_order_id);
    occupied.sort(
      (a, b) =>
        new Date(a.current_order_created) - new Date(b.current_order_created)
    );
    const withTurns = occupied.map((t, i) => ({ ...t, _turn: i + 1 }));
    return [...withTurns, ...free];
  }, [tables]);

  /** Admin board: sections by assigned waiter, tables by number within section. */
  const waiterGroups = useMemo(() => {
    if (!isAdmin) return null;
    const map = new Map();
    for (const t of tables) {
      const key = t.assigned_user_id != null ? String(t.assigned_user_id) : "none";
      if (!map.has(key)) {
        map.set(key, {
          key,
          userId: t.assigned_user_id ?? null,
          name: t.assigned_user_name || "Sin asignar",
          tables: [],
        });
      }
      map.get(key).tables.push(t);
    }
    for (const g of map.values()) {
      g.tables.sort((a, b) => Number(a.number) - Number(b.number));
    }
    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      if (a.key === "none") return 1;
      if (b.key === "none") return -1;
      return a.name.localeCompare(b.name, "es");
    });
    return groups;
  }, [tables, isAdmin]);

  const nextTable = useMemo(
    () => sortedTables.find((t) => t._turn),
    [sortedTables]
  );

  const renderTableCard = (t) => {
    const occ = !!t.current_order_id;
    const status = t.current_order_status;
    const readyToPay = status === "ready_to_pay";
    const preparing = status === "preparing";
    const pending = status === "pending";
    const isNext = !isAdmin && nextTable && t.id === nextTable.id;
    let cardClass =
      "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20";
    let dotClass = "bg-emerald-500";
    if (readyToPay) {
      cardClass =
        "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20";
      dotClass = "bg-amber-500";
    } else if (preparing) {
      cardClass =
        "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20";
      dotClass = "bg-blue-500";
    } else if (pending) {
      cardClass =
        "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20";
      dotClass = "bg-rose-500";
    }
    if (isNext) {
      cardClass =
        "border-wine-500 bg-wine-50 dark:border-wine-400 dark:bg-wine-900/20";
      dotClass = "bg-wine-500";
    }
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => setSelected(t)}
        className={`card border-2 p-4 text-left transition hover:shadow-pop ${cardClass}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              {t._turn && (
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isNext
                      ? "bg-wine-600 text-white"
                      : "bg-paper-200 text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-200"
                  }`}
                >
                  #{t._turn}
                </span>
              )}
              <div className="text-xs text-ink-500">Mesa</div>
            </div>
            <div className="text-2xl font-bold text-ink-900 dark:text-white">
              {t.number}
            </div>
            {t.label && <div className="text-xs text-ink-500">{t.label}</div>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`h-3 w-3 rounded-full ${dotClass}`} />
            {isNext && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-wine-600 dark:text-wine-300">
                SIGUIENTE
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-ink-500">Capacidad: {t.capacity}</div>
        <div className="mt-1 truncate text-[11px] font-medium text-ink-600 dark:text-obsidian-300">
          {t.assigned_user_name || "Sin mesero"}
        </div>

        {occ ? (
          <div className="mt-2 space-y-1 border-t border-paper-300/50 pt-2 dark:border-obsidian-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">{t.current_order_items} productos</span>
              <span className="font-bold text-ink-900 dark:text-white">
                {money(t.current_order_total)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-ink-500">
              <Clock size={10} /> {timeAgo(t.current_order_created)}
            </div>
            {readyToPay ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                <Receipt size={10} /> Lista para cobrar
              </div>
            ) : preparing ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                <ChefHat size={10} /> En cocina
              </div>
            ) : (
              <div className="text-[11px] text-rose-700 dark:text-rose-300">
                Tomando pedido
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Libre
          </div>
        )}
      </button>
    );
  };

  return (
    <div>
      <Header
        title={user?.role === "waiter" ? "Mis mesas" : "Mesas"}
        subtitle={
          user?.role === "waiter"
            ? "Abrí la mesa, pedí, enviá a cocina y cobrá con el cajero"
            : "Por mesero — solo el mesero abre mesas; cajero cobra en Caja"
        }
        right={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="btn-secondary h-9"
            >
              <History size={16} /> Historial
            </button>
          ) : null
        }
      />

      {user?.role === "waiter" && tables.length === 0 && !loading && (
        <div className="card border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
          <Utensils size={32} className="mx-auto mb-2 text-amber-500" />
          <div className="font-semibold text-ink-900 dark:text-white">
            No tienes mesas asignadas
          </div>
          <p className="mt-1 text-sm text-ink-600 dark:text-white">
            Pedile al cajero que te asigne mesas en <b>Personal → Asignaciones</b>.
          </p>
        </div>
      )}

      {loading && tables.length === 0 ? (
        <div className="text-sm text-ink-500">Cargando mesas…</div>
      ) : isAdmin && waiterGroups ? (
        <div className="space-y-6">
          {waiterGroups.map((g) => (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-2 border-b border-paper-300 pb-2 dark:border-obsidian-800">
                <Utensils size={16} className="text-wine-600 dark:text-wine-300" />
                <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                  {g.name}
                </h3>
                <span className="text-xs text-ink-500 dark:text-obsidian-400">
                  {g.tables.length} mesa{g.tables.length === 1 ? "" : "s"}
                  {" · "}
                  {g.tables.filter((t) => t.current_order_id).length} ocupada
                  {g.tables.filter((t) => t.current_order_id).length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {g.tables.map(renderTableCard)}
              </div>
            </section>
          ))}
          {waiterGroups.length === 0 && (
            <div className="text-sm text-ink-500">No hay mesas configuradas.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedTables.map(renderTableCard)}
        </div>
      )}

      {selected && (
        <OrderModal
          table={selected}
          isAdmin={isAdmin}
          onClose={() => {
            setSelected(null);
            load({ silent: true });
          }}
          onChanged={() => load({ silent: true })}
          onGoCashier={() => {
            setSelected(null);
            nav("/cashier");
          }}
        />
      )}
      {showHistory && (
        <TableHistoryModal onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
