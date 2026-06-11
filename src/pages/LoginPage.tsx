import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, LogIn, LogOut, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const [error, setError] = useState("");
  const { login, logout, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const form = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const selectedPlan = searchParams.get("plano");
  const continuePath = selectedPlan ? `/planos?plano=${encodeURIComponent(selectedPlan)}` : "/";

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      await login(data);
      navigate(continuePath);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  const handleLogout = async () => {
    setError("");
    await logout();
    form.reset();
  };

  return (
    <main className="login-page">
      <section className="login-intro">
        <span className="eyebrow">LegisGest</span>
        <h1>LegisGest</h1>
        <p>Gestão parlamentar moderna e eficiente</p>
      </section>
      <section className="login-panel">
        <div className="login-brand">
          <span>LG</span>
          <div>
            <h2>LegisGest</h2>
            <p>Gestão parlamentar moderna e eficiente</p>
          </div>
        </div>
        {!loading && isAuthenticated && (
          <div className="alert info">
            <span>Sessão ativa como {user?.completeName ?? user?.email}.</span>
            <div className="inline-actions">
              <Link className="ghost-button" to={continuePath}>Continuar</Link>
              <button className="danger-button" type="button" onClick={handleLogout}>
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
        )}
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            E-mail
            <div className="input-with-icon"><Mail size={18} /><input type="email" autoComplete="email" placeholder="seuemail@exemplo.com" {...form.register("email")} /></div>
            <small>{form.formState.errors.email?.message}</small>
          </label>
          <label>
            Senha
            <div className="input-with-icon"><LockKeyhole size={18} /><input type="password" autoComplete="current-password" placeholder="Digite sua senha" {...form.register("password")} /></div>
            <small>{form.formState.errors.password?.message}</small>
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="primary-button" type="submit" disabled={form.formState.isSubmitting}>
            <LogIn size={18} />
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </button>
          <div className="inline-actions">
            <Link className="ghost-button" to="/apresentacao">Conhecer o sistema</Link>
            <Link className="ghost-button" to="/planos-publicos">Ver planos</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
