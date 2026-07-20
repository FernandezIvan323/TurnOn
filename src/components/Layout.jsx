import { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import ServerStatus from "./ServerStatus";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../store/auth";
import { Menu } from "lucide-react";

export default function Layout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-svh app-shell">
      <ServerStatus />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior móvil (safe-area para notch) */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-paper-300 bg-white/95 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="btn-ghost h-11 w-11 shrink-0 p-0"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
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
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
