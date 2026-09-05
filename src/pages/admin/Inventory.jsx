import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import SegmentedControl from "../../components/SegmentedControl";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../store/auth";
import { toast } from "../../store/toast";
import { Search, Plus, Minus, History, Package } from "lucide-react";
import { money } from "../../lib/format";

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

export default function Inventory() {
  useDocumentTitle("Inventario");
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [movements, setMovements] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/inventory");
    setProducts(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return products;
    const t = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(t) || (p.category_name || "").toLowerCase().includes(t));
  }, [products, search]);

  const lowStock = useMemo(() => products.filter((p) => p.low_stock), [products]);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el administrador.</div>;
  }

  return (
    <div>
      <Header
        title="Inventario / Stock"
        subtitle={lowStock.length > 0 ? `${lowStock.length} producto${lowStock.length === 1 ? "" : "s"} con stock bajo` : "Control de existencias"}
      />

      {lowStock.length > 0 && (
        <div className="mb-4 card p-4 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
          <div className="text-sm font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <Package size={16}/> Productos con stock bajo
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-medium">
                {p.name} ({p.stock} / {p.min_stock})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5 text-ink-400 dark:text-obsidian-500"/>
          <input className="input pl-8 text-sm" placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[32rem]">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Min.</th>
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
                      <div className="ml-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-paper-200 dark:bg-obsidian-800">
                        <div
                          className={`h-full rounded-full ${p.low_stock ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, ((Number(p.stock) || 0) / Math.max(1, (Number(p.min_stock) * 2) || 1)) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-right cell-muted tabular-nums">{p.min_stock}</td>
                    <td className="text-right">
                      <button onClick={() => setMovements(p)} className="btn-ghost text-xs" title="Historial" aria-label={`Historial de ${p.name}`}><History size={14}/></button>
                      <button onClick={() => setEditing(p)} className="btn-ghost text-xs" title="Ajustar stock" aria-label={`Ajustar stock de ${p.name}`}><Package size={14}/></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center cell-muted">Sin resultados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <StockModal product={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {movements && <MovementModal product={movements} onClose={() => setMovements(null)} />}
    </div>
  );
}
