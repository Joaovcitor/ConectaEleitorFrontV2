import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, ClipboardList, Flag, LoaderCircle, MessageSquareText, Save, UserRound, Workflow, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { DemandPriority, DemandStatus, demandPriorityLabel, demandStatusLabel, type CitizenResponseDTO } from "../api/types";

export const demandFormSchema = z.object({
  title: z.string().min(3, "Informe um título."),
  description: z.string().min(10, "Descreva a demanda com mais detalhes."),
  priority: z.coerce.number(),
  status: z.coerce.number(),
  citizenId: z.string().min(1, "Selecione o eleitor."),
});

export type DemandFormData = z.infer<typeof demandFormSchema>;

export const demandFormResolver = zodResolver(demandFormSchema);

export const emptyDemandForm = (citizenId = ""): DemandFormData => ({
  title: "",
  description: "",
  priority: DemandPriority.Medium,
  status: DemandStatus.Open,
  citizenId,
});

type DemandFormPanelProps = {
  form: UseFormReturn<DemandFormData>;
  mode: "create" | "edit";
  citizens: CitizenResponseDTO[];
  isVoter?: boolean;
  lockedCitizenName?: string;
  error?: string;
  onSubmit: () => void;
  onCancel: () => void;
};

const priorityOptions = [
  { value: DemandPriority.Low, label: demandPriorityLabel[DemandPriority.Low], description: "Pode seguir o fluxo ordinário de atendimento." },
  { value: DemandPriority.Medium, label: demandPriorityLabel[DemandPriority.Medium], description: "Precisa de acompanhamento ativo da equipe." },
  { value: DemandPriority.High, label: demandPriorityLabel[DemandPriority.High], description: "Exige atenção imediata e registro claro de encaminhamento." },
];

const statusOptions = [
  { value: DemandStatus.Open, label: demandStatusLabel[DemandStatus.Open], description: "Entrada registrada, ainda sem tratativa concluída." },
  { value: DemandStatus.InProgress, label: demandStatusLabel[DemandStatus.InProgress], description: "Atendimento em análise ou encaminhamento." },
  { value: DemandStatus.Resolved, label: demandStatusLabel[DemandStatus.Resolved], description: "Solicitação finalizada com retorno ao cidadão." },
  { value: DemandStatus.Canceled, label: demandStatusLabel[DemandStatus.Canceled], description: "Demanda cancelada ou encerrada sem andamento." },
];

const priorityTone = (priority: number) => (priority === DemandPriority.High ? "danger" : priority === DemandPriority.Medium ? "attention" : "calm");

export function DemandFormPanel({ form, mode, citizens, isVoter = false, lockedCitizenName, error, onSubmit, onCancel }: DemandFormPanelProps) {
  const selectedPriority = Number(form.watch("priority"));
  const selectedStatus = Number(form.watch("status"));
  const submitting = form.formState.isSubmitting;
  const hasLockedCitizen = Boolean(lockedCitizenName || isVoter);

  return (
    <form className="citizen-form" onSubmit={onSubmit}>
      <div className="form-command-center demand-command-center">
        <div>
          <span>{mode === "create" ? "Nova demanda" : "Atualização de demanda"}</span>
          <h2>{mode === "create" ? "Registro qualificado de atendimento" : "Painel de evolução do atendimento"}</h2>
          <p>Classifique prioridade, vínculo com eleitor, situação e relato para dar previsibilidade ao acompanhamento institucional.</p>
        </div>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Salvando..." : "Salvar demanda"}</button>
        </div>
      </div>

      <div className="citizen-form-layout">
        <aside className="form-rail">
          <div className="rail-card">
            <span><ClipboardList size={18} /></span>
            <strong>Triagem completa</strong>
            <p>Título curto, relato detalhado e vínculo com eleitor deixam o atendimento rastreável.</p>
          </div>
          <div className="rail-card">
            <span><AlertTriangle size={18} /></span>
            <strong>Prioridade visível</strong>
            <p>A equipe identifica rapidamente o que requer ação imediata.</p>
          </div>
          <div className="rail-card">
            <span><Workflow size={18} /></span>
            <strong>Evolução operacional</strong>
            <p>Status padronizado ajuda a acompanhar fila, andamento e resolução.</p>
          </div>
        </aside>

        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title"><MessageSquareText size={20} /><div><h3>Resumo da solicitação</h3><p>Use um título objetivo e descreva contexto, necessidade e encaminhamento esperado.</p></div></div>
            <div className="form-grid two-columns">
              <label className="form-field">Título<input {...form.register("title")} /><small>{form.formState.errors.title?.message}</small></label>
              {!hasLockedCitizen && <label className="form-field">Eleitor<select {...form.register("citizenId")}><option value="">Selecione</option>{citizens.map((citizen) => <option key={citizen.citizenId} value={citizen.citizenId}>{citizen.fullName}</option>)}</select><small>{form.formState.errors.citizenId?.message}</small></label>}
              <label className="form-field span-all">Descrição<textarea rows={6} {...form.register("description")} /><small>{form.formState.errors.description?.message}</small></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><Flag size={20} /><div><h3>Prioridade de atendimento</h3><p>Defina o nível de atenção para organizar a fila de trabalho.</p></div></div>
            <div className="type-segments demand-segments">
              {priorityOptions.map((option) => (
                <button className={`type-segment priority-${priorityTone(option.value)} ${selectedPriority === option.value ? "active" : ""}`} type="button" key={option.value} onClick={() => form.setValue("priority", option.value, { shouldDirty: true })}>
                  <span>{selectedPriority === option.value && <Check size={16} />}</span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </section>

          {mode === "edit" && (
            <section className="form-section">
              <div className="form-section-title"><Workflow size={20} /><div><h3>Status da demanda</h3><p>Atualize o estágio real do atendimento para manter a operação alinhada.</p></div></div>
              <div className="type-segments status-segments">
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

          {hasLockedCitizen && (
            <section className="form-section compact-section">
              <div className="form-section-title"><UserRound size={20} /><div><h3>Vínculo do eleitor</h3><p>A solicitação será registrada automaticamente para {lockedCitizenName || "o seu cadastro"}.</p></div></div>
            </section>
          )}

          {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

          <div className="form-footer">
            <button className="ghost-button" type="button" onClick={onCancel}><X size={18} /> Cancelar</button>
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Save size={18} />} {submitting ? "Salvando..." : "Salvar demanda"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
