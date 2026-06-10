import { ArrowLeft, CalendarClock, Edit, MapPin, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { appointmentService } from "../api/services";
import { appointmentStatusLabel, type AppointmentResponseByIdDTO } from "../api/types";
import { DetailField } from "../components/DetailField";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentResponseByIdDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    appointmentService.getById(id).then(setAppointment).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!id) return;
    await appointmentService.delete(id);
    navigate("/compromissos");
  };

  if (loading) return <LoadingState label="Carregando compromisso..." />;
  if (error) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;
  if (!appointment) return <EmptyState title="Compromisso não encontrado" description="Não foi possível localizar este compromisso." />;

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Compromisso</span><h1>{appointment.title}</h1></div>
        <div className="form-actions">
          <Link className="ghost-button" to="/compromissos"><ArrowLeft size={18} /> Voltar</Link>
          <Link className="primary-button" to={`/compromissos/${appointment.appointmentId}/editar`}><Edit size={18} /> Editar</Link>
          <button className="danger-button" type="button" onClick={remove}><Trash2 size={18} /> Excluir</button>
        </div>
      </div>
      <div className="appointment-overview">
        <div className="overview-card"><span><CalendarClock size={18} /></span><div><strong>{new Date(appointment.startAt).toLocaleString("pt-BR")}</strong><small>Início previsto</small></div></div>
        <div className="overview-card"><span><MapPin size={18} /></span><div><strong>{appointment.location || "Local não informado"}</strong><small>Local de realização</small></div></div>
        <div className="overview-card"><span><UserRound size={18} /></span><div><strong>{appointment.citizenName || "Sem eleitor vinculado"}</strong><small>Vínculo de atendimento</small></div></div>
      </div>
      <div className="panel detail-grid">
        <DetailField label="Título" value={appointment.title} />
        <DetailField label="Agenda" value={<Link to={`/agendas/${appointment.agendaId}`}>{appointment.agendaName}</Link>} />
        <DetailField label="Status" value={<StatusBadge tone={appointment.status === 1 ? "blue" : appointment.status === 2 ? "green" : "slate"}>{appointmentStatusLabel[appointment.status]}</StatusBadge>} />
        <DetailField label="Início" value={new Date(appointment.startAt).toLocaleString("pt-BR")} />
        <DetailField label="Fim" value={new Date(appointment.endAt).toLocaleString("pt-BR")} />
        <DetailField label="Local" value={appointment.location} />
        <DetailField label="Eleitor" value={appointment.citizenId ? <Link to={`/eleitores/${appointment.citizenId}`}>{appointment.citizenName}</Link> : undefined} />
        <DetailField label="Descrição" value={appointment.description} />
      </div>
    </section>
  );
}
