import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

interface RouteGuardProps {
  children: React.ReactNode;
  pathname: string;
}

/**
 * Protege todas las rutas excepto las públicas.
 * - Si el usuario no está autenticado y entra a una vista protegida → redirige a /login.
 * - Si está autenticado y entra a /login o /signup → redirige a /dashboard.
 * También cubre la navegación "atrás" del navegador (CA-04) porque cada cambio
 * de ruta re-evalúa la sesión activa.
 */
export function RouteGuard({ children, pathname }: RouteGuardProps) {
  const { isAuthenticated } = useAuth();
  const isPublic = PUBLIC_ROUTES.has(pathname);

  // Si no está autenticado y la ruta no es pública, redirige a login
  if (!isAuthenticated && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado y entra a /login o /signup, redirige a dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
