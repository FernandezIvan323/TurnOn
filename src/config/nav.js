import {
  LayoutDashboard,
  Truck,
  Utensils,
  Calculator,
  Users,
  BarChart3,
  Home,
  BookOpen,
  ScrollText,
  TrendingDown,
  Package,
  AlertTriangle,
  ShoppingBag,
  CalendarDays,
  Store,
} from "lucide-react";

/**
 * Navegación principal del sistema (roles + rutas + iconos).
 * Compartido por Sidebar (lista) y ModuleGrid (grilla de la home).
 */
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Inicio", icon: Home, roles: ["admin", "waiter", "delivery"] },
  { to: "/tables", label: "Mesas", icon: Utensils, roles: ["admin", "waiter"] },
  { to: "/menu", labelKey: "catalog", icon: BookOpen, roles: ["admin", "waiter"] },
  { to: "/my-history", label: "Mi historial", icon: CalendarDays, roles: ["waiter", "delivery"] },
  { to: "/delivery", label: "Domicilios", icon: Truck, roles: ["admin"] },
  { to: "/pickup", label: "Para llevar", icon: ShoppingBag, roles: ["admin"] },
  { to: "/debts", label: "Deudas", icon: AlertTriangle, roles: ["admin"] },
  { to: "/cashier", label: "Caja", icon: Calculator, roles: ["admin"] },
  { to: "/cashier/closing", label: "Corte de caja", icon: ScrollText, roles: ["admin"] },
  { to: "/admin/expenses", label: "Gastos", icon: TrendingDown, roles: ["admin"] },
  { to: "/customers", label: "Clientes", icon: Users, roles: ["admin"] },
  { to: "/staff", label: "Personal", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/admin/inventory", label: "Inventario", icon: Package, roles: ["admin"] },
  { to: "/reports", label: "Reportes", icon: BarChart3, roles: ["admin"] },
  { to: "/negocio", label: "Negocio", icon: Store, roles: ["admin"] },
];

export function navLabel(item, role) {
  if (item.label) return item.label;
  if (item.labelKey === "catalog") return role === "admin" ? "Menú" : "Catálogo";
  return "";
}