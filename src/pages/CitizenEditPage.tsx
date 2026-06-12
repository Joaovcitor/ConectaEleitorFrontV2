import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { citizenService } from "../api/services";
import { type CitizenResponseByIdDTO } from "../api/types";
import { CitizenFormPanel, citizenFormResolver, emptyCitizenForm, type CitizenFormData } from "../components/CitizenFormPanel";

const normalize = (value?: string | null) => value ?? "";
const nullable = (value?: string) => value?.trim() || null;
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : "");

function toForm(citizen: CitizenResponseByIdDTO): CitizenFormData {
  return {
    fullName: citizen.fullName,
    nickname: normalize(citizen.nickname),
    cpf: normalize(citizen.cpf),
    voterRegistration: normalize(citizen.voterRegistration),
    birthDate: toDateInput(citizen.birthDate),
    phone: normalize(citizen.phone),
    whatsApp: normalize(citizen.whatsApp),
    zipCode: normalize(citizen.zipCode),
    street: normalize(citizen.street),
    number: normalize(citizen.number),
    complement: normalize(citizen.complement),
    neighborhood: normalize(citizen.neighborhood),
    district: normalize(citizen.district),
    city: normalize(citizen.city),
    state: normalize(citizen.state),
    electoralZone: normalize(citizen.electoralZone),
    electoralSection: normalize(citizen.electoralSection),
    notes: normalize(citizen.notes),
    type: citizen.type,
    leaderId: normalize(citizen.leaderId),
    isActive: citizen.isActive,
  };
}

export function CitizenEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm<CitizenFormData>({ resolver: citizenFormResolver, defaultValues: emptyCitizenForm() });

  useEffect(() => {
    if (!id) return;
    citizenService.getById(id).then((citizen) => form.reset(toForm(citizen))).catch((err) => setError(getErrorMessage(err)));
  }, [form, id]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!id) return;
    try {
      setError("");
      await citizenService.update(id, {
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
        isActive: data.isActive ?? true,
      });
      navigate(`/eleitores/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Editar eleitor</span><h1>Dados cadastrais</h1></div>
        <Link className="ghost-button" to={id ? `/eleitores/${id}` : "/eleitores"}><ArrowLeft size={18} /> Voltar</Link>
      </div>
      <CitizenFormPanel form={form} mode="edit" error={error} onSubmit={onSubmit} onCancel={() => navigate(id ? `/eleitores/${id}` : "/eleitores")} />
    </section>
  );
}
