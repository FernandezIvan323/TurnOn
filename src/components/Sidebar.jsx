import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import LogoutConfirm from "./LogoutConfirm";
import {
  LayoutDashboard,
  Truck,
  Utensils,
  Calculator,
  Users,
  BarChart3,
  LogOut,
  Home,
  BookOpen,
  ScrollText,
  TrendingDown,
  Package,
  AlertTriangle,
  ShoppingBag,
  CalendarDays,
  X,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Inicio", icon: Home, roles: ["admin", "waiter"] },
  { to: "/tables", label: "Mesas", icon: Utensils, roles: ["admin", "waiter"] },
  { to: "/menu", labelKey: "catalog", icon: BookOpen, roles: ["admin", "waiter"] },
  { to: "/my-history", label: "Mi historial", icon: CalendarDays, roles: ["waiter"] },
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
];

const labelFor = (it, role) => {
  if (it.label) return it.label;
  if (it.labelKey === "catalog") return role === "admin" ? "Menú" : "Catálogo";
  return "";
};

export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  // Cerrar drawer al cambiar de ruta (móvil)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bloquear scroll del body con menú abierto en móvil
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!user) return null;

  const navItems = items.filter((i) => i.roles.includes(user.role));

  const panel = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-paper-300 px-4 py-4 dark:border-obsidian-800 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-soft ring-1 ring-black/10 dark:ring-white/15">
            <img
              src="/favicon.svg"
              alt="TurnOn"
              className="h-full w-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-tight text-ink-900 dark:text-white">
              TurnOn
            </div>
            <div className="truncate text-xs text-ink-600 dark:text-white">
              {user.role === "waiter" ? "Mesero" : "Gestión del restaurant"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost h-10 w-10 shrink-0 p-0 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/dashboard"}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition sm:py-2.5 ${
                  isActive
                    ? "bg-wine-50 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300"
                    : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200 dark:hover:bg-obsidian-800"
                }`
              }
            >
              <Icon size={22} className="shrink-0" />
              {labelFor(it, user.role)}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-paper-300 p-3 dark:border-obsidian-800">
        <div className="px-3 py-2 text-xs text-ink-500 dark:text-obsidian-400">
          Sesión iniciada como
          <div className="text-sm font-semibold text-ink-900 dark:text-white">{user.name}</div>
          <div className="text-xs capitalize text-ink-500 dark:text-obsidian-400">
            {user.role === "admin" ? "Cajero / Administrador" : "Mesero"}
          </div>
          {user.role === "waiter" && (
            <div className="mt-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Utensils size={10} /> {(user.assigned_table_ids || []).length} mesa
                {(user.assigned_table_ids || []).length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="btn-ghost mt-1 w-full justify-start"
        >
          <LogOut size={20} /> Cerrar sesión
        </button>
      </div>

      {showLogout && (
        <LogoutConfirm
          onConfirm={() => {
            logout();
            nav("/login");
          }}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );

  return (
    <>
      {/* Desktop: sidebar fijo */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-paper-300 bg-white dark:border-obsidian-800 dark:bg-obsidian-900 lg:flex">
        {panel}
      </aside>

      {/* Mobile: overlay + drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(14rem,72vw)] max-w-full flex-col border-r border-paper-300 bg-white shadow-pop transition-transform duration-200 ease-out dark:border-obsidian-800 dark:bg-obsidian-900 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {panel}
      </aside>
    </>
  );
}
