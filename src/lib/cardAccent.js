import { Utensils, Truck, ShoppingBag } from "lucide-react";
import { statusLabels, payMethodLabel } from "./format";

/**
 * Acentos semánticos por estado de pedido + paleta rotativa.
 * Forma de cada accent: { border, bg, badge }.
 */
export const ORDER_ACCENT = {
  paid: {
    border: "border-l-emerald-500",
    bg: "from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-obsidian-900",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  delivered: {
    border: "border-l-emerald-500",
    bg: "from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-obsidian-900",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  cancelled: {
    border: "border-l-rose-500",
    bg: "from-rose-50/60 to-white dark:from-rose-950/30 dark:to-obsidian-900",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  debt: {
    border: "border-l-rose-500",
    bg: "from-rose-50/60 to-white dark:from-rose-950/30 dark:to-obsidian-900",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  on_the_way: {
    border: "border-l-indigo-500",
    bg: "from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-obsidian-900",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  preparing: {
    border: "border-l-blue-500",
    bg: "from-blue-50/60 to-white dark:from-blue-950/30 dark:to-obsidian-900",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  ready_to_pay: {
    border: "border-l-sky-500",
    bg: "from-sky-50/60 to-white dark:from-sky-950/30 dark:to-obsidian-900",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  assigned: {
    border: "border-l-violet-500",
    bg: "from-violet-50/60 to-white dark:from-violet-950/30 dark:to-obsidian-900",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  },
  pending: {
    border: "border-l-amber-500",
    bg: "from-amber-50/60 to-white dark:from-amber-950/30 dark:to-obsidian-900",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

export const ORDER_FALLBACK = ORDER_ACCENT.pending;

export function orderAccent(order) {
  if (!order) return ORDER_FALLBACK;
  if (order.payment_status === "debt") return ORDER_ACCENT.debt;
  if (order.payment_status === "paid") return ORDER_ACCENT.paid;
  return ORDER_ACCENT[order.status] || ORDER_FALLBACK;
}

/**
 * Paleta rotativa (sin semántica) para cards de repartidores / entregados.
 * Cada accent completo (border, bg, badge) para usar igual que ORDER_ACCENT.
 */
export const ROTATE_ACCENTS = [
  {
    border: "border-l-violet-500",
    bg: "from-violet-50/60 to-white dark:from-violet-950/30 dark:to-obsidian-900",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    border: "border-l-indigo-500",
    bg: "from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-obsidian-900",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  {
    border: "border-l-sky-500",
    bg: "from-sky-50/60 to-white dark:from-sky-950/30 dark:to-obsidian-900",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  {
    border: "border-l-emerald-500",
    bg: "from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-obsidian-900",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    border: "border-l-amber-500",
    bg: "from-amber-50/60 to-white dark:from-amber-950/30 dark:to-obsidian-900",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    border: "border-l-rose-500",
    bg: "from-rose-50/60 to-white dark:from-rose-950/30 dark:to-obsidian-900",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

export function rotateAccent(index) {
  return ROTATE_ACCENTS[index % ROTATE_ACCENTS.length];
}

export const TYPE_ICON = {
  table: Utensils,
  delivery: Truck,
  pickup: ShoppingBag,
};

/**
 * Banda de estado (fondo + texto) para las ventanas de detalle.
 * Devuelve { label, className }.
 */
export function statusBanner(order) {
  if (!order) return { label: "", className: "bg-paper-100 text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-200" };
  let cls = "bg-paper-100 text-ink-700 dark:bg-obsidian-800 dark:text-obsidian-200";
  let label = statusLabels[order.status] || order.status;

  if (order.payment_status === "debt") {
    cls = "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200";
    label = "Deuda";
  } else if (order.payment_status === "paid") {
    cls = "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200";
    label = `Pagado · ${payMethodLabel(order.payment_method)}`;
  } else {
    const map = {
      cancelled: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200",
      on_the_way: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200",
      preparing: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
      ready_to_pay: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
      assigned: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
      pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
      delivered: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    };
    cls = map[order.status] || cls;
  }
  return { label, className: cls };
}