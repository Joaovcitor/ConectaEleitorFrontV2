import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { citizenService, demandService } from "../api/services";
import { type CitizenResponseDTO } from "../api/types";
import { DemandFormPanel, demandFormResolver, emptyDemandForm, type DemandFormData } from "../components/DemandFormPanel";

export function DemandEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [error, setError] = useState("");
  const form = useForm<DemandFormData>({ resolver: demandFormResolver, defaultValues: emptyDemandForm() });

  useEffect(() => {
    if (!id) return;
    Promise.all([demandService.getById(id), citizenService.list({ pageSize: 500 })])
      .then(([demand, citizenData]) => {
        setCitizens(citizenData);
        form.reset(demand);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [form, id]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!id) return;
    try {
      setError("");
      await demandService.update(id, data);
      navigate(`/demandas/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Editar demanda</span><h1>Atualizar atendimento</h1></div>
        <Link className="ghost-button" to={id ? `/demandas/${id}` : "/demandas"}><ArrowLeft size={18} /> Voltar</Link>
      </div>
      <DemandFormPanel
        form={form}
        mode="edit"
        citizens={citizens}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => navigate(id ? `/demandas/${id}` : "/demandas")}
      />
    </section>
  );
}
