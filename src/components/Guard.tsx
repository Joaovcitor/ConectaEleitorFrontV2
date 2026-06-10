import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/demandas" replace />;
}

export function OperationsOnly({ children }: { children: React.ReactNode }) {
  const { canManageOperations } = useAuth();
  return canManageOperations ? <>{children}</> : <Navigate to="/demandas" replace />;
}

export function UserRegistrationOnly({ children }: { children: React.ReactNode }) {
  const { canRegisterAssessor, canRegisterAssemblyman } = useAuth();
  return canRegisterAssessor || canRegisterAssemblyman ? <>{children}</> : <Navigate to="/" replace />;
}
