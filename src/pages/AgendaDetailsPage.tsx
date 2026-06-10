import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { agendaService } from "../api/services";
import { appointmentStatusLabel, type AgendaResponseByIdDTO } from "../api/types";
import { DetailField } from "../components/DetailField";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function AgendaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState<AgendaResponseByIdDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    agendaService.getById(id).then(setAgenda).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!id) return;
    await agendaService.delete(id);
    navigate("/agendas");
  };

  if (loading) return <LoadingState label="Carregando agenda..." />;
  if (error) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;
  if (!agenda) return <EmptyState title="Agenda não encontrada" description="Não foi possível localizar esta agenda." />;

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Agenda</span><h1>{agenda.name}</h1></div>
        <div className="form-actions">
          <Link className="ghost-button" to="/agendas"><ArrowLeft size={18} /> Voltar</Link>
          <Link className="primary-button" to={`/agendas/${agenda.agendaId}/editar`}><Edit size={18} /> Editar</Link>
          <button className="danger-button" type="button" onClick={remove}><Trash2 size={18} /> Excluir</button>
        </div>
      </div>
      <div className="panel detail-grid">
        <DetailField label="Nome" value={agenda.name} />
        <DetailField label="Descrição" value={agenda.description} />
        <DetailField label="Total de compromissos" value={agenda.appointments.length} />
        <DetailField label="Criada em" value={new Date(agenda.createdAt).toLocaleString("pt-BR")} />
      </div>
      <div className="section-heading"><h2>Compromissos da agenda</h2></div>
      <div className="table-card">
        {agenda.appointments.length === 0 ? <EmptyState title="Nenhum compromisso vinculado" description="Os compromissos criados para esta agenda aparecerão aqui." /> : (
          <table>
            <thead><tr><th>Compromisso</th><th>Data</th><th>Status</th><th>Eleitor</th></tr></thead>
            <tbody>{agenda.appointments.map((appointment) => <tr key={appointment.appointmentId}><td><Link to={`/compromissos/${appointment.appointmentId}`}>{appointment.title}</Link><span>{appointment.location}</span></td><td>{new Date(appointment.startAt).toLocaleString("pt-BR")}</td><td><StatusBadge tone={appointment.status === 1 ? "blue" : appointment.status === 2 ? "green" : "slate"}>{appointmentStatusLabel[appointment.status]}</StatusBadge></td><td>{appointment.citizenName ?? "-"}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
