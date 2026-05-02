import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUser } from "@/lib/auth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user = getUser();
  const hasRole = user?.role && allowedRoles.includes(user.role);

  if (!hasRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
