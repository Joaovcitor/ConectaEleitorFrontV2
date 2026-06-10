import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CalendarDays, Check, Clock, LoaderCircle, MapPin, Save, UserRound, Workflow, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AppointmentStatus, appointmentStatusLabel, type AgendaResponseDTO, type CitizenResponseDTO } from "../api/types";

export const appointmentFormSchema = z.object({
  title: z.string().min(3, "Informe o título."),
  description: z.string().optional(),
  startAt: z.string().min(1, "Informe o início."),
  endAt: z.string().min(1, "Informe o fim."),
  location: z.string().optional(),
  agendaId: z.string().min(1, "Selecione a agenda."),
  citizenId: z.string().optional(),
  status: z.coerce.number(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export const appointmentFormResolver = zodResolver(appointmentFormSchema);

export const emptyAppointmentForm = (): AppointmentFormData => ({
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  location: "",
  agendaId: "",
  citizenId: "",
  status: AppointmentStatus.Scheduled,
});

type AppointmentFormPanelProps = {
  form: UseFormReturn<AppointmentFormData>;
  mode: "create" | "edit";
  agendas: AgendaResponseDTO[];
  citizens: CitizenResponseDTO[];
  error?: string;
  onSubmit: () => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: AppointmentStatus.Scheduled, label: appointmentStatusLabel[AppointmentStatus.Scheduled], description: "Compromisso previsto na agenda institucional." },
  { value: AppointmentStatus.Completed, label: appointmentStatusLabel[AppointmentStatus.Completed], description: "Atendimento ou reunião já finalizado." },
  { value: AppointmentStatus.Canceled, label: appointmentStatusLabel[AppointmentStatus.Canceled], description: "Registro mantido, mas sem execução." },
];

export function AppointmentFormPanel({ form, mode, agendas, citizens, error, onSubmit, onCancel }: AppointmentFormPanelProps) {
  const selectedStatus = Number(form.watch("status"));
  const submitting = form.formState.isSubmitting;

  return (
    <form className="citizen-form" onSubmit={onSubmit}>
      <div className="form-command-center appointment-command-center">
        <div>
          <span>{mode === "create" ? "Novo compromisso" : "Atualização de compromisso"}</span>
          <h2>{mode === "create" ? "Planejamento institucional" : "Gestão do compromisso"}</h2>
          <p>Organize agenda, horário, local, eleitor vinculado e status para manter a rotina do gabinete previsível.</p>
        </div>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Salvando..." : "Salvar compromisso"}</button>
        </div>
      </div>

      <div className="citizen-form-layout">
        <aside className="form-rail">
          <div className="rail-card">
            <span><CalendarDays size={18} /></span>
            <strong>Agenda centralizada</strong>
            <p>Cada compromisso fica conectado a uma agenda oficial para leitura rápida da rotina.</p>
          </div>
          <div className="rail-card">
            <span><Clock size={18} /></span>
            <strong>Janela clara</strong>
            <p>Início e fim documentados reduzem conflito de horários e melhoram previsibilidade.</p>
          </div>
          <div className="rail-card">
            <span><UserRound size={18} /></span>
            <strong>Atendimento vinculado</strong>
            <p>Quando houver eleitor relacionado, o histórico fica mais fácil de acompanhar.</p>
          </div>
        </aside>

        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title"><CalendarClock size={20} /><div><h3>Resumo do compromisso</h3><p>Informe o objetivo do encontro e o local previsto de atendimento.</p></div></div>
            <div className="form-grid two-columns">
              <label className="form-field">Título<input {...form.register("title")} /><small>{form.formState.errors.title?.message}</small></label>
              <label className="form-field">Local<input {...form.register("location")} /></label>
              <label className="form-field span-all">Descrição<textarea rows={5} {...form.register("description")} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Clock size={20} /><div><h3>Data e horário</h3><p>Defina a janela do compromisso para evitar sobreposição de agenda.</p></div></div>
            <div className="form-grid two-columns">
              <label className="form-field">Início<input type="datetime-local" {...form.register("startAt")} /><small>{form.formState.errors.startAt?.message}</small></label>
              <label className="form-field">Fim<input type="datetime-local" {...form.register("endAt")} /><small>{form.formState.errors.endAt?.message}</small></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><MapPin size={20} /><div><h3>Agenda e vínculo</h3><p>Conecte o compromisso à agenda responsável e, quando aplicável, a um eleitor.</p></div></div>
            <div className="form-grid two-columns">
              <label className="form-field">Agenda<select {...form.register("agendaId")}><option value="">Selecione</option>{agendas.map((agenda) => <option key={agenda.agendaId} value={agenda.agendaId}>{agenda.name}</option>)}</select><small>{form.formState.errors.agendaId?.message}</small></label>
              <label className="form-field">Eleitor vinculado<select {...form.register("citizenId")}><option value="">Sem eleitor vinculado</option>{citizens.map((citizen) => <option key={citizen.citizenId} value={citizen.citizenId}>{citizen.fullName}</option>)}</select></label>
            </div>
          </section>

          {mode === "edit" && (
            <section className="form-section">
              <div className="form-section-title"><Workflow size={20} /><div><h3>Status operacional</h3><p>Atualize a situação real do compromisso no ciclo da agenda.</p></div></div>
              <div className="type-segments appointment-segments">
                {statusOptions.map((option) => (
                  <button className={selectedStatus === option.value ? "type-segment active" : "type-segment"} type="button" key={option.value} onClick={() => form.setValue("status", option.value, { shouldDirty: true })}>
                    <span>{selectedStatus === option.value && <Check size={16} />}</span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </button>
                ))}
              </div>
            </section>
          )}

          {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

          <div className="form-footer">
            <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Salvando..." : "Salvar compromisso"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
