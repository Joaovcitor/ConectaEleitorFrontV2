import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../api/client";
import { agendaService } from "../api/services";

const schema = z.object({ name: z.string().min(3, "Informe o nome da agenda."), description: z.string().optional() });
type AgendaEditForm = z.infer<typeof schema>;

export function AgendaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm<AgendaEditForm>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });

  useEffect(() => {
    if (!id) return;
    agendaService.getById(id).then((agenda) => form.reset({ name: agenda.name, description: agenda.description ?? "" })).catch((err) => setError(getErrorMessage(err)));
  }, [form, id]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!id) return;
    try {
      setError("");
      await agendaService.update(id, data);
      navigate(`/agendas/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <section className="stack">
      <div className="page-heading">
        <div><span>Editar agenda</span><h1>Dados da agenda</h1></div>
        <Link className="ghost-button" to={id ? `/agendas/${id}` : "/agendas"}><ArrowLeft size={18} /> Voltar</Link>
      </div>
      <form className="panel form-grid" onSubmit={onSubmit}>
        <label>Nome<input {...form.register("name")} /><small>{form.formState.errors.name?.message}</small></label>
        <label>Descrição<textarea rows={4} {...form.register("description")} /></label>
        {error && <div className="alert error">{error}</div>}
        <div className="form-actions"><Link className="ghost-button" to={id ? `/agendas/${id}` : "/agendas"}>Cancelar</Link><button className="primary-button" type="submit">Salvar</button></div>
      </form>
    </section>
  );
}
