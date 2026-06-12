import { CalendarCheck, CalendarDays, ClipboardList, CreditCard, Download, Home, LogOut, Menu, Newspaper, UserCog, UserRound, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin, isAssemblyman, isAssessor, isLeader, isVoter, canManageOperations, canRegisterAssessor, canRegisterAssemblyman, logout } = useAuth();
  const roleLabel = isAdmin ? "Administrador" : isAssemblyman ? "Vereador" : isAssessor ? "Assessor" : isLeader ? "Liderança" : isVoter ? "Eleitor" : "Usuário";
  const canRegisterUsers = canRegisterAssessor || canRegisterAssemblyman;

  const navItems: NavItem[] = canManageOperations
    ? [
        { label: "Dashboard", path: "/", icon: <Home size={18} /> },
        { label: "Eleitores", path: "/eleitores", icon: <Users size={18} /> },
        { label: "Demandas", path: "/demandas", icon: <ClipboardList size={18} /> },
        { label: "Agendas", path: "/agendas", icon: <CalendarDays size={18} /> },
        { label: "Compromissos", path: "/compromissos", icon: <CalendarCheck size={18} /> },
        { label: "Posts", path: "/posts", icon: <Newspaper size={18} /> },
        { label: "Planos", path: "/planos", icon: <CreditCard size={18} /> },
        ...(canRegisterUsers ? [{ label: "Usuários", path: "/usuarios", icon: <UserCog size={18} /> }] : []),
      ]
    : isLeader
      ? [
          { label: "Dashboard", path: "/", icon: <Home size={18} /> },
          { label: "Meus eleitores", path: "/eleitores", icon: <Users size={18} /> },
          { label: "Demandas", path: "/demandas", icon: <ClipboardList size={18} /> },
          { label: "Planos", path: "/planos", icon: <CreditCard size={18} /> },
        ]
      : isVoter
        ? [
            { label: "Minhas demandas", path: "/demandas", icon: <ClipboardList size={18} /> },
            { label: "Nova demanda", path: "/demandas?novo=1", icon: <CalendarCheck size={18} /> },
            { label: "Planos", path: "/planos", icon: <CreditCard size={18} /> },
          ]
        : [
            { label: "Dashboard", path: "/", icon: <Home size={18} /> },
            { label: "Planos", path: "/planos", icon: <CreditCard size={18} /> },
          ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <div className="app-shell">
      {open && <button className="sidebar-backdrop" aria-label="Fechar menu" type="button" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img className="brand-mark" src="/branding/legisgest-emblem.png" alt="Símbolo LegisGest" />
          <div>
            <strong>LegisGest</strong>
            <small>Gestão parlamentar moderna</small>
          </div>
        </div>
        <div className="sidebar-profile">
          <span><UserRound size={18} /></span>
          <div>
            <strong>{user?.completeName}</strong>
            <small>{roleLabel}</small>
          </div>
        </div>
        <nav>
          <small className="nav-label">Menu principal</small>
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.path} onClick={() => setOpen(false)}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-button" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="topbar-title">
            <strong>Painel de gestão</strong>
            <span>Organize eleitores, demandas e agenda institucional.</span>
          </div>
          <div className="topbar-user">
            {installPrompt && (
              <button className="install-button" type="button" onClick={installApp}>
                <Download size={18} />
                <span>Instalar app</span>
              </button>
            )}
            <span className="user-avatar">{user?.completeName?.slice(0, 1).toUpperCase() ?? "C"}</span>
            <div>
              <strong>{user?.completeName}</strong>
              <span>{roleLabel} · {user?.email}</span>
            </div>
            <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
