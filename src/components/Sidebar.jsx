import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  Utensils,
  Calculator,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

const items = [
  { to: "/",             label: "Resumen",        icon: LayoutDashboard, roles: ["admin", "waiter"] },
  { to: "/delivery",     label: "Domicilios",     icon: Truck,           roles: ["admin"] },
  { to: "/tables",       label: "Mesas",          icon: Utensils,        roles: ["admin", "waiter"] },
  { to: "/cashier",      label: "Caja",           icon: Calculator,      roles: ["admin"] },
  { to: "/customers",    label: "Clientes",       icon: Users,           roles: ["admin"] },
  { to: "/menu",         label: "Menú (catálogo)",icon: ClipboardList,   roles: ["admin"] },
  { to: "/reports",      label: "Reportes",       icon: BarChart3,       roles: ["admin"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-ink-200 dark:bg-ink-900 dark:border-ink-800 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-ink-200 dark:border-ink-800">
        <div className="text-lg font-semibold text-ink-800 dark:text-ink-100">AppTurnos</div>
        <div className="text-xs text-ink-500 dark:text-ink-400">Gestión del restaurant</div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items
          .filter((i) => i.roles.includes(user.role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-ink-600 hover:bg-surface-100 dark:text-ink-300 dark:hover:bg-ink-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="p-3 border-t border-ink-200 dark:border-ink-800">
        <div className="px-3 py-2 text-xs text-ink-500 dark:text-ink-400">
          Sesión iniciada como
          <div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{user.name}</div>
          <div className="text-xs text-ink-500 dark:text-ink-400 capitalize">
            {user.role === "admin" ? "Cajero / Administrador" : "Mesero"}
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          className="btn-ghost w-full justify-start mt-1"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
