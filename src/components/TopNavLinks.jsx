import { NavLink } from "react-router-dom";
import { NAV_ITEMS, navLabel } from "../config/nav";

/**
 * Barra superior de navegación por iconos (modo grilla / pantalla completa).
 * Solo icono + tooltip, centrada entre el logo y los botones de configuración.
 */
export default function TopNavLinks({ role = "admin" }) {
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <nav className="mx-auto flex items-center gap-1 sm:gap-1.5" aria-label="Navegación de secciones">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            title={navLabel(item, role)}
            aria-label={navLabel(item, role)}
            className={({ isActive }) =>
              `flex h-10 w-10 items-center justify-center rounded-xl transition ${
                isActive
                  ? "bg-wine-600 text-white"
                  : "text-ink-600 hover:bg-paper-200 dark:text-obsidian-200 dark:hover:bg-obsidian-800"
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        );
      })}
    </nav>
  );
}