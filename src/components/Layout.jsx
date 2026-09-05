import { useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ServerStatus from "./ServerStatus";
import ThemeToggle from "./ThemeToggle";
import Toaster from "./Toaster";
import TopNavLinks from "./TopNavLinks";
import { useAuth } from "../store/auth";
import { useLayoutPref } from "../hooks/useLayoutPref";
import { Menu, List, LayoutGrid } from "lucide-react";

export default function Layout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { layout, toggle } = useLayoutPref();
  const location = useLocation();
  const isGrid = layout === "grid";
  const onDashboard = location.pathname === "/dashboard";

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-svh app-shell">
      <ServerStatus />
      <Toaster />
      {!isGrid && <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-paper-300 bg-white/95 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
          {/* Izquierda: logo (+ menú móvil solo en modo lista) */}
          <div className="flex flex-1 items-center gap-2">
            {!isGrid && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="btn-ghost h-11 w-11 shrink-0 p-0 lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            )}
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
              <img
                src="/favicon.svg"
                alt=""
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/15"
              />
              <span className="truncate text-base font-bold text-ink-900 dark:text-white">
                TurnOn
              </span>
            </Link>
          </div>

          {/* Centro: navegación de íconos (solo modo grilla, fuera del inicio) */}
          {isGrid && !onDashboard && (
            <div className="hidden shrink-0 sm:block">
              <TopNavLinks role={user.role} />
            </div>
          )}

          {/* Derecha: toggle + tema */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <button
              type="button"
              onClick={toggle}
              className="btn-ghost h-10 w-10 shrink-0 p-0"
              title={isGrid ? "Cambiar a vista de lista" : "Cambiar a vista de grilla"}
              aria-label={isGrid ? "Cambiar a vista de lista" : "Cambiar a vista de grilla"}
            >
              {isGrid ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main
          className={`mx-auto w-full flex-1 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 lg:p-8 ${
            isGrid ? "max-w-none" : "max-w-[1600px]"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}