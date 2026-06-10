import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../api/client";
import { agendaService } from "../api/services";
import type { AgendaResponseDTO } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";

const schema = z.object({ name: z.string().min(3, "Informe o nome da agenda."), description: z.string().optional() });
type AgendaForm = z.infer<typeof schema>;

export function AgendasPage() {
  const [params, setParams] = useSearchParams();
  const [agendas, setAgendas] = useState<AgendaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AgendaResponseDTO | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const form = useForm<AgendaForm>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });
  const showForm = params.get("novo") === "1" || Boolean(editing);

  const load = async () => { setLoading(true); setAgendas(await agendaService.list({ pageSize: 100 })); setLoading(false); };
  useEffect(() => { load(); }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      if (editing) await agendaService.update(editing.agendaId, data);
      else await agendaService.create(data);
      setFeedback(editing ? "Agenda atualizada com sucesso." : "Agenda criada com sucesso.");
      setEditing(null); setParams({}); form.reset(); await load();
    } catch (err) { setError(getErrorMessage(err)); }
  });

  return (
    <section className="stack">
      <div className="page-heading"><div><span>Organização</span><h1>Agendas</h1><p>Estruture compromissos por tema, equipe ou período de atuação.</p></div><button className="primary-button" onClick={() => setParams({ novo: "1" })}><Plus size={18} /> Nova agenda</button></div>
      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
      {showForm && <form className="panel form-grid" onSubmit={onSubmit}><label>Nome<input {...form.register("name")} /><small>{form.formState.errors.name?.message}</small></label><label>Descrição<textarea rows={3} {...form.register("description")} /></label>{error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}<div className="form-actions"><button className="ghost-button" type="button" onClick={() => { setParams({}); setEditing(null); }}>Cancelar</button><button className="primary-button" type="submit">Salvar</button></div></form>}
      <div className="card-grid">{loading ? <LoadingState label="Carregando agendas..." /> : agendas.length === 0 ? <EmptyState title="Nenhuma agenda cadastrada" description="Crie uma agenda para agrupar compromissos e atendimentos." /> : agendas.map((agenda) => <article className="item-card" key={agenda.agendaId}><div><h3><Link to={`/agendas/${agenda.agendaId}`}>{agenda.name}</Link></h3><p>{agenda.description || "Sem descrição informada."}</p></div><span className="card-meta">{agenda.totalAppointments} compromissos</span><div className="row-actions"><Link title="Editar" to={`/agendas/${agenda.agendaId}/editar`}><Edit size={17} /></Link><button title="Excluir" onClick={async () => { await agendaService.delete(agenda.agendaId); setFeedback("Agenda excluída com sucesso."); await load(); }}><Trash2 size={17} /></button></div></article>)}</div>
    </section>
  );
}
