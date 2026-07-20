import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { useAuth } from "../../store/auth";
import { Plus, Edit2, Trash2, X, Bike, Utensils, UserCog, Check, PlusCircle, XCircle, UserPlus, Clock, KeyRound } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

function Tabs({ value, onChange }) {
  const tabs = [
    { v: "delivery",     l: "Repartidores", icon: Bike },
    { v: "waiters",      l: "Meseros",      icon: UserPlus },
    { v: "tables",       l: "Mesas",        icon: Utensils },
    { v: "assignments",  l: "Asignar",      icon: UserCog },
  ];
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-paper-300 bg-paper-50 p-1 dark:border-obsidian-700 dark:bg-obsidian-900">
      {tabs.map((t) => (
        <button
          key={t.v}
          type="button"
          onClick={() => onChange(t.v)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium sm:py-1.5 ${
            value === t.v ? "bg-wine-600 text-white" : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200 dark:hover:bg-obsidian-800"
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
  const [err, setErr] = useState(null);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (person) await api.put(`/delivery/${person.id}`, { name, phone, status });
      else await api.post("/delivery", { name, phone });
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">{person ? "Editar" : "Nuevo"} repartidor</h2>
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
        {err && (
          <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
            {err}
          </div>
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
  const [err, setErr] = useState(null);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (table) await api.put(`/tables/${table.id}`, { ...form, capacity: Number(form.capacity) });
      else await api.post("/tables", { ...form, capacity: Number(form.capacity) });
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">{table ? "Editar" : "Nueva"} mesa</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <label className="label">Número / identificador</label>
        <input className="input" value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="1, 2, P1, B1…" />
        <label className="label mt-3">Etiqueta (opcional)</label>
        <input className="input" value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} placeholder="Patio 1, Barra 2…" />
        <label className="label mt-3">Capacidad</label>
        <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} />
        <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-obsidian-200 mt-3">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} />
          Activa
        </label>
        {err && (
          <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
            {err}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

function AddTableModal({ waiter, availableTables, assignedTableIds, allTables, onClose, onAssigned }) {
  const [selected, setSelected] = useState(() => {
    const initial = new Set();
    assignedTableIds.forEach((id) => initial.add(id));
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const toggle = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await api.put(`/assignments/${waiter.user_id}`, { table_ids: Array.from(selected) });
      onAssigned(); onClose();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-lg p-5 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">Asignar mesas a {waiter.name}</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <p className="text-sm text-ink-500 dark:text-obsidian-400 mb-1">
          Toca las mesas para marcar/desmarcar. Las ya asignadas aparecen marcadas.
        </p>
        <p className="text-xs text-ink-400 dark:text-obsidian-500 mb-3">
          Mesas seleccionadas: <span className="font-semibold text-wine-600 dark:text-wine-400">{selected.size}</span>
        </p>
        {allTables.length === 0 ? (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
            No hay mesas disponibles para asignar (todas están asignadas a otros meseros).
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allTables.map((t) => {
              const on = selected.has(t.id);
              const isAssignedToOther = assignedTableIds.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    on
                      ? "border-wine-500 bg-wine-50 dark:bg-wine-900/30"
                      : "border-paper-300 dark:border-obsidian-700 hover:border-wine-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-ink-800 dark:text-obsidian-50">Mesa {t.number}</div>
                      {t.label && <div className="text-xs text-ink-500 dark:text-obsidian-400">{t.label}</div>}
                    </div>
                    {on
                      ? <Check size={16} className="text-wine-600 dark:text-wine-400"/>
                      : <PlusCircle size={16} className="text-ink-300 dark:text-obsidian-500"/>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {err && <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">{err}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving || allTables.length === 0} className="btn-primary">
            {saving ? "Guardando…" : `Guardar (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function WaiterModal({ onClose, onSaved }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await api.post("/auth/users", { username, name, pin, role: "waiter" });
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">Nuevo mesero</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <label className="label">Usuario</label>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} autoFocus autoComplete="off" />
        <label className="label mt-3">Nombre completo</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        <label className="label mt-3">PIN (4 dígitos)</label>
        <input className="input" type="password" maxLength={4} inputMode="numeric" pattern="[0-9]*" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} autoComplete="new-password" />
        {err && (
          <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
            {err}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving || !username || !name || pin.length !== 4} className="btn-primary">
            {saving ? "Guardando…" : "Crear mesero"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePinModal({ user, onClose, onSaved }) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (pin !== pin2) throw new Error("Los PIN no coinciden");
      await api.put(`/auth/users/${user.id}/pin`, { pin });
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">Cambiar PIN</h2>
          <button onClick={onClose} className="btn-ghost"><X size={18}/></button>
        </div>
        <p className="text-sm text-ink-500 dark:text-obsidian-400 mb-3">
          Usuario <span className="font-mono font-medium text-ink-700 dark:text-obsidian-100">@{user.username}</span>
          {" · "}{user.name}
        </p>
        <label className="label">Nuevo PIN (4 dígitos)</label>
        <input
          className="input"
          type="password"
          maxLength={4}
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          autoFocus
          autoComplete="new-password"
        />
        <label className="label mt-3">Confirmar PIN</label>
        <input
          className="input"
          type="password"
          maxLength={4}
          inputMode="numeric"
          value={pin2}
          onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
          autoComplete="new-password"
        />
        {err && (
          <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
            {err}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={save} disabled={saving || pin.length !== 4 || pin2.length !== 4} className="btn-primary">
            {saving ? "Guardando…" : "Actualizar PIN"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentsTab() {
  const [assignments, setAssignments] = useState([]);
  const [tables, setTables] = useState([]);
  const [toAdd, setToAdd] = useState(null);

  const load = async () => {
    const [a, t] = await Promise.all([api.get("/assignments"), api.get("/tables")]);
    setAssignments(a.data); setTables(t.data);
  };
  useEffect(() => { load(); }, []);

  const assignedTableIds = new Set();
  assignments.forEach((a) => a.tables.forEach((t) => assignedTableIds.add(t.id)));

  return (
    <div className="space-y-4">
      <div className="card p-4 text-sm text-ink-600 dark:text-obsidian-200">
        <p>Asigna mesas a cada mesero. Una mesa solo puede estar asignada a <b>un mesero a la vez</b>. Recomendado: 3-4 mesas por mesero.</p>
      </div>
      {assignments.length === 0 ? (
        <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">
          <UserCog size={32} className="mx-auto text-ink-300 dark:text-obsidian-300 mb-2"/>
          No hay meseros activos. Crea uno primero desde otro sistema o vía SQL.
        </div>
      ) : (
        assignments.map((w) => (
          <div key={w.user_id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-ink-800 dark:text-obsidian-50 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center font-semibold">
                    {w.user_name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  {w.user_name}
                </div>
                <div className="text-xs text-ink-500 dark:text-obsidian-400 ml-11">@{w.username}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-500 dark:text-obsidian-400">
                  {w.tables.length} mesa{w.tables.length === 1 ? "" : "s"}
                </span>
                <button onClick={() => setToAdd(w)} className="btn-secondary text-xs">
                  <Plus size={14}/> Agregar mesa
                </button>
              </div>
            </div>
            {w.tables.length === 0 ? (
              <div className="text-sm text-ink-400 dark:text-obsidian-500 italic ml-11">
                Sin mesas asignadas — el mesero no podrá tomar pedidos.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 ml-11">
                {w.tables.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-wine-100 text-wine-800 text-sm font-medium dark:bg-wine-900/40 dark:text-wine-300"
                  >
                    Mesa {t.number}{t.label ? ` · ${t.label}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      {toAdd && (
        <AddTableModal
          waiter={toAdd}
          allTables={tables.filter((t) => t.active && !assignedTableIds.has(t.id) || toAdd.tables.some((wt) => wt.id === t.id))}
          assignedTableIds={new Set(toAdd.tables.map((t) => t.id))}
          onClose={() => setToAdd(null)}
          onAssigned={load}
        />
      )}
    </div>
  );
}

function WaiterHistoryModal({ waiter, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("all"); // all | 7 | 30

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/reports/waiter-history?user_id=${waiter.id}`);
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.response?.data?.error || e.message || "No se pudo cargar");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [waiter.id]);

  const moneyFmt = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const filtered = useMemo(() => {
    if (range === "all") return orders;
    const days = Number(range);
    const cut = Date.now() - days * 86400000;
    return orders.filter((o) => new Date(o.created_at).getTime() >= cut);
  }, [orders, range]);

  const paid = filtered.filter((o) => o.payment_status === "paid");
  const totalVentas = paid.reduce((s, o) => s + Number(o.total), 0);
  const totalPropinas = paid.reduce((s, o) => s + Number(o.tip || 0), 0);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const o of filtered) {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const dayLabel = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="card flex max-h-[90vh] w-full max-w-2xl flex-col p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-paper-200 bg-white p-4 dark:border-obsidian-700 dark:bg-obsidian-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink-800 dark:text-obsidian-50">
                Historial · {waiter.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-lg bg-paper-100 px-2 py-1 text-xs font-medium dark:bg-obsidian-800">
                  {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
                </span>
                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Ventas {moneyFmt(totalVentas)}
                </span>
                <span className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
                  Propinas {moneyFmt(totalPropinas)}
                </span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn-ghost shrink-0">
              <X size={18} />
            </button>
          </div>
          <div className="mt-3 flex gap-1">
            {[
              { k: "all", l: "Todo" },
              { k: "7", l: "7 días" },
              { k: "30", l: "30 días" },
            ].map((r) => (
              <button
                key={r.k}
                type="button"
                onClick={() => setRange(r.k)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  range === r.k
                    ? "bg-wine-600 text-white"
                    : "bg-paper-100 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-200"
                }`}
              >
                {r.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-ink-400 dark:text-obsidian-500">Cargando…</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
              {error}
            </div>
          ) : byDay.length === 0 ? (
            <div className="py-8 text-center text-ink-400 dark:text-obsidian-500">
              No hay pedidos en este período.
              <div className="mt-1 text-xs">Asigná mesas en la pestaña Asignar para que tome pedidos.</div>
            </div>
          ) : (
            byDay.map(([day, dayOrders]) => (
              <div key={day}>
                <div className="sticky top-0 z-[1] mb-2 flex items-center justify-between gap-2 border-b border-paper-300 bg-paper-100 px-2 py-1.5 dark:border-obsidian-600 dark:bg-obsidian-800">
                  <span className="text-xs font-bold capitalize text-ink-900 dark:text-white">
                    {dayLabel(day)}
                  </span>
                  <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 dark:bg-obsidian-950 dark:text-obsidian-100">
                    {dayOrders.length} pedido{dayOrders.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {dayOrders.map((o) => (
                    <div
                      key={o.id}
                      className="overflow-hidden rounded-xl border border-paper-200 dark:border-obsidian-700"
                    >
                      <div className="flex items-center justify-between bg-paper-100 px-3 py-2 text-xs font-medium text-ink-800 dark:bg-obsidian-800 dark:text-white">
                        <span className="text-ink-800 dark:text-white">
                          {new Date(o.created_at).toLocaleTimeString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {o.type === "table"
                            ? `Mesa ${o.table_number || "?"}${o.table_label ? ` · ${o.table_label}` : ""}`
                            : o.type === "pickup"
                              ? "Para llevar"
                              : "Domicilio"}
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            o.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : o.payment_status === "debt"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {o.payment_status === "paid"
                            ? "Pagado"
                            : o.payment_status === "debt"
                              ? "Deuda"
                              : o.payment_status === "pending"
                                ? "Pendiente"
                                : o.payment_status}
                        </span>
                      </div>
                      <div className="space-y-1 px-3 py-2">
                        {(o.items || []).length > 0 && (
                          <div className="space-y-0.5 text-xs text-ink-600 dark:text-obsidian-200">
                            {o.items.map((item, i) => (
                              <div key={i} className="flex justify-between gap-2">
                                <span>
                                  {item.quantity}× {item.name_snapshot}
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {moneyFmt(item.unit_price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-paper-200 pt-1.5 text-sm dark:border-obsidian-700">
                          <span className="text-xs text-ink-500">
                            {o.payment_method === "cash"
                              ? "Efectivo"
                              : o.payment_method === "card"
                                ? "Tarjeta"
                                : o.payment_method === "transfer"
                                  ? "Transferencia"
                                  : o.payment_method || "—"}
                          </span>
                          <div className="text-right">
                            <span className="font-bold tabular-nums text-ink-800 dark:text-obsidian-50">
                              {moneyFmt(o.total)}
                            </span>
                            {Number(o.tip) > 0 && (
                              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                                +{moneyFmt(o.tip)} propina
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const { user } = useAuth();
  const [tab, setTab] = useState("delivery");
  const [delivery, setDelivery] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [tables, setTables] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [historyWaiter, setHistoryWaiter] = useState(null);
  const [pinUser, setPinUser] = useState(null);

  const load = async () => {
    const [d, w, t] = await Promise.all([api.get("/delivery"), api.get("/auth/users"), api.get("/tables")]);
    setDelivery(d.data); setWaiters(w.data.filter((u) => u.role === "waiter")); setTables(t.data);
  };
  useEffect(() => { load(); }, []);

  if (user?.role !== "admin") {
    return <div className="card p-8 text-center text-ink-500 dark:text-obsidian-400">Esta sección es solo para el administrador.</div>;
  }

  return (
    <div>
      <Header
        title="Personal y mesas"
        subtitle="Gestión de repartidores, mesas y asignaciones"
        right={
          <div className="flex items-center gap-2">
            <Tabs value={tab} onChange={setTab} />
            {tab !== "assignments" && (
              <button onClick={() => setCreating(true)} className="btn-primary">
                <Plus size={16}/> Nuevo
              </button>
            )}
          </div>
        }
      />

      {tab === "delivery" && (
        <div className="card overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[28rem] text-sm">
            <thead className="bg-paper-200 dark:bg-obsidian-800 text-ink-600 dark:text-obsidian-200 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {delivery.map((p) => (
                <tr key={p.id} className="border-t border-paper-200 dark:border-obsidian-800">
                  <td className="px-4 py-2 font-medium text-ink-800 dark:text-obsidian-50">{p.name}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-obsidian-200">{p.phone || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${
                      p.status === "available" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                      p.status === "busy" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                       "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}>
                      {p.status === "available" ? "Disponible" : p.status === "busy" ? "Ocupado" : "Fuera de turno"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing({ type: "delivery", value: p })} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                    <button onClick={() => setConfirmDelete({ type: "delivery", id: p.id, name: p.name })} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {delivery.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-400 dark:text-obsidian-500">No hay repartidores. Crea uno con "Nuevo".</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "waiters" && (
        <div className="card overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="bg-paper-200 dark:bg-obsidian-800 text-ink-600 dark:text-obsidian-200 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Usuario</th>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Mesas</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {waiters.map((w) => {
                const wTables = tables.filter((t) => Number(t.assigned_user_id) === Number(w.id));
                return (
                  <tr key={w.id} className="border-t border-paper-200 dark:border-obsidian-800">
                    <td className="px-4 py-2 font-mono text-ink-700 dark:text-obsidian-100">@{w.username}</td>
                    <td className="px-4 py-2 font-medium text-ink-800 dark:text-obsidian-50">{w.name}</td>
                    <td className="px-4 py-2">
                      {wTables.length === 0 ? (
                        <span className="text-xs italic text-ink-400 dark:text-obsidian-500">Sin mesas</span>
                      ) : (
                        <div
                          className="flex flex-wrap gap-1"
                          title={wTables.map((t) => `Mesa ${t.number}${t.label ? ` · ${t.label}` : ""}`).join(", ")}
                        >
                          {wTables.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center rounded-md border border-wine-200 bg-wine-100 px-2 py-0.5 text-xs font-semibold text-wine-900 dark:border-wine-600 dark:bg-wine-800 dark:text-wine-50"
                            >
                              Mesa {t.number}
                              {t.label ? ` · ${t.label}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`badge ${w.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-obsidian-800 dark:text-obsidian-400"}`}>
                        {w.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="space-x-1 px-4 py-2 text-right">
                      <button type="button" onClick={() => setPinUser(w)} className="btn-ghost text-xs" title="Cambiar PIN"><KeyRound size={14}/></button>
                      <button type="button" onClick={() => setHistoryWaiter(w)} className="btn-ghost text-xs" title="Ver historial"><Clock size={14}/></button>
                    </td>
                  </tr>
                );
              })}
              {waiters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-400 dark:text-obsidian-500">
                    No hay meseros. Crea uno con &quot;Nuevo&quot; en esta pestaña.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tables" && (
        <div className="card overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-paper-200 dark:bg-obsidian-800 text-ink-600 dark:text-obsidian-200 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">N°</th>
                <th className="px-4 py-2 font-medium">Etiqueta</th>
                <th className="px-4 py-2 font-medium">Capacidad</th>
                <th className="px-4 py-2 font-medium">Mesero</th>
                <th className="px-4 py-2 font-medium">Estado actual</th>
                <th className="px-4 py-2 font-medium w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id} className="border-t border-paper-200 dark:border-obsidian-800">
                  <td className="px-4 py-2 font-bold text-ink-800 dark:text-obsidian-50">{t.number}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-obsidian-200">{t.label || "—"}</td>
                  <td className="px-4 py-2 text-ink-600 dark:text-obsidian-200">{t.capacity}</td>
                  <td className="px-4 py-2">
                    {t.assigned_user_name ? (
                      <span className="text-sm font-medium text-wine-700 dark:text-wine-400">{t.assigned_user_name}</span>
                    ) : (
                      <span className="text-xs text-ink-400 dark:text-obsidian-500 italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {t.current_order_id ? <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Ocupada</span>
                                         : <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Libre</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing({ type: "table", value: t })} className="btn-ghost text-xs"><Edit2 size={14}/></button>
                    <button onClick={() => setConfirmDelete({ type: "table", id: t.id, name: `mesa ${t.number}` })} className="btn-ghost text-xs text-rose-600 dark:text-rose-400"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-ink-400 dark:text-obsidian-500">No hay mesas. Crea una con "Nuevo".</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "assignments" && <AssignmentsTab />}

      {creating && tab === "delivery" && <DeliveryModal onClose={() => setCreating(false)} onSaved={load} />}
      {creating && tab === "waiters" && <WaiterModal onClose={() => setCreating(false)} onSaved={load} />}
      {creating && tab === "tables" && <TableModal onClose={() => setCreating(false)} onSaved={load} />}
      {editing?.type === "delivery" && <DeliveryModal person={editing.value} onClose={() => setEditing(null)} onSaved={load} />}
      {editing?.type === "table" && <TableModal table={editing.value} onClose={() => setEditing(null)} onSaved={load} />}
      {pinUser && (
        <ChangePinModal
          user={pinUser}
          onClose={() => setPinUser(null)}
          onSaved={() => { setPinUser(null); }}
        />
      )}

      {confirmDelete?.type === "delivery" && (
        <ConfirmModal
          title="Eliminar repartidor"
          message={`¿Eliminar a ${confirmDelete.name}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={async () => { await api.delete(`/delivery/${confirmDelete.id}`); setConfirmDelete(null); load(); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmDelete?.type === "table" && (
        <ConfirmModal
          title="Eliminar mesa"
          message={`¿Eliminar ${confirmDelete.name}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={async () => { await api.delete(`/tables/${confirmDelete.id}`); setConfirmDelete(null); load(); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {historyWaiter && <WaiterHistoryModal waiter={historyWaiter} onClose={() => setHistoryWaiter(null)} />}
    </div>
  );
}
