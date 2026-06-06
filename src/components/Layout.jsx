import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../store/auth";

export default function Layout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
