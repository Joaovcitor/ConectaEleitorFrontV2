import { ArrowLeft, CalendarCheck, Check, CreditCard, Edit, Eye, Infinity, Plus, RefreshCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { adminPaymentTransactionService, adminSubscriptionService, paymentTransactionService, planService, planUsageService, subscriptionService } from "../api/services";
import {
  BillingCycle,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PlanLimitType,
  SubscriptionStatus,
  billingCycleLabel,
  paymentMethodLabel,
  paymentProviderLabel,
  paymentStatusLabel,
  planLimitTypeLabel,
  subscriptionActionLabel,
  subscriptionStatusLabel,
  type AdminChangeOwnerPlanDTO,
  type ManualAssignPlanDTO,
  type OwnerSubscriptionResponseDTO,
  type PagedResult,
  type PaymentTransactionFilterDTO,
  type PaymentTransactionResponseDTO,
  type PlanCreateDTO,
  type PlanFeatureCreateDTO,
  type PlanLimitCreateDTO,
  type PlanResponseDTO,
  type PlanUpdateDTO,
  type PlanUsageResponseDTO,
} from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

type Tab = "plans" | "subscription" | "usage" | "payments" | "admin-subscriptions" | "admin-payments";
type PlanFormState = Omit<PlanCreateDTO, "monthlyPrice" | "yearlyPrice"> & { monthlyPrice: string; yearlyPrice: string };

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = (value?: string | null) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-");
const dateTime = (value?: string | null) => (value ? new Date(value).toLocaleString("pt-BR") : "-");
const money = (value?: number | null) => brl.format(value ?? 0);
const planId = (plan: PlanResponseDTO) => plan.planId;
const subscriptionId = (subscription: OwnerSubscriptionResponseDTO) => subscription.ownerSubscriptionId;
const paymentId = (payment: PaymentTransactionResponseDTO) => payment.paymentTransactionId;
const emptyPaged = <T,>(): PagedResult<T> => ({ items: [], totalItems: 0, pageNumber: 1, pageSize: 10 });
const fieldNumber = (value: string) => Number(value.replace(",", ".")) || 0;
const optionalNumber = (value: string) => value.trim() ? fieldNumber(value) : null;
const storageMb = (bytes: number) => Math.round(bytes / 1024 / 1024);

const limitKeys = [
  { type: PlanLimitType.Users, usage: "usersCount" },
  { type: PlanLimitType.Voters, usage: "votersCount" },
  { type: PlanLimitType.Leaders, usage: "leadersCount" },
  { type: PlanLimitType.Demands, usage: "demandsCount" },
  { type: PlanLimitType.Appointments, usage: "appointmentsCount" },
  { type: PlanLimitType.FileStorageMb, usage: "storageUsedBytes" },
  { type: PlanLimitType.Reports, usage: "reportsGeneratedCount" },
  { type: PlanLimitType.Exports, usage: "exportsGeneratedCount" },
] as const;

const starterFeatures: PlanFeatureCreateDTO[] = [
  { name: "Gestão de eleitores", key: "voters", description: "Cadastro com liderança, território e histórico.", isEnabled: true },
  { name: "Demandas e compromissos", key: "demands-appointments", description: "Fluxo para solicitações e agenda institucional.", isEnabled: true },
];

const starterLimits: PlanLimitCreateDTO[] = limitKeys.map(({ type }) => ({ type, value: type === PlanLimitType.FileStorageMb ? 1024 : 100, isUnlimited: false }));

const emptyPlanForm = (): PlanFormState => ({
  name: "",
  slug: "",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  isActive: true,
  isPublic: true,
  displayOrder: 0,
  features: starterFeatures,
  limits: starterLimits,
});

function statusTone(status: number) {
  if ([SubscriptionStatus.Active, SubscriptionStatus.Trial, PaymentStatus.Paid].includes(status)) return "green";
  if ([SubscriptionStatus.PastDue, PaymentStatus.Pending, PaymentStatus.WaitingPayment].includes(status)) return "amber";
  if ([SubscriptionStatus.Canceled, PaymentStatus.Failed].includes(status)) return "red";
  return "slate";
}

function paymentTone(status: number) {
  if (status === PaymentStatus.Paid) return "green";
  if (status === PaymentStatus.Pending || status === PaymentStatus.WaitingPayment) return "amber";
  if (status === PaymentStatus.Failed) return "red";
  return "slate";
}

function PlanForm({ initial, onSave, onCancel }: { initial?: PlanResponseDTO; onSave: (data: PlanCreateDTO) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<PlanFormState>(() => initial ? {
    name: initial.name,
    slug: initial.slug,
    description: initial.description ?? "",
    monthlyPrice: String(initial.monthlyPrice ?? ""),
    yearlyPrice: String(initial.yearlyPrice ?? ""),
    isActive: initial.isActive,
    isPublic: initial.isPublic,
    displayOrder: initial.displayOrder,
    features: initial.features?.length ? initial.features : starterFeatures,
    limits: initial.limits?.length ? initial.limits : starterLimits,
  } : emptyPlanForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await onSave({ ...form, monthlyPrice: fieldNumber(form.monthlyPrice), yearlyPrice: optionalNumber(form.yearlyPrice) });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel form-grid">
      <div className="form-section-title"><CreditCard size={20} /><div><h3>{initial ? "Editar plano" : "Novo plano"}</h3><p>Configure preço, recursos e limites comerciais do plano.</p></div></div>
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      <div className="form-grid two-columns">
        <label>Nome<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
        <label>Slug<input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} /></label>
        <label>Preço mensal<input inputMode="decimal" value={form.monthlyPrice} onChange={(event) => setForm((current) => ({ ...current, monthlyPrice: event.target.value }))} /></label>
        <label>Preço anual<input inputMode="decimal" value={form.yearlyPrice} onChange={(event) => setForm((current) => ({ ...current, yearlyPrice: event.target.value }))} /></label>
        <label>Ordem de exibição<input inputMode="numeric" value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) || 0 }))} /></label>
        <label className="span-all">Descrição<textarea rows={3} value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
        <label className="checkbox-card span-all"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /><span><strong>Plano ativo</strong><small>Disponível para contratação e troca de plano.</small></span></label>
        <label className="checkbox-card span-all"><input type="checkbox" checked={form.isPublic} onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))} /><span><strong>Plano público</strong><small>Aparece na vitrine pública de planos.</small></span></label>
      </div>
      <div className="form-grid">
        {(form.features ?? []).map((feature, index) => (
          <div className="form-grid two-columns limit-editor" key={`${feature.key}-${index}`}>
            <label>Feature<input value={feature.name} onChange={(event) => setForm((current) => ({ ...current, features: current.features.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} /></label>
            <label>Chave<input value={feature.key} onChange={(event) => setForm((current) => ({ ...current, features: current.features.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item) }))} /></label>
            <label className="span-all">Descrição<input value={feature.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, features: current.features.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))} /></label>
          </div>
        ))}
      </div>
      <div className="plan-editor-grid">
        {form.limits.map((limit, index) => (
          <div className="limit-editor" key={limit.type}>
            <strong>{planLimitTypeLabel[limit.type]}</strong>
            <label><input type="checkbox" checked={limit.isUnlimited} onChange={(event) => setForm((current) => ({ ...current, limits: current.limits.map((item, itemIndex) => itemIndex === index ? { ...item, isUnlimited: event.target.checked } : item) }))} /> Ilimitado</label>
            <input disabled={limit.isUnlimited} inputMode="numeric" value={limit.value ?? ""} onChange={(event) => setForm((current) => ({ ...current, limits: current.limits.map((item, itemIndex) => itemIndex === index ? { ...item, value: Number(event.target.value) || 0 } : item) }))} />
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button className="ghost-button" type="button" onClick={onCancel}>Cancelar</button>
        <button className="primary-button" type="button" disabled={saving} onClick={save}>{saving ? "Salvando..." : "Salvar plano"}</button>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  canManage,
  isCurrent,
  onEdit,
  onRefresh,
  onSubscribe,
}: {
  plan: PlanResponseDTO;
  canManage: boolean;
  isCurrent?: boolean;
  onEdit: (plan: PlanResponseDTO) => void;
  onRefresh: () => Promise<void>;
  onSubscribe?: (plan: PlanResponseDTO) => void;
}) {
  const id = planId(plan);
  const toggle = async () => {
    if (!id) return;
    if (!confirm(`${plan.isActive ? "Desativar" : "Ativar"} o plano ${plan.name}?`)) return;
    if (plan.isActive) await planService.deactivate(id);
    else await planService.activate(id);
    await onRefresh();
  };
  const remove = async () => {
    if (!id || !confirm(`Excluir o plano ${plan.name}? Essa ação não pode ser desfeita.`)) return;
    await planService.delete(id);
    await onRefresh();
  };

  return (
    <article className="plan-card">
      <div className="plan-card-top">
        <span className="plan-badge">{plan.isActive ? "Ativo" : "Inativo"} · {plan.isPublic ? "Público" : "Privado"}</span>
        <div><h2>{plan.name}</h2><p>{plan.description || "Sem descrição."}</p></div>
      </div>
      <div className="plan-price"><strong>{money(plan.monthlyPrice)}</strong><span>/mês</span><small>{plan.yearlyPrice ? `${money(plan.yearlyPrice)} por ano` : "Sem preço anual"}</small></div>
      <div className="plan-limits">
        {(plan.limits ?? []).slice(0, 4).map((limit) => (
          <div key={limit.type}>
            <span>{limit.isUnlimited ? <Infinity size={18} /> : <ShieldCheck size={18} />}</span>
            <strong>{limit.isUnlimited ? "Ilimitado" : limit.value ?? 0}</strong>
            <small>{planLimitTypeLabel[limit.type] ?? "Limite"}</small>
          </div>
        ))}
      </div>
      <div className="plan-features">
        {(plan.features ?? []).slice(0, 4).map((feature) => (
          <div key={feature.name}><Check size={18} /><span><strong>{feature.name}</strong><small>{feature.description}</small></span></div>
        ))}
      </div>
      {canManage && (
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => onEdit(plan)}><Edit size={18} /> Editar</button>
          <button className="ghost-button" type="button" onClick={toggle}>{plan.isActive ? "Desativar" : "Ativar"}</button>
          <button className="danger-button" type="button" onClick={remove}><Trash2 size={18} /> Excluir</button>
        </div>
      )}
      {!canManage && onSubscribe && (
        <button className={isCurrent ? "ghost-button" : "primary-button"} type="button" disabled={isCurrent} onClick={() => onSubscribe(plan)}>
          {isCurrent ? "Plano atual" : "Escolher plano"}
        </button>
      )}
    </article>
  );
}

