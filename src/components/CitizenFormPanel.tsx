import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, IdCard, Landmark, LoaderCircle, MapPin, Phone, Save, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cepService } from "../api/cep";
import { citizenService } from "../api/services";
import { CitizenType, type CitizenResponseDTO } from "../api/types";

export const citizenFormSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo."),
  nickname: z.string().optional(),
  cpf: z.string().optional(),
  voterRegistration: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  whatsApp: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  electoralZone: z.string().optional(),
  electoralSection: z.string().optional(),
  notes: z.string().max(500, "Use no máximo 500 caracteres.").optional(),
  type: z.coerce.number().min(1, "Selecione o tipo."),
  leaderId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CitizenFormData = z.infer<typeof citizenFormSchema>;

export const citizenFormResolver = zodResolver(citizenFormSchema);

export const emptyCitizenForm = (isActive = true): CitizenFormData => ({
  fullName: "",
  nickname: "",
  cpf: "",
  voterRegistration: "",
  birthDate: "",
  phone: "",
  whatsApp: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  district: "",
  city: "",
  state: "",
  electoralZone: "",
  electoralSection: "",
  notes: "",
  type: CitizenType.Voter,
  leaderId: "",
  isActive,
});

type CitizenFormPanelProps = {
  form: UseFormReturn<CitizenFormData>;
  mode: "create" | "edit";
  error?: string;
  onSubmit: () => void;
  onCancel: () => void;
};

const typeOptions = [
  { value: CitizenType.Voter, label: "Eleitor", description: "Pessoa atendida pelo gabinete." },
  { value: CitizenType.Leader, label: "Liderança", description: "Referência territorial ou comunitária." },
  { value: CitizenType.Both, label: "Eleitor e liderança", description: "Atendimento e articulação em um só cadastro." },
];

const fieldClass = (wide?: boolean) => (wide ? "form-field wide-field" : "form-field");

