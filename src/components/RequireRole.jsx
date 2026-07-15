import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

/**
 * Protege rutas por rol. Si el usuario no tiene el rol requerido,
 * redirige a /dashboard (evita que un mesero abra /cashier por URL).
 */
export default function RequireRole({ roles = ["admin"], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