function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<OwnerSubscriptionResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setSubscription(await subscriptionService.active());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  if (loading) return <LoadingState label="Carregando assinatura..." />;
  if (error && !subscription) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;

  return (
    <div className="stack">
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      <article className="panel detail-grid">
        <div className="section-heading span-all"><div><h2>Assinatura atual</h2><p>Plano, status, ciclo e período vigente do tenant logado.</p></div><CreditCard size={22} /></div>
        {subscription ? (
          <>
            <div className="detail-field"><span>Plano</span><strong>{subscription.plan?.name ?? subscription.planId}</strong></div>
            <div className="detail-field"><span>Status</span><strong><StatusBadge tone={statusTone(subscription.status)}>{subscriptionStatusLabel[subscription.status] ?? subscription.status}</StatusBadge></strong></div>
            <div className="detail-field"><span>Ciclo</span><strong>{billingCycleLabel[subscription.billingCycle] ?? subscription.billingCycle}</strong></div>
            <div className="detail-field"><span>Iniciada em</span><strong>{date(subscription.startedAt)}</strong></div>
            <div className="detail-field"><span>Período atual</span><strong>{date(subscription.currentPeriodStart)} a {date(subscription.currentPeriodEnd)}</strong></div>
            <div className="detail-field"><span>Trial até</span><strong>{date(subscription.trialEndsAt)}</strong></div>
            <div className="detail-field"><span>Cancelada em</span><strong>{date(subscription.canceledAt)}</strong></div>
            <div className="detail-field"><span>Motivo</span><strong>{subscription.cancelReason ?? "-"}</strong></div>
          </>
        ) : <EmptyState title="Sem assinatura ativa" description="Crie uma assinatura para o tenant logado usando um dos planos disponíveis." />}
      </article>
      {subscription?.history?.length ? (
        <div className="table-card">
          <table><thead><tr><th>Data</th><th>Ação</th><th>Plano</th><th>Status</th><th>Motivo</th></tr></thead><tbody>
            {subscription.history.map((item) => (
              <tr key={item.subscriptionHistoryId}>
                <td>{dateTime(item.createdAt)}</td><td>{subscriptionActionLabel[item.action] ?? item.action}</td><td>{item.oldPlanId ?? "-"} → {item.newPlanId ?? "-"}</td><td>{item.changedByUserId ?? "-"}</td><td>{item.description ?? "-"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      ) : <EmptyState title="Sem histórico de assinatura" description="Alterações de plano e status aparecerão aqui." />}
    </div>
  );
}

function UsagePanel({ subscription }: { subscription: OwnerSubscriptionResponseDTO | null }) {
  const [usage, setUsage] = useState<PlanUsageResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const load = async (customMonth?: string) => {
    try {
      setLoading(true);
      setError("");
      if (customMonth) {
        const [year, monthValue] = customMonth.split("-").map(Number);
        setUsage(await planUsageService.byMonth(year, monthValue));
      } else {
        setUsage(await planUsageService.current());
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const limitFor = (type: number) => subscription?.plan?.limits?.find((limit) => limit.type === type);

  return (
    <div className="stack">
      <div className="toolbar">
        <CalendarCheck size={18} />
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        <button className="ghost-button" type="button" onClick={() => load(month)}>Consultar</button>
        <button className="ghost-button" type="button" onClick={() => load()}>Uso atual</button>
      </div>
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      {loading ? <LoadingState label="Carregando uso do plano..." /> : !usage ? <EmptyState title="Uso não encontrado" description="Não há consumo registrado para o período." /> : (
        <div className="usage-grid">
          {limitKeys.map(({ type, usage: usageKey }) => {
            const rawValue = usage[usageKey] ?? 0;
            const value = type === PlanLimitType.FileStorageMb ? storageMb(rawValue) : rawValue;
            const limit = limitFor(type);
            const unlimited = limit?.isUnlimited;
            const max = limit?.value ?? 0;
            const percent = unlimited || max <= 0 ? 100 : Math.min(100, Math.round((value / max) * 100));
            const suffix = type === PlanLimitType.FileStorageMb ? " MB" : "";
            return (
              <article className="usage-card" key={type}>
                <div><strong>{planLimitTypeLabel[type]}</strong><span>{unlimited ? "Ilimitado" : `${value}${suffix} de ${max}${suffix}`}</span></div>
                <div className="report-progress"><span style={{ width: `${percent}%` }} /></div>
                <small>{unlimited ? `${value}${suffix} utilizados sem limite contratado` : `${percent}% do limite consumido`}</small>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaymentsPanel() {
  const [payments, setPayments] = useState<PagedResult<PaymentTransactionResponseDTO>>(emptyPaged);
  const [filters, setFilters] = useState<PaymentTransactionFilterDTO>({ pageNumber: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (next = filters) => {
    try {
      setLoading(true);
      setError("");
      setPayments(await paymentTransactionService.list(next));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filters); }, [filters]);
  const setFilter = (next: Partial<PaymentTransactionFilterDTO>) => setFilters((current) => ({ ...current, ...next, pageNumber: 1 }));

  const total = payments.totalItems ?? payments.items?.length ?? 0;
  const page = payments.pageNumber ?? filters.pageNumber ?? 1;
  const pageSize = payments.pageSize ?? filters.pageSize ?? 10;

  return (
    <div className="stack">
      <div className="report-filter-panel">
        <div className="form-section-title"><Search size={20} /><div><h3>Filtros de pagamentos</h3><p>Consulte pagamentos por status, provider, método, período e assinatura.</p></div></div>
        <div className="report-filter-grid">
          <label>Status<select value={filters.status ?? ""} onChange={(event) => setFilter({ status: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Provider<select value={filters.provider ?? ""} onChange={(event) => setFilter({ provider: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentProviderLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Método<select value={filters.paymentMethod ?? ""} onChange={(event) => setFilter({ paymentMethod: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentMethodLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Início<input type="date" value={filters.startDate ?? ""} onChange={(event) => setFilter({ startDate: event.target.value || undefined })} /></label>
          <label>Fim<input type="date" value={filters.endDate ?? ""} onChange={(event) => setFilter({ endDate: event.target.value || undefined })} /></label>
          <label>Assinatura<input value={filters.subscriptionId ?? ""} onChange={(event) => setFilter({ subscriptionId: event.target.value || undefined })} /></label>
        </div>
        <div className="form-actions"><button className="ghost-button" type="button" onClick={() => setFilters({ pageNumber: 1, pageSize: 10 })}>Limpar</button></div>
      </div>
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      <div className="table-card">
        {loading ? <LoadingState label="Carregando pagamentos..." /> : !payments.items?.length ? <EmptyState title="Nenhum pagamento encontrado" description="Ajuste os filtros ou crie um pagamento manual." /> : (
          <table><thead><tr><th>Pagamento</th><th>Status</th><th>Provider</th><th>Método</th><th>Valor</th><th>Vencimento</th><th>Pago em</th></tr></thead><tbody>
            {payments.items.map((payment) => (
              <tr key={paymentId(payment)}>
                <td><strong>{payment.plan?.name ?? payment.planId}</strong><span>{paymentId(payment)}</span></td>
                <td><StatusBadge tone={paymentTone(payment.status)}>{paymentStatusLabel[payment.status] ?? payment.status}</StatusBadge></td>
                <td>{paymentProviderLabel[payment.provider] ?? payment.provider}</td>
                <td>{paymentMethodLabel[payment.paymentMethod] ?? payment.paymentMethod}</td>
                <td>{money(payment.amount)}</td>
                <td>{date(payment.dueDate)}</td>
                <td>{date(payment.paidAt)}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
      <div className="pagination-bar"><span>{total} registros</span><div><button className="ghost-button" disabled={page <= 1} onClick={() => setFilters((current) => ({ ...current, pageNumber: page - 1 }))}><ArrowLeft size={18} /> Anterior</button><strong>Página {page}</strong><button className="ghost-button" disabled={page * pageSize >= total} onClick={() => setFilters((current) => ({ ...current, pageNumber: page + 1 }))}>Próxima</button></div></div>
    </div>
  );
}

function AdminSubscriptionsPanel({ plans }: { plans: PlanResponseDTO[] }) {
  const [subscriptions, setSubscriptions] = useState<PagedResult<OwnerSubscriptionResponseDTO>>(emptyPaged);
  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignForm, setAssignForm] = useState<ManualAssignPlanDTO>({
    ownerId: "",
    planId: "",
    billingCycle: BillingCycle.Monthly,
    currentPeriodStart: new Date().toISOString().slice(0, 10),
    currentPeriodEnd: "",
    trialEndsAt: "",
    notes: "",
  });

  useEffect(() => {
    if (plans[0] && !assignForm.planId) setAssignForm((current) => ({ ...current, planId: planId(plans[0]) }));
  }, [assignForm.planId, plans]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setSubscriptions(ownerId.trim() ? await adminSubscriptionService.byOwner(ownerId.trim(), { pageSize: 20 }) : await adminSubscriptionService.list({ pageSize: 20 }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!assignForm.ownerId || !assignForm.planId) return setError("Informe ownerId e plano.");
    await adminSubscriptionService.assignPlan({
      ...assignForm,
      currentPeriodStart: assignForm.currentPeriodStart || null,
      currentPeriodEnd: assignForm.currentPeriodEnd || null,
      trialEndsAt: assignForm.trialEndsAt || null,
      notes: assignForm.notes || null,
    });
    await load();
  };

  const changePlan = async (subscription: OwnerSubscriptionResponseDTO) => {
    const newPlanId = prompt("Informe o ID do novo plano.");
    if (!newPlanId) return;
    const reason = prompt("Informe o motivo da troca.");
    if (reason === null) return;
    const payload: AdminChangeOwnerPlanDTO = { ownerId: subscription.ownerId, newPlanId, billingCycle: subscription.billingCycle, reason };
    await adminSubscriptionService.changeOwnerPlan(payload);
    await load();
  };

  const statusAction = async (subscription: OwnerSubscriptionResponseDTO, action: "cancel" | "suspend" | "reactivate") => {
    const label = action === "cancel" ? "cancelar" : action === "suspend" ? "suspender" : "reativar";
    if (!confirm(`Deseja ${label} a assinatura deste owner?`)) return;
    const reason = prompt("Informe o motivo.");
    if (reason === null) return;
    if (action === "cancel") await adminSubscriptionService.cancelOwnerSubscription({ ownerId: subscription.ownerId, reason });
    if (action === "suspend") await adminSubscriptionService.suspendOwnerSubscription({ ownerId: subscription.ownerId, reason });
    if (action === "reactivate") await adminSubscriptionService.reactivateOwnerSubscription({ ownerId: subscription.ownerId, reason });
    await load();
  };

  return (
    <div className="stack">
      <div className="report-filter-panel">
        <div className="form-section-title"><Search size={20} /><div><h3>Assinaturas por owner</h3><p>Filtre por ownerId ou consulte todas as assinaturas paginadas.</p></div></div>
        <div className="toolbar">
          <input placeholder="ownerId" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} />
          <button className="ghost-button" type="button" onClick={load}>Buscar</button>
        </div>
      </div>
      <div className="panel form-grid">
        <div className="form-section-title"><Plus size={20} /><div><h3>Atribuir plano manualmente</h3><p>Cria ou ajusta assinatura para um owner específico.</p></div></div>
        <div className="form-grid three-columns">
          <label>OwnerId<input value={assignForm.ownerId} onChange={(event) => setAssignForm((current) => ({ ...current, ownerId: event.target.value }))} /></label>
          <label>Plano<select value={assignForm.planId} onChange={(event) => setAssignForm((current) => ({ ...current, planId: event.target.value }))}>{plans.map((plan) => <option key={planId(plan)} value={planId(plan)}>{plan.name}</option>)}</select></label>
          <label>Ciclo<select value={assignForm.billingCycle} onChange={(event) => setAssignForm((current) => ({ ...current, billingCycle: Number(event.target.value) }))}><option value={BillingCycle.Monthly}>Mensal</option><option value={BillingCycle.Yearly}>Anual</option></select></label>
          <label>Início<input type="date" value={assignForm.currentPeriodStart ?? ""} onChange={(event) => setAssignForm((current) => ({ ...current, currentPeriodStart: event.target.value }))} /></label>
          <label>Fim<input type="date" value={assignForm.currentPeriodEnd ?? ""} onChange={(event) => setAssignForm((current) => ({ ...current, currentPeriodEnd: event.target.value }))} /></label>
          <label>Trial até<input type="date" value={assignForm.trialEndsAt ?? ""} onChange={(event) => setAssignForm((current) => ({ ...current, trialEndsAt: event.target.value }))} /></label>
          <label className="span-all">Notas<input value={assignForm.notes ?? ""} onChange={(event) => setAssignForm((current) => ({ ...current, notes: event.target.value }))} /></label>
        </div>
        <div className="form-actions"><button className="primary-button" type="button" onClick={assign}>Atribuir plano</button></div>
      </div>
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      <div className="table-card">
        {loading ? <LoadingState label="Carregando assinaturas..." /> : !subscriptions.items?.length ? <EmptyState title="Nenhuma assinatura encontrada" description="Ajuste o ownerId ou atribua um plano manualmente." /> : (
          <table><thead><tr><th>Owner</th><th>Plano</th><th>Status</th><th>Ciclo</th><th>Período</th><th>Ações</th></tr></thead><tbody>
            {subscriptions.items.map((subscription) => (
              <tr key={subscription.ownerSubscriptionId}>
                <td><strong>{subscription.ownerId}</strong><span>{subscription.ownerSubscriptionId}</span></td>
                <td>{subscription.planName ?? subscription.plan?.name ?? subscription.planId}</td>
                <td><StatusBadge tone={statusTone(subscription.status)}>{subscriptionStatusLabel[subscription.status] ?? subscription.status}</StatusBadge></td>
                <td>{billingCycleLabel[subscription.billingCycle]}</td>
                <td>{date(subscription.currentPeriodStart)} a {date(subscription.currentPeriodEnd)}</td>
                <td className="row-actions"><button onClick={() => changePlan(subscription)}>Trocar</button><button onClick={() => statusAction(subscription, "suspend")}>Suspender</button><button onClick={() => statusAction(subscription, "reactivate")}>Reativar</button><button onClick={() => statusAction(subscription, "cancel")}>Cancelar</button></td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </div>
  );
}

function AdminPaymentsPanel() {
  const [payments, setPayments] = useState<PagedResult<PaymentTransactionResponseDTO>>(emptyPaged);
  const [ownerId, setOwnerId] = useState("");
  const [filters, setFilters] = useState<PaymentTransactionFilterDTO>({ pageNumber: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!ownerId.trim()) return setError("Informe um ownerId para consultar pagamentos administrativos.");
    try {
      setLoading(true);
      setError("");
      setPayments(await adminPaymentTransactionService.byOwner(ownerId.trim(), filters, { pageNumber: filters.pageNumber, pageSize: filters.pageSize }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (next: Partial<PaymentTransactionFilterDTO>) => setFilters((current) => ({ ...current, ...next, pageNumber: 1 }));
  const action = async (payment: PaymentTransactionResponseDTO, kind: "paid" | "failed" | "cancel" | "refund") => {
    if (!confirm("Confirmar ação neste pagamento?")) return;
    if (kind === "paid") await adminPaymentTransactionService.markAsPaid(payment.paymentTransactionId);
    if (kind === "failed") {
      const failureReason = prompt("Informe o motivo da falha.");
      if (failureReason === null) return;
      await adminPaymentTransactionService.markAsFailed(payment.paymentTransactionId, { failureReason });
    }
    if (kind === "cancel") await adminPaymentTransactionService.cancelPayment(payment.paymentTransactionId);
    if (kind === "refund") await adminPaymentTransactionService.refundPayment(payment.paymentTransactionId);
    await load();
  };

  return (
    <div className="stack">
      <div className="report-filter-panel">
        <div className="form-section-title"><Search size={20} /><div><h3>Pagamentos por owner</h3><p>Use ownerId e filtros para ações administrativas de pagamento.</p></div></div>
        <div className="report-filter-grid">
          <label>OwnerId<input value={ownerId} onChange={(event) => setOwnerId(event.target.value)} /></label>
          <label>Status<select value={filters.status ?? ""} onChange={(event) => setFilter({ status: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Provider<select value={filters.provider ?? ""} onChange={(event) => setFilter({ provider: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentProviderLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Método<select value={filters.paymentMethod ?? ""} onChange={(event) => setFilter({ paymentMethod: event.target.value ? Number(event.target.value) : undefined })}><option value="">Todos</option>{Object.entries(paymentMethodLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Início<input type="date" value={filters.startDate ?? ""} onChange={(event) => setFilter({ startDate: event.target.value || undefined })} /></label>
          <label>Fim<input type="date" value={filters.endDate ?? ""} onChange={(event) => setFilter({ endDate: event.target.value || undefined })} /></label>
        </div>
        <div className="form-actions"><button className="primary-button" type="button" onClick={load}>Buscar pagamentos</button></div>
      </div>
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
      <div className="table-card">
        {loading ? <LoadingState label="Carregando pagamentos..." /> : !payments.items?.length ? <EmptyState title="Nenhum pagamento encontrado" description="Informe um ownerId e consulte os pagamentos." /> : (
          <table><thead><tr><th>Pagamento</th><th>Status</th><th>Valor</th><th>Vencimento</th><th>Ações</th></tr></thead><tbody>
            {payments.items.map((payment) => (
              <tr key={payment.paymentTransactionId}>
                <td><strong>{payment.plan?.name ?? payment.planId}</strong><span>{payment.paymentTransactionId}</span></td>
                <td><StatusBadge tone={paymentTone(payment.status)}>{paymentStatusLabel[payment.status] ?? payment.status}</StatusBadge></td>
                <td>{money(payment.amount)}</td>
                <td>{date(payment.dueDate)}</td>
                <td className="row-actions"><button onClick={() => action(payment, "paid")}>Pago</button><button onClick={() => action(payment, "failed")}>Falhou</button><button onClick={() => action(payment, "cancel")}>Cancelar</button><button onClick={() => action(payment, "refund")}>Reembolsar</button></td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </div>
  );
}

export function PlansPage() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<PagedResult<PlanResponseDTO>>(emptyPaged);
  const [activeSubscription, setActiveSubscription] = useState<OwnerSubscriptionResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PlanResponseDTO | undefined>();
  const [creating, setCreating] = useState(false);
  const canManagePlans = isAdmin;

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { pageNumber: plans.pageNumber ?? 1, pageSize: 12, search: query || undefined };
      setPlans(isAdmin ? await planService.list(params) : await planService.publicList(params));
      subscriptionService.active().then(setActiveSubscription).catch(() => setActiveSubscription(null));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, [query]);

  const visiblePlans = useMemo(() => plans.items ?? [], [plans.items]);
  const selectedPlanSlug = searchParams.get("plano");

  useEffect(() => {
    if (selectedPlanSlug) setActiveTab("plans");
  }, [selectedPlanSlug]);

  const savePlan = async (data: PlanCreateDTO) => {
    if (editing) {
      const updateData: PlanUpdateDTO = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        isActive: data.isActive,
        isPublic: data.isPublic,
        displayOrder: data.displayOrder,
      };
      await planService.update(planId(editing), updateData);
    } else {
      await planService.create(data);
    }
    setEditing(undefined);
    setCreating(false);
    await loadPlans();
  };

  const subscribeToPlan = async (plan: PlanResponseDTO) => {
    try {
      setError("");
      setFeedback("");
      if (activeSubscription?.ownerSubscriptionId) {
        if (!confirm(`Trocar sua assinatura para o plano ${plan.name}?`)) return;
        await subscriptionService.changePlan(activeSubscription.ownerSubscriptionId, { planId: plan.planId, reason: "Troca solicitada pelo usuário no front-end." });
        setFeedback(`Solicitação de troca para o plano ${plan.name} enviada com sucesso.`);
      } else {
        if (!confirm(`Assinar o plano ${plan.name}?`)) return;
        await subscriptionService.create({
          planId: plan.planId,
          status: SubscriptionStatus.Active,
          billingCycle: BillingCycle.Monthly,
          currentPeriodStart: new Date().toISOString(),
        });
        setFeedback(`Plano ${plan.name} assinado com sucesso.`);
      }
      setSearchParams({});
      await loadPlans();
      setActiveTab("subscription");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="plans-page stack">
      <div className="page-heading hero-heading plans-hero">
        <div>
          <span>Planos e assinatura</span>
          <h1>Gestão comercial do tenant</h1>
          <p>Controle planos, assinatura atual, consumo e pagamentos usando o client autenticado da aplicação.</p>
        </div>
        <button className="ghost-button" type="button" onClick={loadPlans}><RefreshCw size={18} /> Atualizar</button>
      </div>
      <div className="tab-bar">
        <button className={activeTab === "plans" ? "active" : ""} onClick={() => setActiveTab("plans")}>Planos</button>
        <button className={activeTab === "subscription" ? "active" : ""} onClick={() => setActiveTab("subscription")}>Assinatura</button>
        <button className={activeTab === "usage" ? "active" : ""} onClick={() => setActiveTab("usage")}>Uso</button>
        <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>Pagamentos</button>
        {isAdmin && <button className={activeTab === "admin-subscriptions" ? "active" : ""} onClick={() => setActiveTab("admin-subscriptions")}>Assinaturas admin</button>}
        {isAdmin && <button className={activeTab === "admin-payments" ? "active" : ""} onClick={() => setActiveTab("admin-payments")}>Pagamentos admin</button>}
      </div>
      {activeTab === "plans" && (
        <>
          <div className="toolbar">
            <Search size={18} />
            <input placeholder="Buscar por nome, slug ou descrição" value={query} onChange={(event) => setQuery(event.target.value)} />
            {canManagePlans && <button className="primary-button" type="button" onClick={() => { setEditing(undefined); setCreating(true); }}><Plus size={18} /> Novo plano</button>}
          </div>
          {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}
          {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
          {selectedPlanSlug && !isAdmin && <div className="alert info"><span>Escolha o plano selecionado para assinar com sua conta atual.</span></div>}
          {(creating || editing) && <PlanForm initial={editing} onSave={savePlan} onCancel={() => { setCreating(false); setEditing(undefined); }} />}
          {loading ? <LoadingState label="Carregando planos..." /> : visiblePlans.length === 0 ? <EmptyState title="Nenhum plano encontrado" description="Cadastre o primeiro plano ou ajuste a busca." /> : <div className="plans-grid">{visiblePlans.map((plan) => <PlanCard key={planId(plan)} plan={plan} canManage={canManagePlans} isCurrent={activeSubscription?.planId === plan.planId} onSubscribe={!isAdmin ? subscribeToPlan : undefined} onEdit={(current) => { setCreating(false); setEditing(current); }} onRefresh={loadPlans} />)}</div>}
        </>
      )}
      {activeTab === "subscription" && <SubscriptionPanel />}
      {activeTab === "usage" && <UsagePanel subscription={activeSubscription} />}
      {activeTab === "payments" && <PaymentsPanel />}
      {isAdmin && activeTab === "admin-subscriptions" && <AdminSubscriptionsPanel plans={visiblePlans} />}
      {isAdmin && activeTab === "admin-payments" && <AdminPaymentsPanel />}
    </section>
  );
}

export function PublicPlansPage() {
  const [plans, setPlans] = useState<PlanResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planService.publicList({ pageSize: 12 }).then((result) => setPlans(result.items ?? [])).catch(() => setPlans([])).finally(() => setLoading(false));
  }, []);

  return (
    <main className="public-plans-shell">
      <header className="public-plans-nav">
        <Link className="login-brand" to="/login"><img className="brand-mark" src="/branding/legisgest-emblem.png" alt="Símbolo LegisGest" /><div><h2>LegisGest</h2><p>Gestão parlamentar moderna</p></div></Link>
        <Link className="ghost-button" to="/login">Entrar</Link>
      </header>
      <section className="plans-page stack">
        <div className="page-heading hero-heading plans-hero">
          <div><span>Planos</span><h1>Escolha o plano para a escala da sua operação</h1><p>Planos por ciclo mensal ou anual, recursos habilitados e limites de uso para a operação política.</p></div>
          <div className="billing-preview"><span>Mensal</span><strong>Anual</strong></div>
        </div>
        {loading ? <LoadingState label="Carregando planos..." /> : plans.length === 0 ? <EmptyState title="Planos indisponíveis" description="Entre em contato com a equipe para conhecer as condições comerciais." /> : (
          <div className="plans-grid">{plans.filter((plan) => plan.isActive && plan.isPublic).map((plan) => <article className="plan-card" key={planId(plan)}><div className="plan-card-top"><span className="plan-badge">Disponível</span><div><h2>{plan.name}</h2><p>{plan.description}</p></div></div><div className="plan-price"><strong>{money(plan.monthlyPrice)}</strong><span>/mês</span><small>{plan.yearlyPrice ? `${money(plan.yearlyPrice)} por ano` : "Sem preço anual"}</small></div><Link className="primary-button" to={`/login?plano=${encodeURIComponent(plan.slug)}`}><Eye size={18} /> Entrar e escolher</Link></article>)}</div>
        )}
      </section>
    </main>
  );
}
