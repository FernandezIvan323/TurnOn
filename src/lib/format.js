export const money = (v) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(v || 0)
  );

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
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  on_the_way: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  ready_to_pay: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export const typeLabels = {
  table: "Mesa",
  delivery: "Domicilio",
  pickup: "Para llevar",
};
