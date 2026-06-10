import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { demandService } from "../api/services";
import { demandPriorityLabel, demandStatusLabel, type DemandResponseByIdDTO } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { DetailField } from "../components/DetailField";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function DemandDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isVoter } = useAuth();
  const [demand, setDemand] = useState<DemandResponseByIdDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    demandService
      .getById(id)
      .then(setDemand)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!id) return;
    await demandService.delete(id);
    navigate("/demandas");
  };

  if (loading) return <LoadingState label="Carregando demanda..." />;
  if (error) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;
  if (!demand) return <EmptyState title="Demanda não encontrada" description="Não foi possível localizar esta solicitação." />;

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Demanda</span><h1>{demand.title}</h1></div>
        <div className="form-actions">
          <Link className="ghost-button" to="/demandas"><ArrowLeft size={18} /> Voltar</Link>
          {!isVoter && <Link className="primary-button" to={`/demandas/${demand.demandId}/editar`}><Edit size={18} /> Editar</Link>}
          {!isVoter && <button className="danger-button" type="button" onClick={remove}><Trash2 size={18} /> Excluir</button>}
        </div>
      </div>
      <div className="panel detail-grid">
        <DetailField label="Título" value={demand.title} />
        <DetailField label="Eleitor" value={demand.citizenName} />
        <DetailField label="Status" value={<StatusBadge tone={demand.status === 1 ? "blue" : demand.status === 2 ? "amber" : demand.status === 3 ? "green" : "slate"}>{demandStatusLabel[demand.status]}</StatusBadge>} />
        <DetailField label="Prioridade" value={<StatusBadge tone={demand.priority === 3 ? "red" : demand.priority === 2 ? "amber" : "green"}>{demandPriorityLabel[demand.priority]}</StatusBadge>} />
        <DetailField label="Criada em" value={new Date(demand.createdAt).toLocaleString("pt-BR")} />
        <DetailField label="Concluída em" value={demand.completedAt ? new Date(demand.completedAt).toLocaleString("pt-BR") : undefined} />
        <DetailField label="Descrição" value={demand.description} />
      </div>
    </section>
  );
}
