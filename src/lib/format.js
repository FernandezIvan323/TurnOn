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
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  on_the_way: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  ready_to_pay: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export const typeLabels = {
  table: "Mesa",
  delivery: "Domicilio",
  pickup: "Para llevar",
};
