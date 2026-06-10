import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { agendaService, appointmentService, citizenService } from "../api/services";
import { type AgendaResponseDTO, type CitizenResponseDTO } from "../api/types";
import { AppointmentFormPanel, appointmentFormResolver, emptyAppointmentForm, type AppointmentFormData } from "../components/AppointmentFormPanel";

const toDateTimeInput = (value: string) => value.slice(0, 16);

export function AppointmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendas, setAgendas] = useState<AgendaResponseDTO[]>([]);
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [error, setError] = useState("");
  const form = useForm<AppointmentFormData>({ resolver: appointmentFormResolver, defaultValues: emptyAppointmentForm() });

  useEffect(() => {
    if (!id) return;
    Promise.all([appointmentService.getById(id), agendaService.list({ pageSize: 500 }), citizenService.list({ pageSize: 500 })])
      .then(([appointment, agendaData, citizenData]) => {
        setAgendas(agendaData);
        setCitizens(citizenData);
        form.reset({
          title: appointment.title,
          description: appointment.description ?? "",
          startAt: toDateTimeInput(appointment.startAt),
          endAt: toDateTimeInput(appointment.endAt),
          location: appointment.location ?? "",
          agendaId: appointment.agendaId,
          citizenId: appointment.citizenId ?? "",
          status: appointment.status,
        });
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [form, id]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!id) return;
    try {
      setError("");
      await appointmentService.update(id, { ...data, citizenId: data.citizenId || null });
      navigate(`/compromissos/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Editar compromisso</span><h1>Dados do compromisso</h1></div>
        <Link className="ghost-button" to={id ? `/compromissos/${id}` : "/compromissos"}><ArrowLeft size={18} /> Voltar</Link>
      </div>
      <AppointmentFormPanel form={form} mode="edit" agendas={agendas} citizens={citizens} error={error} onSubmit={onSubmit} onCancel={() => navigate(id ? `/compromissos/${id}` : "/compromissos")} />
    </section>
  );
}
