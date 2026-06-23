export const money = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Para columnas DATE de Postgres que llegan como "YYYY-MM-DDT05:00:00.000Z"
// o "YYYY-MM-DD". Extrae solo la parte de fecha sin aplicar el shift de TZ.
export const dateOnlyUTC = (iso) => {
  if (!iso) return "—";
  if (typeof iso === "string") {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [, y, mo, d] = m;
      // Construir Date en hora local para que se muestre la fecha tal como está
      return new Date(Number(y), Number(mo) - 1, Number(d)).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      });
    }
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

export const statusLabels = {
  pending: "Pendiente",
  preparing: "En preparación",
  on_the_way: "En camino",
  delivered: "Entregado",
  ready_to_pay: "Lista para cobrar",
  paid: "Pagada",
  cancelled: "Cancelada",
};

export const statusColors = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200",
  on_the_way: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200",
  ready_to_pay: "bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200",
};

export const typeLabels = {
  table: "Mesa",
  delivery: "Domicilio",
  pickup: "Para llevar",
};

export const typeColors = {
  table: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  delivery: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  pickup: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

// Asigna números de turno a pedidos ordenados cronológicamente.
// Espera un array ya ordenado por created_at ASC.
// Solo asigna turnos a pedidos activos (no paid, cancelled, delivered).
export function assignTurns(orders) {
  let turn = 0;
  return orders.map((o) => {
    if (!["paid", "cancelled", "delivered"].includes(o.status)) {
      turn++;
      return { ...o, turn_number: turn };
    }
    return { ...o, turn_number: null };
  });
}

// Tiempo transcurrido desde la creación del pedido (en minutos)
export function waitMinutes(iso) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// Label legible del tiempo de espera
export function waitLabel(iso) {
  const m = waitMinutes(iso);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}min` : `${h}h`;
}
