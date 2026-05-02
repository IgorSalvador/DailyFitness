import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Bloqueia rotas privadas: se o usuário não estiver autenticado
 * (ou seu token tiver expirado), redireciona para /login preservando
 * a rota original em `state.from` para retomar após o login.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
