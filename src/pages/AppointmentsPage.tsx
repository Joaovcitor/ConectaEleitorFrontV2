import { Edit, Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { agendaService, appointmentService, citizenService } from "../api/services";
import { appointmentStatusLabel, type AgendaResponseDTO, type AppointmentResponseDTO, type CitizenResponseDTO } from "../api/types";
import { AppointmentFormPanel, appointmentFormResolver, emptyAppointmentForm, type AppointmentFormData } from "../components/AppointmentFormPanel";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function AppointmentsPage() {
  const [params, setParams] = useSearchParams();
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [agendas, setAgendas] = useState<AgendaResponseDTO[]>([]);
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const form = useForm<AppointmentFormData>({ resolver: appointmentFormResolver, defaultValues: emptyAppointmentForm() });
  const showForm = params.get("novo") === "1";

  const load = async () => {
    setLoading(true);
    const [appointmentData, agendaData, citizenData] = await Promise.all([appointmentService.list({ pageSize: 100 }), agendaService.list({ pageSize: 100 }), citizenService.list({ pageSize: 100 })]);
    setAppointments(appointmentData); setAgendas(agendaData); setCitizens(citizenData); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      const payload = { ...data, citizenId: data.citizenId || null };
      await appointmentService.create(payload);
      setFeedback("Compromisso criado com sucesso.");
      setParams({}); form.reset(emptyAppointmentForm()); await load();
    } catch (err) { setError(getErrorMessage(err)); }
  });

  const startCreate = () => {
    setFeedback("");
    setError("");
    form.reset(emptyAppointmentForm());
    setParams({ novo: "1" });
  };

  return (
    <section className="stack">
      <div className="page-heading"><div><span>Agenda institucional</span><h1>Compromissos</h1><p>Planeje atendimentos, reuniões e ações vinculadas às agendas.</p></div><button className="primary-button" type="button" onClick={startCreate}><Plus size={18} /> Novo compromisso</button></div>
      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
      {showForm && <AppointmentFormPanel form={form} mode="create" agendas={agendas} citizens={citizens} error={error} onSubmit={onSubmit} onCancel={() => { setParams({}); setError(""); form.reset(emptyAppointmentForm()); }} />}
      <div className="table-card">{loading ? <LoadingState label="Carregando compromissos..." /> : appointments.length === 0 ? <EmptyState title="Nenhum compromisso cadastrado" description="Crie compromissos para organizar a rotina de atendimento." /> : <table><thead><tr><th>Compromisso</th><th>Agenda</th><th>Data</th><th>Status</th><th>Eleitor</th><th>Ações</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.appointmentId}><td><strong><Link to={`/compromissos/${appointment.appointmentId}`}>{appointment.title}</Link></strong><span>{appointment.location || appointment.description}</span></td><td>{appointment.agendaName}</td><td>{new Date(appointment.startAt).toLocaleString("pt-BR")}</td><td><StatusBadge tone={appointment.status === 1 ? "blue" : appointment.status === 2 ? "green" : "slate"}>{appointmentStatusLabel[appointment.status]}</StatusBadge></td><td>{appointment.citizenName ?? "-"}</td><td className="row-actions"><Link title="Visualizar" to={`/compromissos/${appointment.appointmentId}`}><Eye size={17} /></Link><Link title="Editar" to={`/compromissos/${appointment.appointmentId}/editar`}><Edit size={17} /></Link></td></tr>)}</tbody></table>}</div>
    </section>
  );
}
