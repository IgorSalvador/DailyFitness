import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Rotas acessíveis apenas para usuários NÃO autenticados
 * (login, cadastro, recuperação de senha). Se já houver sessão válida,
 * redireciona para a home.
 */
const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default PublicOnlyRoute;
