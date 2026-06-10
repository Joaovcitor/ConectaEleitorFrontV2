import { BarChart3, CalendarPlus, ClipboardCheck, ClipboardList, ClipboardPlus, Filter, MapPinned, RefreshCw, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { reportService } from "../api/services";
import { AppointmentStatus, DemandStatus, appointmentStatusLabel, citizenTypeLabel, demandStatusLabel, type AppointmentReportDTO, type DashboardReportDTO, type DemandReportDTO, type ReportBaseFilterDTO } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

const emptyReport: DashboardReportDTO = {
  totalCitizens: 0,
  totalActiveCitizens: 0,
  totalInactiveCitizens: 0,
  totalLeaders: 0,
  totalVoters: 0,
  demands: {
    totalDemands: 0,
    openDemands: 0,
    inProgressDemands: 0,
    completedDemands: 0,
    canceledDemands: 0,
    demandsByStatus: [],
    demandsByMonth: [],
  },
  appointments: {
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    appointmentsByStatus: [],
    appointmentsByMonth: [],
  },
  citizensByType: [],
  citizensByNeighborhood: [],
  citizensByDistrict: [],
  topLeaders: [],
};

const emptyDemandReport: DemandReportDTO = emptyReport.demands;
const emptyAppointmentReport: AppointmentReportDTO = emptyReport.appointments;

const formatMonth = (year: number, month: number) => new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
const percent = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

export function DashboardPage() {
  const { user, canManageOperations } = useAuth();
  const [report, setReport] = useState<DashboardReportDTO>(emptyReport);
  const [demandReport, setDemandReport] = useState<DemandReportDTO>(emptyDemandReport);
  const [appointmentReport, setAppointmentReport] = useState<AppointmentReportDTO>(emptyAppointmentReport);
  const [filters, setFilters] = useState<ReportBaseFilterDTO>({});
  const [draftFilters, setDraftFilters] = useState<ReportBaseFilterDTO>({});
  const [demandStatus, setDemandStatus] = useState<number | undefined>();
  const [draftDemandStatus, setDraftDemandStatus] = useState<number | undefined>();
  const [appointmentStatus, setAppointmentStatus] = useState<number | undefined>();
  const [draftAppointmentStatus, setDraftAppointmentStatus] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (params = filters, demandStatusParam = demandStatus, appointmentStatusParam = appointmentStatus) => {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, demandData, appointmentData] = await Promise.all([
        reportService.dashboard(params),
        reportService.demands({ ...params, status: demandStatusParam }),
        reportService.appointments({ ...params, status: appointmentStatusParam }),
      ]);
      setReport(dashboardData);
      setDemandReport(demandData);
      setAppointmentReport(appointmentData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters, demandStatus, appointmentStatus);
  }, [filters, demandStatus, appointmentStatus]);

  const metrics = useMemo(() => [
    { label: "Eleitores cadastrados", value: report.totalCitizens, detail: `${report.totalActiveCitizens} ativos`, icon: <Users size={20} /> },
    { label: "Lideranças", value: report.totalLeaders, detail: `${report.totalVoters} eleitores`, icon: <UserCheck size={20} /> },
    { label: "Demandas totais", value: demandReport.totalDemands, detail: `${demandReport.openDemands} abertas`, icon: <ClipboardList size={20} /> },
    { label: "Compromissos", value: appointmentReport.totalAppointments, detail: `${appointmentReport.scheduledAppointments} agendados`, icon: <ClipboardCheck size={20} /> },
  ], [appointmentReport, demandReport, report]);

  const maxNeighborhood = Math.max(1, ...report.citizensByNeighborhood.map((item) => item.total));
  const maxDistrict = Math.max(1, ...report.citizensByDistrict.map((item) => item.total));
  const maxDemandMonth = Math.max(1, ...demandReport.demandsByMonth.map((item) => item.total));
  const maxAppointmentMonth = Math.max(1, ...appointmentReport.appointmentsByMonth.map((item) => item.total));

  const applyFilters = () => {
    setFilters(draftFilters);
    setDemandStatus(draftDemandStatus);
    setAppointmentStatus(draftAppointmentStatus);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setDraftDemandStatus(undefined);
    setDraftAppointmentStatus(undefined);
    setFilters({});
    setDemandStatus(undefined);
    setAppointmentStatus(undefined);
  };

  return (
    <section className="stack">
      <div className="page-heading hero-heading report-hero">
        <div>
          <span>Relatórios</span>
          <h1>Olá, {user?.completeName}</h1>
          <p>Monitore a base eleitoral, acompanhe demandas e identifique territórios prioritários para tomada de decisão.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => load()}><RefreshCw size={18} /> Atualizar</button>
      </div>

      <div className="report-filter-panel">
        <div className="form-section-title"><Filter size={20} /><div><h3>Filtros do relatório</h3><p>Refine o período e recortes territoriais para análise do gabinete.</p></div></div>
        <div className="report-filter-grid">
          <label>Início<input type="date" value={draftFilters.startDate ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, startDate: event.target.value || undefined }))} /></label>
          <label>Fim<input type="date" value={draftFilters.endDate ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, endDate: event.target.value || undefined }))} /></label>
          <label>Bairro<input value={draftFilters.neighborhood ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, neighborhood: event.target.value || undefined }))} /></label>
          <label>Distrito<input value={draftFilters.district ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, district: event.target.value || undefined }))} /></label>
          <label>ID do eleitor<input value={draftFilters.citizenId ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, citizenId: event.target.value || undefined }))} /></label>
          <label>ID da liderança<input value={draftFilters.leaderId ?? ""} onChange={(event) => setDraftFilters((current) => ({ ...current, leaderId: event.target.value || undefined }))} /></label>
          <label>Status da demanda<select value={draftDemandStatus ?? ""} onChange={(event) => setDraftDemandStatus(event.target.value ? Number(event.target.value) : undefined)}><option value="">Todos</option><option value={DemandStatus.Open}>Aberta</option><option value={DemandStatus.InProgress}>Em andamento</option><option value={DemandStatus.Resolved}>Resolvida</option><option value={DemandStatus.Canceled}>Cancelada</option></select></label>
          <label>Status do compromisso<select value={draftAppointmentStatus ?? ""} onChange={(event) => setDraftAppointmentStatus(event.target.value ? Number(event.target.value) : undefined)}><option value="">Todos</option><option value={AppointmentStatus.Scheduled}>Agendado</option><option value={AppointmentStatus.Completed}>Concluído</option><option value={AppointmentStatus.Canceled}>Cancelado</option></select></label>
        </div>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={clearFilters}>Limpar</button>
          <button className="primary-button" type="button" onClick={applyFilters}>Aplicar filtros</button>
        </div>
      </div>

      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

      {loading ? (
        <LoadingState label="Carregando relatório..." />
      ) : (
        <>
          <div className="metric-grid">
            {metrics.map((metric) => (
              <article className="metric-card report-metric" key={metric.label}>
                <div className="metric-icon">{metric.icon}</div>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="report-grid">
            <article className="report-panel">
              <div className="section-heading"><div><h2>Demandas por status</h2><p>Distribuição do fluxo de atendimento.</p></div></div>
              <div className="status-report-grid">
                {demandReport.demandsByStatus.length === 0 && <div className="report-empty">Nenhum dado de demanda para os filtros atuais.</div>}
                {demandReport.demandsByStatus.map((item) => (
                  <div className="status-report-item" key={item.status}>
                    <StatusBadge tone={item.status === 1 ? "blue" : item.status === 2 ? "amber" : item.status === 3 ? "green" : "slate"}>{demandStatusLabel[item.status]}</StatusBadge>
                    <strong>{item.total}</strong>
                    <div className="report-progress"><span style={{ width: `${percent(item.total, demandReport.totalDemands)}%` }} /></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="report-panel">
              <div className="section-heading"><div><h2>Compromissos por status</h2><p>Distribuição da agenda institucional.</p></div></div>
              <div className="status-report-grid">
                {appointmentReport.appointmentsByStatus.length === 0 && <div className="report-empty">Nenhum compromisso para os filtros atuais.</div>}
                {appointmentReport.appointmentsByStatus.map((item) => (
                  <div className="status-report-item" key={item.status}>
                    <StatusBadge tone={item.status === AppointmentStatus.Scheduled ? "blue" : item.status === AppointmentStatus.Completed ? "green" : "slate"}>{appointmentStatusLabel[item.status]}</StatusBadge>
                    <strong>{item.total}</strong>
                    <div className="report-progress"><span style={{ width: `${percent(item.total, appointmentReport.totalAppointments)}%` }} /></div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="report-grid">
            <article className="report-panel">
              <div className="section-heading"><div><h2>Eleitores por tipo</h2><p>Perfil da base cadastrada.</p></div></div>
              <div className="donut-summary">
                <div className="donut-number"><strong>{report.totalCitizens}</strong><span>Total</span></div>
                <div className="report-list compact-list">
                  {report.citizensByType.length === 0 && <div className="report-empty">Nenhum eleitor encontrado.</div>}
                  {report.citizensByType.map((item) => (
                    <div className="report-list-row" key={item.type}><span>{citizenTypeLabel[item.type]}</span><strong>{item.total}</strong></div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="report-grid three-panel-grid">
            <article className="report-panel">
              <div className="section-heading"><div><h2>Bairros</h2><p>Maiores concentrações de eleitores.</p></div></div>
              <div className="report-list">
                {report.citizensByNeighborhood.length === 0 && <div className="report-empty">Nenhum bairro encontrado.</div>}
                {report.citizensByNeighborhood.slice(0, 8).map((item) => (
                  <div className="report-bar-row" key={item.neighborhood || "Sem bairro"}><div><span>{item.neighborhood || "Sem bairro"}</span><strong>{item.total}</strong></div><div className="report-progress"><span style={{ width: `${percent(item.total, maxNeighborhood)}%` }} /></div></div>
                ))}
              </div>
            </article>

            <article className="report-panel">
              <div className="section-heading"><div><h2>Distritos</h2><p>Leitura territorial por distrito.</p></div></div>
              <div className="report-list">
                {report.citizensByDistrict.length === 0 && <div className="report-empty">Nenhum distrito encontrado.</div>}
                {report.citizensByDistrict.slice(0, 8).map((item) => (
                  <div className="report-bar-row" key={item.district || "Sem distrito"}><div><span>{item.district || "Sem distrito"}</span><strong>{item.total}</strong></div><div className="report-progress"><span style={{ width: `${percent(item.total, maxDistrict)}%` }} /></div></div>
                ))}
              </div>
            </article>

            <article className="report-panel">
              <div className="section-heading"><div><h2>Top lideranças</h2><p>Eleitores liderados por referência.</p></div></div>
              <div className="leader-list">
                {report.topLeaders.length === 0 && <div className="report-empty">Nenhuma liderança no recorte atual.</div>}
                {report.topLeaders.slice(0, 6).map((leader, index) => (
                  <div className="leader-row" key={leader.leaderId}><span>{index + 1}</span><div><strong>{leader.leaderName}</strong><small>{leader.totalLedCitizens} eleitores liderados</small></div></div>
                ))}
              </div>
            </article>
          </div>

          <article className="report-panel">
            <div className="section-heading"><div><h2>Demandas por mês</h2><p>Evolução temporal das solicitações.</p></div><BarChart3 size={22} /></div>
            <div className="monthly-bars">
              {demandReport.demandsByMonth.length === 0 && <div className="report-empty">Nenhuma demanda por mês no recorte atual.</div>}
              {demandReport.demandsByMonth.map((item) => (
                <div className="month-bar" key={`${item.year}-${item.month}`}>
                  <div style={{ height: `${Math.max(10, percent(item.total, maxDemandMonth))}%` }} />
                  <strong>{item.total}</strong>
                  <span>{formatMonth(item.year, item.month)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="report-panel">
            <div className="section-heading"><div><h2>Compromissos por mês</h2><p>Evolução temporal da agenda institucional.</p></div><BarChart3 size={22} /></div>
            <div className="monthly-bars">
              {appointmentReport.appointmentsByMonth.length === 0 && <div className="report-empty">Nenhum compromisso por mês no recorte atual.</div>}
              {appointmentReport.appointmentsByMonth.map((item) => (
                <div className="month-bar" key={`${item.year}-${item.month}`}>
                  <div style={{ height: `${Math.max(10, percent(item.total, maxAppointmentMonth))}%` }} />
                  <strong>{item.total}</strong>
                  <span>{formatMonth(item.year, item.month)}</span>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {canManageOperations && (
        <>
          <div className="section-heading"><h2>Ações rápidas</h2></div>
          <div className="action-grid">
            <Link to="/eleitores?novo=1"><UserPlus size={20} /><span><strong>Novo eleitor</strong><small>Cadastrar pessoa atendida</small></span></Link>
            <Link to="/demandas?novo=1"><ClipboardPlus size={20} /><span><strong>Nova demanda</strong><small>Registrar solicitação</small></span></Link>
            <Link to="/agendas?novo=1"><MapPinned size={20} /><span><strong>Nova agenda</strong><small>Organizar compromissos</small></span></Link>
            <Link to="/compromissos?novo=1"><CalendarPlus size={20} /><span><strong>Novo compromisso</strong><small>Agendar atendimento</small></span></Link>
            <Link to="/demandas"><TrendingUp size={20} /><span><strong>Fila de demandas</strong><small>Acompanhar atendimento</small></span></Link>
          </div>
        </>
      )}
    </section>
  );
}
