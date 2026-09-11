import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import SegmentedControl from "../../components/SegmentedControl";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../store/auth";
import { toast } from "../../store/toast";
import { Search, Plus, Minus, History, Package, Soup, Trash2 } from "lucide-react";
import { money } from "../../lib/format";

function timeAgo(iso) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

function MovementModal({ product, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/inventory/movements", { params: { product_id: product.id } })
      .then((r) => setMovements(r.data))
      .finally(() => setLoading(false));
  }, [product.id]);
  return (
    <Modal open onClose={onClose} title={`Movimientos · ${product.name}`} size="xl">
      <div className="space-y-2">
        {loading && <TableSkeleton rows={4} cols={3} className="!shadow-none" />}
        {!loading && movements.length === 0 && <div className="text-sm text-ink-400 dark:text-obsidian-500">Sin movimientos registrados.</div>}
        {movements.map((m) => (
          <div key={m.id} className="flex items-center justify-between card p-3 text-sm">
            <div>
              <div className="font-medium text-ink-800 dark:text-obsidian-50 flex items-center gap-1.5">
                {m.type === "entry" ? <Plus size={14} className="text-emerald-600"/> :
                 m.type === "exit" ? <Minus size={14} className="text-rose-600"/> :
                 <Package size={14} className="text-amber-600"/>}
                {m.type === "entry" ? "Entrada" : m.type === "exit" ? "Salida" : "Ajuste"}
                <span className="font-bold">{m.quantity}</span>
              </div>
              <div className="text-xs text-ink-500 dark:text-obsidian-400">{m.reason || "Sin motivo"}</div>
            </div>
            <div className="text-xs text-ink-400 dark:text-obsidian-500">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function StockModal({ product, onClose, onSaved }) {
  const [type, setType] = useState("entry");
  const [quantity, setQuantity] = useState("");
  const [stock, setStock] = useState("");
  const [min_stock, setMinStock] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setStock(String(product.stock ?? ""));
    setMinStock(String(product.min_stock ?? ""));
  }, [product]);

  const submit = async () => {
    setErr(null); setSaving(true);
    try {
      if (type === "adjust") {
        await api.put(`/inventory/${product.id}`, { stock: Number(stock), min_stock: Number(min_stock) });
      } else {
        await api.post("/inventory/movement", {
          product_id: product.id,
          type,
          quantity: Number(quantity),
          reason: reason || null,
        });
      }
      toast.success("Stock actualizado");
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={product.name} size="md">
      <SegmentedControl
        className="mb-4"
        value={type}
        onChange={setType}
        options={[
          { value: "entry", label: "Entrada" },
          { value: "exit", label: "Salida" },
          { value: "adjust", label: "Ajustar" },
        ]}
      />
      {type === "adjust" ? (
        <>
          <label className="label">Stock actual</label>
          <input className="input" type="number" step="0.01" value={stock} onChange={(e) => setStock(e.target.value)} />
          <label className="label mt-3">Stock mínimo</label>
          <input className="input" type="number" step="0.01" value={min_stock} onChange={(e) => setMinStock(e.target.value)} />
        </>
      ) : (
        <>
          <label className="label">Cantidad</label>
          <input className="input" type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} autoFocus />
          <label className="label mt-3">Motivo (opcional)</label>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Compra, merma, ajuste…" />
        </>
      )}
      {err && <div className="mt-3 text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={submit} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </Modal>
  );
}

function InsumoModal({ insumo, onClose, onSaved, onDelete }) {
  const [name, setName] = useState(insumo?.name || "");
  const [unit, setUnit] = useState(insumo?.unit || "unidad");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStock(String(insumo?.stock ?? ""));
    setMinStock(String(insumo?.min_stock ?? "0"));
  }, [insumo]);

  const save = async () => {
    setSaving(true);
    try {
      if (insumo) {
        await api.put(`/inventory/insumos/${insumo.id}`, { name, unit, min_stock: Number(minStock) || 0 });
        // ajustar stock como 'adjust' con valor absoluto y luego aplicar ajuste
        const diff = (Number(stock) || 0) - (Number(insumo.stock) || 0);
        if (diff !== 0) {
          await api.post(`/inventory/insumos/${insumo.id}/ajuste`, { type: "adjust", quantity: Number(stock) || 0 });
        }
      } else {
        await api.post("/inventory/insumos", { name, unit, stock: Number(stock) || 0, min_stock: Number(minStock) || 0 });
      }
      toast.success("Insumo guardado");
      onSaved(); onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={insumo ? "Editar insumo" : "Nuevo insumo"} size="md">
      <label className="label">Nombre</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="label">Unidad</label>
          <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, L, oz, porción" />
        </div>
        <div>
          <label className="label">Stock mínimo</label>
          <input className="input" type="number" step="0.01" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
        </div>
      </div>
      <label className="label mt-3">Stock actual (registro de hoy)</label>
      <input className="input" type="number" step="0.01" value={stock} onChange={(e) => setStock(e.target.value)} />
      <div className="mt-4 flex justify-between gap-2">
        {insumo && onDelete && (
          <button onClick={onDelete} className="btn-danger"><Trash2 size={16} /> Eliminar</button>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </Modal>
  );
}

function RecetaModal({ product, onClose }) {
  const [insumos, setInsumos] = useState([]);
  const [receta, setReceta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [i, r] = await Promise.all([
      api.get("/inventory/insumos"),
      api.get(`/inventory/recetas/${product.id}`),
    ]);
    setInsumos(i.data);
    setReceta(r.data.map((x) => ({ insumo_id: x.insumo_id, quantity: String(x.quantity) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, [product.id]);

  const setQty = (insumoId, qty) => {
    setReceta((prev) => {
      const ex = prev.find((x) => x.insumo_id === insumoId);
      if (ex) return prev.map((x) => x.insumo_id === insumoId ? { ...x, quantity: qty } : x);
      return [...prev, { insumo_id: insumoId, quantity: qty }];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/inventory/recetas/${product.id}`, receta.map((x) => ({ insumo_id: x.insumo_id, quantity: Number(x.quantity) || 0 })));
      toast.success("Receta guardada");
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={`Receta · ${product.name}`} size="md">
      {loading ? (
        <TableSkeleton rows={4} cols={2} className="!shadow-none" />
      ) : (
        <div className="space-y-2">
          {insumos.length === 0 && (
            <div className="text-sm text-ink-400 dark:text-obsidian-500">
              No hay insumos creados. Crea primero en la pestaña "Insumos".
            </div>
          )}
          {insumos.map((i) => {
            const qty = receta.find((x) => x.insumo_id === i.id)?.quantity ?? "";
            return (
              <div key={i.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-ink-800 dark:text-obsidian-50">{i.name} ({i.unit})</span>
                <input
                  className="input w-24 text-right"
                  type="number" step="0.01" min="0"
                  value={qty}
                  onChange={(e) => setQty(i.id, e.target.value)}
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={save} disabled={saving || loading} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </Modal>
  );
}

export default function Inventory() {
  useDocumentTitle("Inventario");
  const { user } = useAuth();
  const [tab, setTab] = useState("productos");
  const [products, setProducts] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [movements, setMovements] = useState(null);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [creatingInsumo, setCreatingInsumo] = useState(false);
  const [recetaTarget, setRecetaTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, i] = await Promise.all([api.get("/inventory"), api.get("/inventory/insumos")]);
    setProducts(p.data);
    setInsumos(i.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    if (tab === "productos") {
      return products.filter((p) => p.name.toLowerCase().includes(t) || (p.category_name || "").toLowerCase().includes(t));
    }
    return insumos.filter((i) => i.name.toLowerCase().includes(t) || (i.unit || "").toLowerCase().includes(t));
  }, [tab, products, insumos, search]);

  const lowStockProducts = useMemo(() => products.filter((p) => p.low_stock), [products]);
  const lowInsumos = useMemo(() => insumos.filter((i) => Number(i.min_stock) > 0 && Number(i.stock) <= Number(i.min_stock)), [insumos]);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el administrador.</div>;
  }

  const deleteInsumo = async (id) => {
    await api.delete(`/inventory/insumos/${id}`);
    toast.success("Insumo eliminado");
    load();
  };

  return (
    <div>
      <Header
        title="Inventario / Stock"
        subtitle={lowStockProducts.length + lowInsumos.length > 0
          ? `${lowStockProducts.length} producto(s) y ${lowInsumos.length} insumo(s) con stock bajo`
          : "Control de existencias y materia prima"}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "productos", label: "Productos", icon: Package },
            { value: "insumos", label: "Insumos", icon: Soup },
          ]}
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-2.5 text-ink-400 dark:text-obsidian-500"/>
            <input className="input pl-8 text-sm" placeholder={`Buscar ${tab === "productos" ? "producto" : "insumo"}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {tab === "insumos" && (
            <button onClick={() => setCreatingInsumo(true)} className="btn-primary"><Plus size={16} /> Insumo</button>
          )}
        </div>
      </div>

      {tab === "insumos" && lowInsumos.length > 0 && (
        <div className="mb-4 card p-4 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
          <div className="text-sm font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <Soup size={16}/> Insumos por acabarse
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowInsumos.map((i) => (
              <span key={i.id} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-medium">
                {i.name}: quedan {i.stock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={tab === "productos" ? 6 : 4} />
      ) : (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            {tab === "productos" ? (
              <table className="data-table min-w-[40rem]">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Min.</th>
                    <th className="text-right">Últ. movimiento</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className={p.low_stock ? "!bg-rose-50/60 dark:!bg-rose-900/15" : undefined}>
                      <td className="cell-strong">{p.name}</td>
                      <td className="cell-muted">{p.category_name || "—"}</td>
                      <td className="text-right">
                        <div className={`font-semibold tabular-nums ${p.low_stock ? "text-rose-700 dark:text-rose-300" : "text-ink-800 dark:text-white"}`}>
                          {p.stock}
                        </div>
                      </td>
                      <td className="text-right cell-muted tabular-nums">{p.min_stock}</td>
                      <td className="text-right cell-muted">
                        {p.last_movement_at ? timeAgo(p.last_movement_at) : "—"}
                      </td>
                      <td className="text-right">
                        <button onClick={() => setRecetaTarget(p)} className="btn-ghost h-9 w-9 p-0" title="Receta (insumos)" aria-label={`Receta de ${p.name}`}><Soup size={17}/></button>
                        <button onClick={() => setMovements(p)} className="btn-ghost h-9 w-9 p-0" title="Historial" aria-label={`Historial de ${p.name}`}><History size={17}/></button>
                        <button onClick={() => setEditing(p)} className="btn-ghost h-9 w-9 p-0" title="Ajustar stock" aria-label={`Ajustar stock de ${p.name}`}><Package size={17}/></button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center cell-muted">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="data-table min-w-[40rem]">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th className="text-right">Unidad</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Min.</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id} className={i.low_stock ? "!bg-rose-50/60 dark:!bg-rose-900/15" : undefined}>
                      <td className="cell-strong">
                        {i.name}
                        {i.low_stock && (
                          <span className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Bajo</span>
                        )}
                      </td>
                      <td className="text-right cell-muted">{i.unit}</td>
                      <td className="text-right">
                        <span className={`font-semibold tabular-nums ${i.low_stock ? "text-rose-700 dark:text-rose-300" : "text-ink-800 dark:text-white"}`}>{i.stock}</span>
                      </td>
                      <td className="text-right cell-muted tabular-nums">{i.min_stock}</td>
                      <td className="text-right">
                        <button onClick={() => setEditingInsumo(i)} className="btn-ghost h-9 w-9 p-0" title="Editar insumo" aria-label={`Editar ${i.name}`}><Package size={17}/></button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center cell-muted">Sin insumos. Crea uno con "Insumo".</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {editing && <StockModal product={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {movements && <MovementModal product={movements} onClose={() => setMovements(null)} />}
      {recetaTarget && <RecetaModal product={recetaTarget} onClose={() => setRecetaTarget(null)} />}
      {creatingInsumo && <InsumoModal onClose={() => setCreatingInsumo(false)} onSaved={load} />}
      {editingInsumo && (
        <InsumoModal
          insumo={editingInsumo}
          onClose={() => setEditingInsumo(null)}
          onSaved={load}
          onDelete={() => { deleteInsumo(editingInsumo.id); setEditingInsumo(null); }}
        />
      )}
    </div>
  );
}