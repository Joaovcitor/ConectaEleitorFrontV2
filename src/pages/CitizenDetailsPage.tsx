import { Edit, Power, ArrowLeft, Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cepService } from "../api/cep";
import { getErrorMessage } from "../api/client";
import { citizenService, demandService } from "../api/services";
import { citizenTypeLabel, demandPriorityLabel, demandStatusLabel, type CitizenResponseByIdDTO, type DemandResponseDTO } from "../api/types";
import { DetailField } from "../components/DetailField";
import { DemandFormPanel, demandFormResolver, emptyDemandForm, type DemandFormData } from "../components/DemandFormPanel";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

export function CitizenDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<CitizenResponseByIdDTO | null>(null);
  const [demands, setDemands] = useState<DemandResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandsError, setDemandsError] = useState("");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [demandFeedback, setDemandFeedback] = useState("");
  const [demandFormError, setDemandFormError] = useState("");
  const demandForm = useForm<DemandFormData>({ resolver: demandFormResolver, defaultValues: emptyDemandForm(id ?? "") });

  const loadDemands = async (citizenId: string) => {
    setDemandsError("");
    setDemands(await demandService.listByCitizen(citizenId, { pageSize: 100 }));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    setDemandsError("");
    setDemandFeedback("");
    setDemandFormError("");
    demandForm.reset(emptyDemandForm(id));

    citizenService
      .getById(id)
      .then(async (citizenData) => {
        let enrichedCitizen = citizenData;
        if (citizenData.zipCode && (!citizenData.city || !citizenData.state)) {
          try {
            const address = await cepService.lookup(citizenData.zipCode);
            enrichedCitizen = {
              ...citizenData,
              street: citizenData.street || address.street,
              neighborhood: citizenData.neighborhood || address.neighborhood,
              city: citizenData.city || address.city,
              state: citizenData.state || address.state,
            };
          } catch {
            enrichedCitizen = citizenData;
          }
        }

        setCitizen(enrichedCitizen);
        try {
          await loadDemands(id);
        } catch (err) {
          setDemandsError(getErrorMessage(err));
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const deactivate = async () => {
    if (!id || !citizen) return;
    await citizenService.update(id, { ...citizen, isActive: false });
    navigate("/eleitores");
  };

  const startDemandCreate = () => {
    if (!id) return;
    setDemandFeedback("");
    setDemandFormError("");
    demandForm.reset(emptyDemandForm(id));
    setShowDemandForm(true);
  };

  const createDemand = demandForm.handleSubmit(async (data) => {
    if (!id) return;
    try {
      setDemandFormError("");
      await demandService.create({ title: data.title, description: data.description, priority: data.priority, citizenId: id });
      setDemandFeedback("Demanda registrada para este eleitor.");
      setShowDemandForm(false);
      demandForm.reset(emptyDemandForm(id));
      await loadDemands(id);
    } catch (err) {
      setDemandFormError(getErrorMessage(err));
    }
  });

  if (loading) return <LoadingState label="Carregando eleitor..." />;
  if (error) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;
  if (!citizen) return <EmptyState title="Eleitor não encontrado" description="Não foi possível localizar este cadastro." />;

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Eleitor</span>
          <h1>{citizen.fullName}</h1>
        </div>
        <div className="form-actions">
          <Link className="ghost-button" to="/eleitores"><ArrowLeft size={18} /> Voltar</Link>
          <Link className="primary-button" to={`/eleitores/${citizen.citizenId}/editar`}><Edit size={18} /> Editar</Link>
          {citizen.isActive && <button className="danger-button" type="button" onClick={deactivate}><Power size={18} /> Desativar</button>}
        </div>
      </div>

      <div className="panel detail-grid">
        <DetailField label="Nome completo" value={citizen.fullName} />
        <DetailField label="Apelido" value={citizen.nickname} />
        <DetailField label="CPF" value={citizen.cpf} />
        <DetailField label="Título de eleitor" value={citizen.voterRegistration} />
        <DetailField label="Nascimento" value={citizen.birthDate ? new Date(citizen.birthDate).toLocaleDateString("pt-BR") : undefined} />
        <DetailField label="Tipo" value={<StatusBadge tone="teal">{citizenTypeLabel[citizen.type]}</StatusBadge>} />
        <DetailField label="Telefone" value={citizen.phone} />
        <DetailField label="WhatsApp" value={citizen.whatsApp} />
        <DetailField label="Liderança" value={citizen.leaderName} />
        <DetailField label="Status" value={<StatusBadge tone={citizen.isActive ? "green" : "slate"}>{citizen.isActive ? "Ativo" : "Inativo"}</StatusBadge>} />
        <DetailField label="Endereço" value={[citizen.street, citizen.number, citizen.complement].filter(Boolean).join(", ")} />
        <DetailField label="Bairro" value={citizen.neighborhood} />
        <DetailField label="Distrito" value={citizen.district} />
        <DetailField label="Cidade" value={citizen.city} />
        <DetailField label="Estado" value={citizen.state} />
        <DetailField label="Zona eleitoral" value={citizen.electoralZone} />
        <DetailField label="Seção eleitoral" value={citizen.electoralSection} />
        <DetailField label="Notas" value={citizen.notes} />
      </div>

      {demandFeedback && <div className="alert success"><strong>Sucesso</strong><span>{demandFeedback}</span></div>}

      <div className="section-heading">
        <div>
          <h2>Demandas vinculadas</h2>
          <p>Consulte solicitações existentes ou registre uma nova demanda já conectada a este eleitor.</p>
        </div>
        <button className="primary-button" type="button" onClick={startDemandCreate}><Plus size={18} /> Nova demanda</button>
      </div>

      {showDemandForm && (
        <DemandFormPanel
          form={demandForm}
          mode="create"
          citizens={[]}
          lockedCitizenName={citizen.fullName}
          error={demandFormError}
          onSubmit={createDemand}
          onCancel={() => {
            setShowDemandForm(false);
            setDemandFormError("");
            demandForm.reset(emptyDemandForm(id ?? ""));
          }}
        />
      )}

      <div className="table-card">
        {demandsError ? <div className="alert error"><strong>Erro</strong><span>{demandsError}</span></div> : demands.length === 0 ? <EmptyState title="Nenhuma demanda vinculada" description="Este eleitor ainda não possui demandas registradas." /> : (
          <table>
            <thead><tr><th>Título</th><th>Status</th><th>Prioridade</th><th>Criada em</th><th>Ações</th></tr></thead>
            <tbody>{demands.map((demand) => <tr key={demand.demandId}><td><strong><Link to={`/demandas/${demand.demandId}`}>{demand.title}</Link></strong><span>{demand.description}</span></td><td><StatusBadge tone={demand.status === 1 ? "blue" : demand.status === 2 ? "amber" : demand.status === 3 ? "green" : "slate"}>{demandStatusLabel[demand.status]}</StatusBadge></td><td><StatusBadge tone={demand.priority === 3 ? "red" : demand.priority === 2 ? "amber" : "green"}>{demandPriorityLabel[demand.priority]}</StatusBadge></td><td>{new Date(demand.createdAt).toLocaleDateString("pt-BR")}</td><td className="row-actions"><Link title="Visualizar demanda" to={`/demandas/${demand.demandId}`}><Eye size={17} /></Link></td></tr>)}</tbody>
          </table>
        )}
      </div>

      {citizen.ledCitizens.length > 0 && (
        <>
          <div className="section-heading"><h2>Eleitores liderados</h2></div>
          <div className="card-grid">{citizen.ledCitizens.map((led) => <Link className="item-card" key={led.citizenId} to={`/eleitores/${led.citizenId}`}><h3>{led.fullName}</h3><p>{led.neighborhood || "Bairro não informado"}</p></Link>)}</div>
        </>
      )}
    </section>
  );
}
