import { useEffect, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import { money } from "../../lib/format";
import { Plus, Edit2, Trash2, X, Tag, ShoppingBag } from "lucide-react";

function CategoryModal({ cat, onClose, onSaved }) {
  const [name, setName] = useState(cat?.name || "");
  const [position, setPosition] = useState(cat?.position || 0);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (cat) await api.put(`/categories/${cat.id}`, { name, position });
      else await api.post("/categories", { name, position });
      onSaved(); onClose();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">{cat ? "Editar" : "Nueva"} categoría</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <label className="label">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <label className="label mt-3">Posición (orden)</label>
        <input className="input" type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
        {err && <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">{err}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category_id: product?.category_id || categories[0]?.id || null,
    available: product?.available ?? true,
  });
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const payload = { ...form, price: Number(form.price), category_id: form.category_id || null };
      if (product) await api.put(`/products/${product.id}`, payload);
      else await api.post("/products", payload);
      onSaved(); onClose();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">{product ? "Editar" : "Nuevo"} producto</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <input className="input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Precio</label>
              <input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.category_id || ""} onChange={(e) => setForm({...form, category_id: e.target.value ? Number(e.target.value) : null})}>
                <option value="">— Sin categoría —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({...form, available: e.target.checked})} />
            Disponible para la venta
          </label>
        </div>
        {err && <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">{err}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [creatingCat, setCreatingCat] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [creatingProd, setCreatingProd] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([api.get("/products"), api.get("/categories")]);
    setProducts(p.data); setCategories(c.data);
  };
  useEffect(() => { load(); }, []);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-ink-400">Esta sección es solo para el administrador.</div>;
  }

  const grouped = categories.map((c) => ({ ...c, products: products.filter((p) => p.category_id === c.id) }));
  const noCat = products.filter((p) => !p.category_id);

  return (
    <div>
      <Header
        title="Menú (catálogo)"
        subtitle="Productos, categorías y precios"
        right={
          <div className="flex gap-2">
            <button onClick={() => setCreatingCat(true)} className="btn-secondary">
              <Tag size={16}/> Nueva categoría
            </button>
            <button onClick={() => setCreatingProd(true)} className="btn-primary">
              <Plus size={16}/> Nuevo producto
            </button>
          </div>
        }
      />

      <div className="space-y-4">
        {grouped.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-ink-800 dark:text-ink-100">{c.name}</h3>
                <span className="text-xs text-ink-400 dark:text-ink-500">({c.products.length})</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingCat(c)} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                <button onClick={async () => { if (confirm(`¿Eliminar categoría "${c.name}"?`)) { await api.delete(`/categories/${c.id}`); load(); } }} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
              </div>
            </div>
            {c.products.length === 0 ? (
              <div className="text-sm text-ink-400 dark:text-ink-500">Sin productos en esta categoría.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {c.products.map((p) => (
                  <div key={p.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink-800 dark:text-ink-100">{p.name}</div>
                      {p.description && <div className="text-xs text-ink-500 dark:text-ink-400">{p.description}</div>}
                      <div className="text-brand-700 dark:text-brand-300 font-semibold mt-1">{money(p.price)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!p.available && <span className="badge bg-slate-100 text-slate-500 dark:bg-ink-800 dark:text-ink-400">No disponible</span>}
                      <div className="flex gap-1">
                        <button onClick={() => setEditingProd(p)} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                        <button onClick={async () => { if (confirm(`¿Eliminar "${p.name}"?`)) { await api.delete(`/products/${p.id}`); load(); } }} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {noCat.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-3">Sin categoría</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {noCat.map((p) => (
                <div key={p.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ink-800 dark:text-ink-100">{p.name}</div>
                    <div className="text-brand-700 dark:text-brand-300 font-semibold">{money(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {categories.length === 0 && products.length === 0 && (
          <div className="card p-8 text-center text-ink-500 dark:text-ink-400">
            <ShoppingBag size={32} className="mx-auto text-ink-300 dark:text-ink-700 mb-2"/>
            Empieza creando una categoría y luego agregando productos.
          </div>
        )}
      </div>

      {creatingCat && <CategoryModal onClose={() => setCreatingCat(false)} onSaved={load} />}
      {editingCat && <CategoryModal cat={editingCat} onClose={() => setEditingCat(null)} onSaved={load} />}
      {creatingProd && <ProductModal categories={categories} onClose={() => setCreatingProd(false)} onSaved={load} />}
      {editingProd && <ProductModal product={editingProd} categories={categories} onClose={() => setEditingProd(null)} onSaved={load} />}
    </div>
  );
}