export function CitizenFormPanel({ form, mode, error, onSubmit, onCancel }: CitizenFormPanelProps) {
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cepMessage, setCepMessage] = useState("");
  const [leaders, setLeaders] = useState<CitizenResponseDTO[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(false);
  const zipCode = form.watch("zipCode");
  const notes = form.watch("notes") ?? "";
  const selectedType = Number(form.watch("type"));
  const submitting = form.formState.isSubmitting;

  const lookupCep = async (value = zipCode) => {
    const digits = (value ?? "").replace(/\D/g, "");
    if (digits.length !== 8) return;

    try {
      setCepStatus("loading");
      setCepMessage("");
      const address = await cepService.lookup(digits);
      form.setValue("zipCode", address.cep, { shouldDirty: true });
      form.setValue("street", address.street, { shouldDirty: true });
      form.setValue("neighborhood", address.neighborhood, { shouldDirty: true });
      form.setValue("city", address.city, { shouldDirty: true });
      form.setValue("state", address.state, { shouldDirty: true });
      if (address.complement && !form.getValues("complement")) {
        form.setValue("complement", address.complement, { shouldDirty: true });
      }
      setCepStatus("success");
      setCepMessage("Endereço preenchido pelo CEP.");
    } catch (err) {
      setCepStatus("error");
      setCepMessage(err instanceof Error ? err.message : "Não foi possível consultar o CEP.");
    }
  };

  useEffect(() => {
    const digits = (zipCode ?? "").replace(/\D/g, "");
    if (digits.length !== 8) {
      if (cepStatus !== "loading") {
        setCepStatus("idle");
        setCepMessage("");
      }
      return;
    }

    const timeout = window.setTimeout(() => lookupCep(zipCode), 450);
    return () => window.clearTimeout(timeout);
  }, [zipCode]);

  useEffect(() => {
    setLeadersLoading(true);
    citizenService
      .leaders({ pageSize: 500 })
      .then(setLeaders)
      .catch(() => setLeaders([]))
      .finally(() => setLeadersLoading(false));
  }, []);

  return (
    <form className="citizen-form" onSubmit={onSubmit}>
      <div className="form-command-center">
        <div>
          <span>{mode === "create" ? "Novo cadastro" : "Atualização cadastral"}</span>
          <h2>{mode === "create" ? "Ficha unificada do eleitor" : "Ficha de governança do eleitor"}</h2>
          <p>Registro completo para atendimento, base territorial, dados eleitorais e relacionamento institucional.</p>
        </div>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
          <button className="primary-button" type="submit" disabled={submitting}><Save size={18} /> {submitting ? "Salvando..." : "Salvar cadastro"}</button>
        </div>
      </div>

      <div className="citizen-form-layout">
        <aside className="form-rail">
          <div className="rail-card">
            <span><ShieldCheck size={18} /></span>
            <strong>Conformidade</strong>
            <p>Campos opcionais seguem o DTO público de cadastro e preservam preenchimento gradual.</p>
          </div>
          <div className="rail-card">
            <span><MapPin size={18} /></span>
            <strong>CEP inteligente</strong>
            <p>Ao informar 8 dígitos, rua, bairro, cidade e UF são consultados automaticamente.</p>
          </div>
          <div className="rail-card">
            <span><Landmark size={18} /></span>
            <strong>Base territorial</strong>
            <p>Dados eleitorais e distritais ficam agrupados para leitura operacional.</p>
          </div>
        </aside>

        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title"><UserRound size={20} /><div><h3>Identificação civil</h3><p>Dados principais para localizar e reconhecer o eleitor.</p></div></div>
            <div className="form-grid three-columns">
              <label className={fieldClass(true)}>Nome completo<input autoComplete="name" {...form.register("fullName")} /><small>{form.formState.errors.fullName?.message}</small></label>
              <label className={fieldClass()}>Apelido<input {...form.register("nickname")} /></label>
              <label className={fieldClass()}>Nascimento<input type="date" {...form.register("birthDate")} /></label>
              <label className={fieldClass()}>CPF<input inputMode="numeric" {...form.register("cpf")} /></label>
              <label className={fieldClass()}>Tipo<select {...form.register("type")}>{typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            </div>
            <div className="type-segments">
              {typeOptions.map((option) => (
                <button className={selectedType === option.value ? "type-segment active" : "type-segment"} type="button" key={option.value} onClick={() => form.setValue("type", option.value, { shouldDirty: true })}>
                  <span>{selectedType === option.value && <Check size={16} />}</span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Phone size={20} /><div><h3>Contato institucional</h3><p>Canais usados por atendimento, gabinete e lideranças.</p></div></div>
            <div className="form-grid three-columns">
              <label className={fieldClass()}>Telefone<input autoComplete="tel" inputMode="tel" {...form.register("phone")} /></label>
              <label className={fieldClass()}>WhatsApp<input autoComplete="tel" inputMode="tel" {...form.register("whatsApp")} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Building2 size={20} /><div><h3>Endereço e território</h3><p>Localização residencial, bairro, distrito e município.</p></div></div>
            <div className="form-grid three-columns">
              <label className={fieldClass()}>CEP<div className="cep-control"><input inputMode="numeric" autoComplete="postal-code" {...form.register("zipCode")} /><button className="icon-button" type="button" aria-label="Consultar CEP" onClick={() => lookupCep()}>{cepStatus === "loading" ? <LoaderCircle className="spin-icon" size={18} /> : <MapPin size={18} />}</button></div><small className={cepStatus === "success" ? "field-hint success-hint" : "field-hint"}>{cepMessage}</small></label>
              <label className={fieldClass(true)}>Rua<input autoComplete="street-address" {...form.register("street")} /></label>
              <label className={fieldClass()}>Número<input {...form.register("number")} /></label>
              <label className={fieldClass()}>Complemento<input {...form.register("complement")} /></label>
              <label className={fieldClass()}>Bairro<input {...form.register("neighborhood")} /></label>
              <label className={fieldClass()}>Distrito<input {...form.register("district")} /></label>
              <label className={fieldClass()}>Cidade<input autoComplete="address-level2" {...form.register("city")} /></label>
              <label className={fieldClass()}>Estado<input maxLength={2} autoComplete="address-level1" {...form.register("state")} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><IdCard size={20} /><div><h3>Dados eleitorais</h3><p>Informações para acompanhamento regional e seção eleitoral.</p></div></div>
            <div className="form-grid three-columns">
              <label className={fieldClass()}>Título de eleitor<input {...form.register("voterRegistration")} /></label>
              <label className={fieldClass()}>Zona eleitoral<input {...form.register("electoralZone")} /></label>
              <label className={fieldClass()}>Seção eleitoral<input {...form.register("electoralSection")} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Landmark size={20} /><div><h3>Observações internas</h3><p>Notas rápidas para contexto político, atendimento ou acompanhamento futuro.</p></div></div>
            <label className="form-field">Notas<textarea rows={5} maxLength={500} {...form.register("notes")} /><small className={notes.length > 450 ? "field-hint warning-hint" : "field-hint"}>{notes.length}/500 caracteres</small></label>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Users size={20} /><div><h3>Vínculos e situação</h3><p>Relacionamento com lideranças e status operacional do cadastro.</p></div></div>
            <div className="form-grid three-columns">
              <label className={fieldClass(true)}>Liderança<select {...form.register("leaderId")} disabled={leadersLoading}><option value="">{leadersLoading ? "Carregando lideranças..." : "Sem liderança vinculada"}</option>{leaders.map((leader) => <option key={leader.citizenId} value={leader.citizenId}>{leader.fullName}</option>)}</select></label>
              {mode === "edit" && <label className="checkbox-card"><input type="checkbox" {...form.register("isActive")} /><span><strong>Cadastro ativo</strong><small>Eleitor disponível para atendimento e filtros operacionais.</small></span></label>}
            </div>
          </section>

          {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

          <div className="form-footer">
            <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
            <button className="primary-button" type="submit" disabled={submitting}><Save size={18} /> {submitting ? "Salvando..." : "Salvar cadastro"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
