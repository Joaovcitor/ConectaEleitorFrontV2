import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
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
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      await login(data);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <main className="login-page">
      <section className="login-intro">
        <span className="eyebrow">Conecta Eleitor</span>
        <h1>Gestão política próxima, organizada e segura.</h1>
        <p>Centralize eleitores, demandas, agendas e compromissos em uma experiência institucional simples de operar.</p>
      </section>
      <section className="login-panel">
        <div className="login-brand">
          <span>CE</span>
          <div>
            <h2>Entrar no sistema</h2>
            <p>Acesse sua área de trabalho.</p>
          </div>
        </div>
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
        </form>
      </section>
    </main>
  );
}
