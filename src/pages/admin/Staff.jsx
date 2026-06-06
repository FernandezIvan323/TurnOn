import { useEffect, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import { Plus, Edit2, Trash2, X, Bike, Utensils, Shield } from "lucide-react";

function Tabs({ value, onChange }) {
  const tabs = [
    { v: "delivery",  l: "Repartidores", icon: Bike },
    { v: "tables",    l: "Mesas",        icon: Utensils },
  ];
  return (
    <div className="flex gap-1 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl p-1">
      {tabs.map((t) => (
        <button
          key={t.v}
          onClick={() => onChange(t.v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
            value === t.v ? "bg-brand-600 text-white" : "text-ink-600 dark:text-ink-300 hover:bg-surface-100 dark:hover:bg-ink-800"
          }`}
        >
          <t.icon size={14}/> {t.l}
        </button>
      ))}
    </div>
  );
}

function DeliveryModal({ person, onClose, onSaved }) {
  const [name, setName] = useState(person?.name || "");
  const [phone, setPhone] = useState(person?.phone || "");
  const [status, setStatus] = useState(person?.status || "available");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      if (person) await api.put(`/delivery/${person.id}`, { name, phone, status });
      else await api.post("/delivery", { name, phone });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">{person ? "Editar" : "Nuevo"} repartidor</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <label className="label">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <label className="label mt-3">Teléfono</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {person && (
          <>
            <label className="label mt-3">Estado</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="available">Disponible</option>
              <option value="busy">Ocupado</option>
              <option value="offduty">Fuera de turno</option>
            </select>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

function TableModal({ table, onClose, onSaved }) {
  const [form, setForm] = useState({
    number: table?.number || "",
    label: table?.label || "",
    capacity: table?.capacity || 4,
    active: table?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      if (table) await api.put(`/tables/${table.id}`, { ...form, capacity: Number(form.capacity) });
      else await api.post("/tables", { ...form, capacity: Number(form.capacity) });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">{table ? "Editar" : "Nueva"} mesa</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <label className="label">Número / identificador</label>
        <input className="input" value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="1, 2, P1, B1…" />
        <label className="label mt-3">Etiqueta (opcional)</label>
        <input className="input" value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} placeholder="Patio 1, Barra 2…" />
        <label className="label mt-3">Capacidad</label>
        <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} />
        <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 mt-3">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} />
          Activa
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const { user } = useAuth();
  const [tab, setTab] = useState("delivery");
  const [delivery, setDelivery] = useState([]);
  const [tables, setTables] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const [d, t] = await Promise.all([api.get("/delivery"), api.get("/tables")]);
    setDelivery(d.data); setTables(t.data);
  };
  useEffect(() => { load(); }, []);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-ink-400">Esta sección es solo para el administrador.</div>;
  }

  return (
    <div>
      <Header
        title="Personal y mesas"
        subtitle="Gestión de repartidores y mesas"
        right={
          <div className="flex items-center gap-2">
            <Tabs value={tab} onChange={setTab} />
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus size={16}/> Nuevo
            </button>
          </div>
        }
      />

      {tab === "delivery" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {delivery.map((p) => (
                <tr key={p.id} className="border-t border-ink-100 dark:border-ink-800">
                  <td className="px-4 py-2 font-medium text-ink-800 dark:text-ink-100">{p.name}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-ink-300">{p.phone || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${
                      p.status === "available" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                      p.status === "busy" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                      "bg-slate-100 text-slate-600 dark:bg-ink-800 dark:text-ink-400"
                    }`}>
                      {p.status === "available" ? "Disponible" : p.status === "busy" ? "Ocupado" : "Fuera de turno"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing({ type: "delivery", value: p })} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                    <button onClick={async () => { if (confirm(`¿Eliminar a ${p.name}?`)) { await api.delete(`/delivery/${p.id}`); load(); } }} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {delivery.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-400 dark:text-ink-500">No hay repartidores. Crea uno con "Nuevo".</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tables" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">N°</th>
                <th className="px-4 py-2 font-medium">Etiqueta</th>
                <th className="px-4 py-2 font-medium">Capacidad</th>
                <th className="px-4 py-2 font-medium">Estado actual</th>
                <th className="px-4 py-2 font-medium w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id} className="border-t border-ink-100 dark:border-ink-800">
                  <td className="px-4 py-2 font-bold text-ink-800 dark:text-ink-100">{t.number}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-ink-300">{t.label || "—"}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-ink-300">{t.capacity}</td>
                  <td className="px-4 py-2">
                    {t.current_order_id ? <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Ocupada</span>
                                         : <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Libre</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing({ type: "table", value: t })} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                    <button onClick={async () => { if (confirm(`¿Eliminar mesa ${t.number}?`)) { await api.delete(`/tables/${t.id}`); load(); } }} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-400 dark:text-ink-500">No hay mesas. Crea una con "Nuevo".</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {creating && tab === "delivery" && <DeliveryModal onClose={() => setCreating(false)} onSaved={load} />}
      {creating && tab === "tables" && <TableModal onClose={() => setCreating(false)} onSaved={load} />}
      {editing?.type === "delivery" && <DeliveryModal person={editing.value} onClose={() => setEditing(null)} onSaved={load} />}
      {editing?.type === "table" && <TableModal table={editing.value} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
