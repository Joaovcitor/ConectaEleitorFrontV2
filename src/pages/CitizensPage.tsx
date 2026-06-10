import { Edit, Eye, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { citizenService } from "../api/services";
import { citizenTypeLabel, type CitizenCreateDTO, type CitizenResponseDTO } from "../api/types";
import { CitizenFormPanel, citizenFormResolver, emptyCitizenForm, type CitizenFormData } from "../components/CitizenFormPanel";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

const nullable = (value?: string) => value?.trim() || null;

function toCreatePayload(data: CitizenFormData): CitizenCreateDTO {
  return {
    fullName: data.fullName,
    nickname: nullable(data.nickname),
    cpf: nullable(data.cpf),
    voterRegistration: nullable(data.voterRegistration),
    birthDate: nullable(data.birthDate),
    phone: nullable(data.phone),
    whatsApp: nullable(data.whatsApp),
    zipCode: nullable(data.zipCode),
    street: nullable(data.street),
    number: nullable(data.number),
    complement: nullable(data.complement),
    neighborhood: nullable(data.neighborhood),
    district: nullable(data.district),
    city: nullable(data.city),
    state: nullable(data.state),
    electoralZone: nullable(data.electoralZone),
    electoralSection: nullable(data.electoralSection),
    notes: nullable(data.notes),
    type: data.type,
    leaderId: nullable(data.leaderId),
    userId: nullable(data.userId),
  };
}

export function CitizensPage() {
  const [params, setParams] = useSearchParams();
  const [citizens, setCitizens] = useState<CitizenResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const showForm = params.get("novo") === "1";
  const form = useForm<CitizenFormData>({ resolver: citizenFormResolver, defaultValues: emptyCitizenForm() });

  const load = async () => {
    setLoading(true);
    setCitizens(await citizenService.list({ pageSize: 100 }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return citizens.filter((citizen) =>
      [citizen.fullName, citizen.nickname, citizen.neighborhood, citizen.district, citizen.leaderName, citizenTypeLabel[citizen.type]]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [citizens, query]);

  const startCreate = () => {
    setError("");
    setFeedback("");
    form.reset(emptyCitizenForm());
    setParams({ novo: "1" });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setError("");
      await citizenService.create(toCreatePayload(data));
      setFeedback("Eleitor cadastrado com sucesso.");
      setParams({});
      form.reset(emptyCitizenForm());
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Cadastro</span>
          <h1>Eleitores</h1>
          <p>Gerencie contatos, lideranças, localização e vínculo eleitoral.</p>
        </div>
        <button className="primary-button" type="button" onClick={startCreate}>
          <Plus size={18} /> Novo eleitor
        </button>
      </div>

      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
      {showForm && (
        <CitizenFormPanel form={form} mode="create" error={error} onSubmit={onSubmit} onCancel={() => { setParams({}); setError(""); form.reset(emptyCitizenForm()); }} />
      )}

      <div className="toolbar">
        <Search size={18} />
        <input placeholder="Buscar por nome, bairro, distrito, liderança ou tipo" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <div className="table-card">
        {loading ? <LoadingState label="Carregando eleitores..." /> : filtered.length === 0 ? <EmptyState title="Nenhum eleitor encontrado" description="Ajuste a busca ou cadastre um novo eleitor para começar." /> : (
          <table>
            <thead><tr><th>Nome</th><th>Tipo</th><th>Bairro</th><th>Liderança</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map((citizen) => (
                <tr key={citizen.citizenId}>
                  <td><strong>{citizen.fullName}</strong><span>{citizen.phone ?? citizen.whatsApp}</span></td>
                  <td><StatusBadge tone="teal">{citizenTypeLabel[citizen.type]}</StatusBadge></td>
                  <td>{citizen.neighborhood ?? "-"}</td>
                  <td>{citizen.leaderName ?? "-"}</td>
                  <td><StatusBadge tone={citizen.isActive ? "green" : "slate"}>{citizen.isActive ? "Ativo" : "Inativo"}</StatusBadge></td>
                  <td className="row-actions">
                    <Link title="Visualizar" to={`/eleitores/${citizen.citizenId}`}><Eye size={17} /></Link>
                    <Link title="Editar" to={`/eleitores/${citizen.citizenId}/editar`}><Edit size={17} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
