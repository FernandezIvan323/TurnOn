import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { TableSkeleton } from "../../components/Skeleton";
import { toast } from "../../store/toast";
import { money, formatDate } from "../../lib/format";
import { Search, Phone, MapPin, StickyNote, Plus, Edit2, Users } from "lucide-react";

function CustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    neighborhood: customer?.neighborhood || "",
    reference: customer?.reference || "",
    notes: customer?.notes || "",
  });
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (customer) await api.put(`/customers/${customer.id}`, form);
      else await api.post("/customers", form);
      toast.success(customer ? "Cliente actualizado" : "Cliente creado");
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={customer ? "Editar cliente" : "Nuevo cliente"} size="lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Nombre</label>
          <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
        </div>
        <div className="col-span-2">
          <label className="label">Teléfono *</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="col-span-2">
          <label className="label">Dirección</label>
          <input className="input" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
        </div>
        <div>
          <label className="label">Colonia</label>
          <input className="input" value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})} />
        </div>
        <div>
          <label className="label">Referencia</label>
          <input className="input" value={form.reference} onChange={(e) => setForm({...form, reference: e.target.value})} />
        </div>
        <div className="col-span-2">
          <label className="label">Notas</label>
          <textarea rows={2} className="input" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
        </div>
      </div>
      {err && <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">{err}</div>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </Modal>
  );
}

function HistoryModal({ customer, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/customers/${customer.id}`).then((r) => { setData(r.data); setLoading(false); });
  }, [customer.id]);

  return (
    <Modal open onClose={onClose} title={customer.name} size="2xl">
      <div className="text-sm text-ink-500 dark:text-obsidian-400 space-y-1 mb-4">
        <div><Phone size={12} className="inline mr-1"/>{customer.phone}</div>
        {customer.address && <div><MapPin size={12} className="inline mr-1"/>{customer.address} {customer.neighborhood && `· ${customer.neighborhood}`}</div>}
        {customer.reference && <div><StickyNote size={12} className="inline mr-1"/>{customer.reference}</div>}
      </div>
      <h3 className="font-semibold text-ink-700 dark:text-obsidian-100 mb-2">Historial</h3>
      {loading ? <TableSkeleton rows={4} cols={2} className="!shadow-none" /> : (
        <div className="space-y-2">
          {data.orders.length === 0 && <div className="text-sm text-ink-400 dark:text-obsidian-500">Sin pedidos aún.</div>}
          {data.orders.map((o) => (
            <div key={o.id} className="card p-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-ink-800 dark:text-obsidian-50">Pedido #{o.id} · {o.type === "table" ? "Mesa" : o.type === "delivery" ? "Domicilio" : "Para llevar"}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400">{formatDate(o.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-ink-800 dark:text-obsidian-50">{money(o.total)}</div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400 capitalize">{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function Customers() {
  useDocumentTitle("Clientes");
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);

  const search = async (term) => {
    setLoading(true);
    const { data } = await api.get("/customers", { params: term ? { q: term } : {} });
    setList(data);
    setLoading(false);
  };
  useEffect(() => { search(""); }, []);

  return (
    <div>
      <Header
        title="Clientes"
        subtitle="Historial de clientes de domicilio"
        right={
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={16}/> Nuevo cliente
          </button>
        }
      />

      <div className="card p-3 mb-4 flex items-center gap-2">
        <Search size={16} className="text-ink-400 dark:text-obsidian-500"/>
        <input
          className="flex-1 bg-transparent outline-none text-sm text-ink-800 dark:text-obsidian-50 placeholder:text-ink-400 dark:placeholder:text-ink-500"
          placeholder="Buscar por teléfono o nombre…"
          value={q}
          onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : list.length === 0 ? (
        <EmptyState icon={Users} title="No hay clientes" description="Creá el primer cliente o buscá por teléfono." />
      ) : (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[28rem]">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-strong">{c.name}</td>
                    <td>{c.phone}</td>
                    <td className="cell-muted">{c.address || "—"}</td>
                    <td className="text-right">
                      <button onClick={() => setViewing(c)} className="btn-ghost text-xs">Historial</button>
                      <button onClick={() => setEditing(c)} className="btn-ghost text-xs" aria-label={`Editar ${c.name}`}><Edit2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {creating && <CustomerModal onClose={() => setCreating(false)} onSaved={() => search(q)} />}
      {editing && <CustomerModal customer={editing} onClose={() => setEditing(null)} onSaved={() => search(q)} />}
      {viewing && <HistoryModal customer={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
