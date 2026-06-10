import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../api/services";
import type { LoginData, MeResponseDTO } from "../api/types";

type AuthContextValue = {
  user: MeResponseDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssemblyman: boolean;
  isAssessor: boolean;
  isLeader: boolean;
  isVoter: boolean;
  canManageOperations: boolean;
  canRegisterAssessor: boolean;
  canRegisterAssemblyman: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setUser(await authService.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? [];
    const isAdmin = roles.includes("Admin");
    const isAssemblyman = roles.includes("Assemblyman");
    const isAssessor = roles.includes("Assessor");
    const isLeader = roles.includes("Leader");
    const isVoter = roles.includes("Voter");
    const canManageOperations = isAdmin || isAssemblyman || isAssessor;
    const canRegisterAssemblyman = isAdmin;
    const canRegisterAssessor = isAdmin || isAssemblyman;

    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin,
      isAssemblyman,
      isAssessor,
      isLeader,
      isVoter,
      canManageOperations,
      canRegisterAssessor,
      canRegisterAssemblyman,
      login: async (data) => {
        await authService.login(data);
        await refreshUser();
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // A sessão local deve ser encerrada mesmo se o cookie remoto já expirou ou o CORS bloqueou a chamada.
        } finally {
          setUser(null);
        }
      },
      refreshUser,
    };
  }, [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
