import { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import ServerStatus from "./ServerStatus";
import ThemeToggle from "./ThemeToggle";
import Toaster from "./Toaster";
import { useAuth } from "../store/auth";
import { useLayoutPref } from "../hooks/useLayoutPref";
import { Menu, Home, List, LayoutGrid } from "lucide-react";

export default function Layout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { layout, toggle } = useLayoutPref();
  const isGrid = layout === "grid";

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-svh app-shell">
      <ServerStatus />
      <Toaster />
      {!isGrid && <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior (visible siempre) */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-paper-300 bg-white/95 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
          <div className="flex min-w-0 items-center gap-2">
            {!isGrid ? (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="btn-ghost h-11 w-11 shrink-0 p-0 lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="btn-ghost h-11 w-11 shrink-0 p-0"
                aria-label="Ir al inicio"
                title="Ir al inicio"
              >
                <Home size={22} />
              </Link>
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
          <div className="flex items-center gap-1">
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