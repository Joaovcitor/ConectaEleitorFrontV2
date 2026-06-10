import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { citizenService, demandService } from "../api/services";
import { demandPriorityLabel, demandStatusLabel, type CitizenResponseDTO, type DemandResponseDTO } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { DemandFormPanel, demandFormResolver, emptyDemandForm, type DemandFormData } from "../components/DemandFormPanel";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function DemandsPage() {
  const [params, setParams] = useSearchParams();
  const { isVoter, user } = useAuth();
  const [demands, setDemands] = useState<DemandResponseDTO[]>([]);
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<DemandResponseDTO | null>(null);
  const showForm = params.get("novo") === "1" || Boolean(editing);
  const form = useForm<DemandFormData>({
    resolver: demandFormResolver,
    defaultValues: emptyDemandForm(isVoter ? user?.ownerId ?? "" : ""),
  });

  const load = async () => {
    setLoading(true);
    const demandData = isVoter && user?.ownerId ? await demandService.listByCitizen(user.ownerId, { pageSize: 100 }) : await demandService.list({ pageSize: 100 });
    setDemands(demandData);
    if (!isVoter) setCitizens(await citizenService.list({ pageSize: 100 }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [isVoter, user?.ownerId]);

  const startCreate = () => {
    setEditing(null);
    setError("");
    setFeedback("");
    form.reset(emptyDemandForm(isVoter ? user?.ownerId ?? "" : ""));
    setParams({ novo: "1" });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      if (editing) await demandService.update(editing.demandId, data);
      else await demandService.create({ title: data.title, description: data.description, priority: data.priority, citizenId: data.citizenId });
      setFeedback(editing ? "Demanda atualizada com sucesso." : "Demanda registrada com sucesso.");
      setEditing(null);
      setParams({});
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>{isVoter ? "Acompanhamento" : "Gestão"}</span>
          <h1>{isVoter ? "Minhas demandas" : "Demandas"}</h1>
          <p>{isVoter ? "Acompanhe suas solicitações e registre novas demandas." : "Monitore solicitações, prioridade e evolução dos atendimentos."}</p>
        </div>
        <button className="primary-button" type="button" onClick={startCreate}><Plus size={18} /> Nova demanda</button>
      </div>

      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
      {showForm && (
        <DemandFormPanel
          form={form}
          mode={editing ? "edit" : "create"}
          citizens={citizens}
          isVoter={isVoter}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => {
            setParams({});
            setEditing(null);
            setError("");
            form.reset(emptyDemandForm(isVoter ? user?.ownerId ?? "" : ""));
          }}
        />
      )}

      <div className="table-card">
        {loading ? <LoadingState label="Carregando demandas..." /> : demands.length === 0 ? <EmptyState title="Nenhuma demanda registrada" description="Quando houver solicitações, elas aparecerão aqui com status e prioridade." /> : (
          <table>
            <thead><tr><th>Demanda</th><th>Eleitor</th><th>Status</th><th>Prioridade</th><th>Criada em</th><th>Ações</th></tr></thead>
            <tbody>{demands.map((demand) => (
              <tr key={demand.demandId}>
                <td><strong>{demand.title}</strong><span>{demand.description}</span></td>
                <td>{demand.citizenName}</td>
                <td><StatusBadge tone={demand.status === 1 ? "blue" : demand.status === 2 ? "amber" : demand.status === 3 ? "green" : "slate"}>{demandStatusLabel[demand.status]}</StatusBadge></td>
                <td><StatusBadge tone={demand.priority === 3 ? "red" : demand.priority === 2 ? "amber" : "green"}>{demandPriorityLabel[demand.priority]}</StatusBadge></td>
                <td>{new Date(demand.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="row-actions">
                  <Link to={`/demandas/${demand.demandId}`}>Visualizar</Link>
                  {!isVoter && <Link to={`/demandas/${demand.demandId}/editar`}>Editar</Link>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
