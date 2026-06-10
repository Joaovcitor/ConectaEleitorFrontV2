import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="center-screen">
        <div className="loader" />
        <p>Verificando sua sessão...</p>
      </main>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
