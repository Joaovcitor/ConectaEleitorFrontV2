import { zodResolver } from "@hookform/resolvers/zod";
import { Check, IdCard, LoaderCircle, Mail, Save, ShieldCheck, UserCog, UserRoundPlus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../api/client";
import { authService } from "../api/services";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  completeName: z.string().min(3, "Informe o nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Use pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme a senha."),
  profile: z.enum(["assessor", "assemblyman"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem.",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof schema>;

export function UserRegistrationPage() {
  const { canRegisterAssessor, canRegisterAssemblyman } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const defaultProfile = canRegisterAssemblyman ? "assemblyman" : "assessor";
  const form = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { completeName: "", email: "", password: "", confirmPassword: "", profile: defaultProfile },
  });
  const selectedProfile = form.watch("profile");
  const submitting = form.formState.isSubmitting;

  const profileOptions = useMemo(() => [
    ...(canRegisterAssemblyman ? [{ value: "assemblyman" as const, label: "Vereador", description: "Conta política com capacidade institucional ampla." }] : []),
    ...(canRegisterAssessor ? [{ value: "assessor" as const, label: "Assessor", description: "Equipe operacional com acesso aos módulos atuais do sistema." }] : []),
  ], [canRegisterAssessor, canRegisterAssemblyman]);

  const onSubmit = form.handleSubmit(async ({ profile, ...data }) => {
    try {
      setError("");
      setFeedback("");
      if (profile === "assemblyman") await authService.registerAssemblyman(data);
      else await authService.registerAssessor(data);
      setFeedback(profile === "assemblyman" ? "Vereador cadastrado com sucesso." : "Assessor cadastrado com sucesso.");
      form.reset({ completeName: "", email: "", password: "", confirmPassword: "", profile });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Acesso e equipe</span>
          <h1>Cadastro de usuários</h1>
          <p>Crie acessos conforme a política do sistema e mantenha a operação preparada para regras futuras por perfil.</p>
        </div>
      </div>

      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}

      <form className="citizen-form" onSubmit={onSubmit}>
        <div className="form-command-center user-command-center">
          <div>
            <span>Provisionamento seguro</span>
            <h2>Novo acesso institucional</h2>
            <p>Defina o perfil, os dados de identificação e as credenciais iniciais do usuário.</p>
          </div>
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={() => form.reset({ completeName: "", email: "", password: "", confirmPassword: "", profile: defaultProfile })}><X size={18} /> Limpar</button>
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Cadastrando..." : "Cadastrar usuário"}</button>
          </div>
        </div>

        <div className="citizen-form-layout">
          <aside className="form-rail">
            <div className="rail-card">
              <span><ShieldCheck size={18} /></span>
              <strong>Controle por role</strong>
              <p>A tela mostra apenas perfis que a conta logada pode cadastrar.</p>
            </div>
            <div className="rail-card">
              <span><Users size={18} /></span>
              <strong>Operação atual</strong>
              <p>Assessores entram com acesso aos módulos existentes: eleitores, demandas, agendas e compromissos.</p>
            </div>
            <div className="rail-card">
              <span><UserCog size={18} /></span>
              <strong>Pronto para evoluir</strong>
              <p>As permissões ficam centralizadas no contexto de autenticação.</p>
            </div>
          </aside>

          <div className="form-sections">
            <section className="form-section">
              <div className="form-section-title"><IdCard size={20} /><div><h3>Perfil de acesso</h3><p>Escolha o papel institucional antes de informar as credenciais.</p></div></div>
              <div className="type-segments user-role-segments">
                {profileOptions.map((option) => (
                  <button className={selectedProfile === option.value ? "type-segment active" : "type-segment"} type="button" key={option.value} onClick={() => form.setValue("profile", option.value, { shouldDirty: true })}>
                    <span>{selectedProfile === option.value && <Check size={16} />}</span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-title"><UserRoundPlus size={20} /><div><h3>Identificação</h3><p>Dados exibidos no painel e usados para reconhecimento da equipe.</p></div></div>
              <div className="form-grid two-columns">
                <label className="form-field">Nome completo<input autoComplete="name" {...form.register("completeName")} /><small>{form.formState.errors.completeName?.message}</small></label>
                <label className="form-field">E-mail<input autoComplete="email" type="email" {...form.register("email")} /><small>{form.formState.errors.email?.message}</small></label>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-title"><Mail size={20} /><div><h3>Credenciais iniciais</h3><p>Informe uma senha temporária e confirme antes de criar o acesso.</p></div></div>
              <div className="form-grid two-columns">
                <label className="form-field">Senha<input type="password" autoComplete="new-password" {...form.register("password")} /><small>{form.formState.errors.password?.message}</small></label>
                <label className="form-field">Confirmar senha<input type="password" autoComplete="new-password" {...form.register("confirmPassword")} /><small>{form.formState.errors.confirmPassword?.message}</small></label>
              </div>
            </section>

            {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

            <div className="form-footer">
              <button className="ghost-button" type="button" onClick={() => form.reset({ completeName: "", email: "", password: "", confirmPassword: "", profile: defaultProfile })}><X size={18} /> Limpar</button>
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Cadastrando..." : "Cadastrar usuário"}</button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
