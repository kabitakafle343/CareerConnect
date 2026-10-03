import { Navigate } from "react-router-dom";
import TokenService from "../apis/tokenservice";

type Role = "admin" | "employer" | "candidate";

export const ProtectedRoute = ({ component: Component, role }: { component: React.ComponentType; role?: Role }) => {
  const isAuthenticated = TokenService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && TokenService.getTokenDetails()?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Component />;
};
