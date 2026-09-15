import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import OrderCard from "../../components/OrderCard";
import OrderDetailModal from "../../components/OrderDetailModal";
import SegmentedControl from "../../components/SegmentedControl";
import { useAuth } from "../../store/auth";
import { toast } from "../../store/toast";
import { money } from "../../lib/format";
import { Plus, Edit2, Trash2, X, Bike, Utensils, UserCog, Check, PlusCircle, XCircle, UserPlus, Clock, KeyRound, CalendarDays, ChevronRight, ArrowLeft } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

function StaffTabs({ value, onChange }) {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={[
        { value: "delivery",    label: "Repartidores", icon: Bike },
        { value: "waiters",     label: "Meseros",      icon: UserPlus },
        { value: "tables",      label: "Mesas",        icon: Utensils },
      ]}
    />
  );
}

/**
 * Modal de gestión de acceso al sistema (mesero o repartidor).
 * Primero muestra la información del empleado y el estado de acceso actual;
 * ya dentro, permite crear acceso, cambiar el PIN o quitar el acceso.
 * person: mesero → { id(user), username, name, active }
 *         repartidor → { id(delivery), user_id, username, login_active, name }
 */
function AccessManageModal({ person, role, onClose, onSaved }) {
  const isDelivery = role === "delivery";
  const accountId = isDelivery ? person.user_id : person.id;
  const isActive = isDelivery ? person.login_active : person.active;
  const hasAccess = accountId != null && isActive !== false;
  const roleLabel = isDelivery ? "Repartidor" : "Mesero";

  const [mode, setMode] = useState("info"); // info | grant | pin
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const resetKeys = () => { setUsername(""); setPin(""); setConfirm(""); setErr(null); };

  const validPin = /^\d{4}$/.test(pin);

  const createAccess = async () => {
    setErr(null);
    if (!/^\d{4}$/.test(pin)) return setErr("El PIN debe ser 4 dígitos");
    if (pin !== confirm) return setErr("Los PIN no coinciden");
    setSaving(true);
    try {
      if (isDelivery) {
        if (!username.trim()) { setErr("Ingresá un usuario"); setSaving(false); return; }
        await api.post("/auth/users", {
          username: username.trim(),
          name: person.name, pin, role: "delivery", delivery_person_id: person.id,
        });
      } else {
        await api.put(`/auth/users/${accountId}/pin`, { pin });
        await api.put(`/auth/users/${accountId}/active`, { active: true });
      }
      toast.success(`Acceso habilitado para ${person.name}`);
      onSaved(); onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  const changePin = async () => {
    setErr(null);
    if (!/^\d{4}$/.test(pin)) return setErr("El PIN debe ser 4 dígitos");
    if (pin !== confirm) return setErr("Los PIN no coinciden");
    setSaving(true);
    try {
      await api.put(`/auth/users/${accountId}/pin`, { pin });
      toast.success(`PIN actualizado para ${person.name}`);
      onSaved(); onClose();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const revokeAccess = async () => {
    setSaving(true); setErr(null);
    try {
      await api.put(`/auth/users/${accountId}/active`, { active: false });
      toast.success(`Acceso desactivado para ${person.name}`);
      onSaved(); onClose();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const btnLabel = mode === "grant" ? (isDelivery && accountId == null ? "Crear acceso" : "Dar acceso")
    : mode === "pin" ? "Guardar PIN de acceso" : "";

  return (
    <Modal
      open
      onClose={onClose}
      title={<span className="flex items-center gap-2"><KeyRound size={18}/> {person.name}</span>}
      size="md"
    >
      {/* Bloque info del empleado */}
      <div className="mb-4 rounded-xl border border-paper-300 bg-paper-50 p-3 dark:border-obsidian-700 dark:bg-obsidian-900/60">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-ink-900 dark:text-white">{person.name}</div>
            <div className="text-xs text-ink-500 dark:text-obsidian-400">{roleLabel}</div>
          </div>
          {hasAccess ? (
            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              <KeyRound size={10} className="mr-1 inline" /> Con acceso
            </span>
          ) : (
            <span className="badge bg-paper-200 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-300">Sin acceso</span>
          )}
        </div>
        {hasAccess && (
          <div className="mt-2 text-xs text-ink-600 dark:text-obsidian-300">
            Ingresa con el usuario <b className="font-mono">@{person.username || "—"}</b> · {roleLabel}
          </div>
        )}
      </div>

      {/* ====== Vista inicial ====== */}
      {mode === "info" && (
        <>
          {hasAccess ? (
            <div className="space-y-2">
              <button onClick={() => { setMode("pin"); resetKeys(); }} className="btn-primary w-full">
                <KeyRound size={15}/> Cambiar PIN
              </button>
              <button onClick={revokeAccess} disabled={saving} className="btn-secondary w-full text-rose-600">
                {saving ? "Desactivando…" : "Quitar acceso"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-ink-600 dark:text-obsidian-300">
                {isDelivery
                  ? "Este repartidor aún no tiene acceso al sistema. Asigná un usuario y PIN para que entre desde su celular."
                  : "Este mesero aún no tiene acceso al sistema. Asigná un PIN para que entre desde su celular."}
              </p>
              <button onClick={() => { setMode("grant"); resetKeys(); }} className="btn-primary w-full">
                <KeyRound size={15}/> {isDelivery ? "Crear acceso" : "Dar acceso"}
              </button>
            </div>
          )}
        </>
      )}

      {/* ====== Crear/Habilitar acceso ====== */}
      {mode === "grant" && (
        <>
          {isDelivery && accountId == null && (
            <>
              <label className="label">Usuario (para login)</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} autoFocus placeholder="ej. luis" maxLength={30} />
            </>
          )}
          {!(isDelivery && accountId == null) && (
            <p className="mb-2 text-sm text-ink-600 dark:text-obsidian-300">Ingresá un PIN de 4 dígitos para activar su ingreso.</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="label">PIN (4 dígitos)</label>
              <input className="input" type="password" inputMode="numeric" maxLength={4} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
            </div>
            <div>
              <label className="label">Confirmar PIN</label>
              <input className="input" type="password" inputMode="numeric" maxLength={4} value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
            </div>
          </div>
          {err && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => { setMode("info"); resetKeys(); }} className="btn-secondary">Volver</button>
            <button onClick={createAccess} disabled={saving || !validPin} className="btn-primary">
              {saving ? "Guardando…" : btnLabel}
            </button>
          </div>
        </>
      )}

      {/* ====== Cambiar PIN ====== */}
      {mode === "pin" && (
        <>
          <p className="mb-2 text-sm text-ink-600 dark:text-obsidian-300">Ingresá el nuevo PIN de 4 dígitos para <b>@{person.username}</b>.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nuevo PIN</label>
              <input className="input" type="password" inputMode="numeric" maxLength={4} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" autoFocus />
            </div>
            <div>
              <label className="label">Confirmar PIN</label>
              <input className="input" type="password" inputMode="numeric" maxLength={4} value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
            </div>
          </div>
          {err && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => { setMode("info"); resetKeys(); }} className="btn-secondary">Volver</button>
            <button onClick={changePin} disabled={saving || !validPin} className="btn-primary">
              {saving ? "Guardando…" : "Guardar PIN"}
            </button>
          </div>
        </>
      )}
    </Modal>
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
        <label className="label" htmlFor="dp-name">Nombre</label>
        <input id="dp-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus required maxLength={60} />
        <label className="label mt-3" htmlFor="dp-phone">Teléfono</label>
        <input id="dp-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" maxLength={30} />
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
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [created, setCreated] = useState(null); // waiter creado, esperando acceso

  const save = async () => {
    setErr(null);
    const n = name.trim();
    if (n.length < 2) return setErr("Ingresá el nombre completo");
    // Generar usuario a partir del nombre: "Juan Pérez" → juan.perez
    const username = n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "") || "mesero";
    const tempPin = "0000";
    setSaving(true);
    try {
      const { data } = await api.post("/auth/users", {
        username,
        name: n,
        pin: tempPin,
        role: "waiter",
        active: false, // sin acceso todavía (cuenta activada)
      });
      onSaved(); // refresca lista pero no todavía cierra
      setCreated({ id: data.id, username: data.username, name: data.name });
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}
      title={<span className="flex items-center gap-2"><Utensils size={18}/> {created ? "Mesero creado" : "Nuevo mesero"}</span>}
      size="md"
    >
      {!created ? (
        <>
          <p className="mb-3 text-sm text-ink-500 dark:text-obsidian-400">
            Ingresás solo el nombre. El acceso al sistema lo definís en el siguiente paso.
          </p>
          <label className="label" htmlFor="wm-name">Nombre completo</label>
          <input id="wm-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={60} placeholder="Ej. María López" />
          {err && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="btn-secondary">Cancelar</button>
            <button onClick={save} disabled={saving || name.trim().length < 2} className="btn-primary">
              {saving ? "Creando…" : "Crear mesero"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            Mesero creado. Ya está en la lista de meseros.
          </div>
          <p className="mb-3 text-sm text-ink-600 dark:text-obsidian-300">
            ¿Querés darle acceso al sistema ahora? Con acceso abre la app con el usuario <b className="font-mono">@{created.username}</b> y el PIN que le asignes.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1">No, más tarde</button>
            <button onClick={() => setCreated({ ...created, grantAccess: true })} className="btn-primary flex-1">
              <KeyRound size={15}/> Sí, configurar acceso
            </button>
          </div>
          {created.grantAccess && (
            <WaiterAccessFields waiter={{ id: created.id, name: created.name, username: created.username }} onDone={onClose} onSaved={onSaved} />
          )}
        </>
      )}
    </Modal>
  );
}


/**
 * Sub-modal de PIN dentro del flujo "nuevo mesero" ya creado sin acceso.
 * waiter: { id, username, name }
 */
function WaiterAccessFields({ waiter, onSaved, onDone }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const valid = /^\d{4}$/.test(pin) && pin === confirmPin;

  const save = async () => {
    setErr(null);
    setSaving(true);
    try {
      await api.put(`/auth/users/${waiter.id}/pin`, { pin });
      await api.put(`/auth/users/${waiter.id}/active`, { active: true });
      toast.success(`Acceso habilitado para ${waiter.name}. Usuario: @${waiter.username}`);
      onSaved(); onDone();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-4 rounded-xl border border-wine-200 bg-wine-50/50 p-3 dark:border-wine-700 dark:bg-wine-900/10">
      <label className="label">PIN de acceso (4 dígitos)</label>
      <input className="input" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" autoFocus />
      <div className="mt-2">
        <label className="label">Confirmar PIN</label>
        <input className="input" type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
      </div>
      {err && <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">{err}</div>}
      <div className="mt-3 flex justify-end">
        <button onClick={save} disabled={!valid || saving} className="btn-primary">
          {saving ? "Activando…" : "Guardar y activar acceso"}
        </button>
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

function formatDayLabel(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function WaiterHistoryModal({ waiter, onClose }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get("/reports/my-work-days", { params: { user_id: waiter.id } })
      .then((r) => setDays(r.data || []))
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [waiter.id]);

  const openDay = async (date) => {
    setSelectedDate(date);
    setDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/reports/my-work-days/${date}`, { params: { user_id: waiter.id } });
      setDetail(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDay = () => {
    setSelectedDate(null);
    setDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-pop dark:border-obsidian-700 dark:bg-obsidian-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-paper-300 px-5 py-4 dark:border-obsidian-800">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
            Historial · {waiter.name}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
              {error}
            </div>
          )}

          {selectedDate ? (
            <>
              <button type="button" onClick={closeDay} className="btn-secondary mb-4 text-sm">
                <ArrowLeft size={16} /> Días
              </button>
              {detailLoading ? (
                <div className="text-sm text-ink-500">Cargando día…</div>
              ) : detail ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="card p-3">
                      <div className="text-[11px] text-ink-500 dark:text-obsidian-400">Cuentas</div>
                      <div className="text-xl font-bold text-ink-900 dark:text-white">{detail.summary.orders_count}</div>
                    </div>
                    <div className="card p-3">
                      <div className="text-[11px] text-ink-500 dark:text-obsidian-400">Vendido</div>
                      <div className="text-xl font-bold text-ink-900 dark:text-white">{money(detail.summary.total_sales)}</div>
                    </div>
                    <div className="card p-3">
                      <div className="text-[11px] text-ink-500 dark:text-obsidian-400">Propinas</div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{money(detail.summary.total_tips)}</div>
                    </div>
                    <div className="card p-3">
                      <div className="text-[11px] text-ink-500 dark:text-obsidian-400">Mesas</div>
                      <div className="text-xl font-bold text-ink-900 dark:text-white">{detail.summary.tables_served}</div>
                    </div>
                  </div>
                  {detail.orders.length === 0 ? (
                    <div className="card p-8 text-center text-sm text-ink-500">Sin pedidos este día.</div>
                  ) : (
                    <div className="space-y-2">
                      {detail.orders.map((o, i) => (
                        <OrderCard
                          key={o.id}
                          order={o}
                          rotateIndex={i}
                          onClick={() => setViewOrder(o)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </>
          ) : loading ? (
            <div className="py-8 text-center text-ink-400 dark:text-obsidian-500">Cargando…</div>
          ) : days.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays size={32} className="mx-auto mb-2 text-ink-400" />
              <div className="font-semibold text-ink-800 dark:text-white">Sin días registrados</div>
              <p className="mt-1 text-sm text-ink-500 dark:text-obsidian-400">Cuando cobre cuentas, aparecerán acá por día.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => openDay(d.date)}
                  className="card flex w-full items-center gap-3 p-4 text-left transition hover:border-wine-400 hover:shadow-pop dark:hover:border-wine-500"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                    <CalendarDays size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold capitalize text-ink-900 dark:text-white">{formatDayLabel(d.date)}</div>
                    <div className="mt-0.5 text-xs text-ink-500 dark:text-obsidian-400">
                      {d.orders_count} cuenta{d.orders_count === 1 ? "" : "s"}
                      {" · "}{d.tables_served} mesa{d.tables_served === 1 ? "" : "s"}
                      {" · "}Propina {money(d.total_tips)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tabular-nums text-ink-900 dark:text-white">{money(d.total_sales)}</div>
                    <ChevronRight size={16} className="ml-auto mt-0.5 text-ink-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
          {viewOrder && (
            <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  useDocumentTitle("Personal");
  const { user } = useAuth();
  const [tab, setTab] = useState("delivery");
  const [delivery, setDelivery] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [tables, setTables] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [historyWaiter, setHistoryWaiter] = useState(null);
  // Modal unificado de acceso: { person, role } ("waiter" | "delivery")
  const [accessTarget, setAccessTarget] = useState(null);

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
            <StaffTabs value={tab} onChange={setTab} />
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus size={16}/> Nuevo
            </button>
          </div>
        }
      />

      {tab === "delivery" && (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[36rem]">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acceso</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {delivery.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-strong">{p.name}</td>
                    <td className="cell-muted">{p.phone || "—"}</td>
                    <td>
                      <span className={`badge ${
                        p.status === "available" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                        p.status === "busy" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                         "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}>
                        {p.status === "available" ? "Disponible" : p.status === "busy" ? "Ocupado" : "Fuera de turno"}
                      </span>
                    </td>
                    <td>
                      {p.user_id ? (
                        <div className="flex flex-col">
                          {p.login_active === false ? (
                            <span className="badge bg-paper-200 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-300">
                              Sin acceso (activar)
                            </span>
                          ) : (
                            <>
                              <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                <KeyRound size={10} className="mr-1 inline" /> Con acceso
                              </span>
                              <span className="mt-0.5 text-[10px] text-ink-500 dark:text-obsidian-500">
                                @{p.username || "—"}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-paper-200 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-300">
                          Sin acceso
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setAccessTarget({ person: p, role: "delivery" })}
                        className="btn-secondary h-9 px-2.5 text-xs"
                        title={`Gestionar acceso de ${p.name}`}
                      >
                        <KeyRound size={14} /> Acceso
                      </button>
                      <button onClick={() => setEditing({ type: "delivery", value: p })} className="btn-ghost h-9 w-9 p-0" title={`Editar ${p.name}`} aria-label={`Editar ${p.name}`}><Edit2 size={17}/></button>
                      <button onClick={() => setConfirmDelete({ type: "delivery", id: p.id, name: p.name })} className="btn-ghost h-9 w-9 p-0 text-rose-600 dark:text-rose-400" title={`Eliminar ${p.name}`} aria-label={`Eliminar ${p.name}`}><Trash2 size={17}/></button>
                    </td>
                  </tr>
                ))}
                {delivery.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center cell-muted">
                      No hay repartidores. Crea uno con "Nuevo".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "waiters" && (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[32rem]">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Mesas</th>
                  <th>Acceso</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {waiters.map((w) => {
                  const wTables = tables.filter((t) => Number(t.assigned_user_id) === Number(w.id));
                  return (
                    <tr key={w.id}>
                      <td className="cell-strong">{w.name}</td>
                      <td>
                        {wTables.length === 0 ? (
                          <span className="text-xs italic cell-muted">Sin mesas</span>
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
                      <td>
                        {w.active ? (
                          <div className="flex flex-col">
                            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                              <KeyRound size={10} className="mr-1 inline" /> Con acceso
                            </span>
                            <span className="mt-0.5 text-[10px] text-ink-500 dark:text-obsidian-500">
                              @{w.username}
                            </span>
                          </div>
                        ) : (
                          <span className="badge bg-paper-200 text-ink-600 dark:bg-obsidian-800 dark:text-obsidian-300">
                            Sin acceso
                          </span>
                        )}
                      </td>
                      <td className="space-x-1 text-right">
                        <button type="button" onClick={() => setAccessTarget({ person: w, role: "waiter" })} className="btn-secondary h-9 px-2.5 text-xs" title={`Gestionar acceso de ${w.name}`}>
                          <KeyRound size={14}/> Acceso
                        </button>
                        <button type="button" onClick={() => setHistoryWaiter(w)} className="btn-ghost h-9 w-9 p-0" title={`Ver historial de ${w.name}`} aria-label={`Ver historial de ${w.name}`}><Clock size={17}/></button>
                      </td>
                    </tr>
                  );
                })}
                {waiters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center cell-muted">
                      No hay meseros. Crea uno con &quot;Nuevo&quot; en esta pestaña.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "waiters" && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-700 dark:text-white">
            Asignación de mesas
          </h3>
          <AssignmentsTab />
        </div>
      )}

      {tab === "tables" && (
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table min-w-[36rem]">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Etiqueta</th>
                  <th>Capacidad</th>
                  <th>Mesero</th>
                  <th>Estado actual</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((t) => (
                  <tr key={t.id}>
                    <td className="cell-strong font-bold">{t.number}</td>
                    <td className="cell-muted">{t.label || "—"}</td>
                    <td className="cell-muted">{t.capacity}</td>
                    <td>
                      {t.assigned_user_name ? (
                        <span className="text-sm font-medium text-wine-700 dark:text-wine-400">{t.assigned_user_name}</span>
                      ) : (
                        <span className="text-xs italic cell-muted">Sin asignar</span>
                      )}
                    </td>
                    <td>
                      {t.current_order_id ? (
                        <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Ocupada</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Libre</span>
                      )}
                    </td>
<td className="text-right">
                        <button onClick={() => setEditing({ type: "table", value: t })} className="btn-ghost h-9 w-9 p-0" title={`Editar mesa ${t.number}`} aria-label={`Editar mesa ${t.number}`}><Edit2 size={17}/></button>
                        <button onClick={() => setConfirmDelete({ type: "table", id: t.id, name: `mesa ${t.number}` })} className="btn-ghost h-9 w-9 p-0 text-rose-600 dark:text-rose-400" title={`Eliminar mesa ${t.number}`} aria-label={`Eliminar mesa ${t.number}`}><Trash2 size={17}/></button>
                    </td>
                  </tr>
                ))}
                {tables.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center cell-muted">
                      No hay mesas. Crea una con &quot;Nuevo&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* La asignación de mesas vive dentro del tab Meseros */}

      {creating && tab === "delivery" && <DeliveryModal onClose={() => setCreating(false)} onSaved={load} />}
      {creating && tab === "waiters" && <WaiterModal onClose={() => setCreating(false)} onSaved={load} />}
      {creating && tab === "tables" && <TableModal onClose={() => setCreating(false)} onSaved={load} />}
      {accessTarget && (
        <AccessManageModal
          person={accessTarget.person}
          role={accessTarget.role}
          onClose={() => setAccessTarget(null)}
          onSaved={load}
        />
      )}
      {editing?.type === "delivery" && <DeliveryModal person={editing.value} onClose={() => setEditing(null)} onSaved={load} />}
      {editing?.type === "table" && <TableModal table={editing.value} onClose={() => setEditing(null)} onSaved={load} />}

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
