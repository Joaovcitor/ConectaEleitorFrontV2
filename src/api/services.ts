import { api } from "./client";
import type {
  AgendaCreateDTO,
  AgendaResponseByIdDTO,
  AgendaResponseDTO,
  AgendaUpdateDTO,
  AppointmentCreateDTO,
  AppointmentResponseByIdDTO,
  AppointmentResponseDTO,
  AppointmentUpdateDTO,
  CitizenCreateDTO,
  CitizenResponseByIdDTO,
  CitizenResponseDTO,
  CitizenUpdateDTO,
  DemandCreateDTO,
  DemandResponseByIdDTO,
  DemandResponseDTO,
  DemandUpdateDTO,
  DashboardReportDTO,
  DemandReportDTO,
  DemandReportFilterDTO,
  AppointmentReportDTO,
  AppointmentReportFilterDTO,
  LoginData,
  LoginResponse,
  LeaderRankingDTO,
  MeResponseDTO,
  PagedResult,
  PaginationParams,
  ReportBaseFilterDTO,
  RegisterData,
  RegisterResponse,
} from "./types";

const listFrom = <T>(payload: T[] | PagedResult<T> | null | undefined) => {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];

  const normalizedPayload = payload as PagedResult<T> & { Items?: T[]; Data?: T[] };
  return normalizedPayload.items ?? normalizedPayload.data ?? normalizedPayload.Items ?? normalizedPayload.Data ?? [];
};

const numberFrom = (value: number | null | undefined) => value ?? 0;

const normalizeDemandReport = (payload?: Partial<DemandReportDTO> | null): DemandReportDTO => ({
  totalDemands: numberFrom(payload?.totalDemands),
  openDemands: numberFrom(payload?.openDemands),
  inProgressDemands: numberFrom(payload?.inProgressDemands),
  completedDemands: numberFrom(payload?.completedDemands),
  canceledDemands: numberFrom(payload?.canceledDemands),
  demandsByStatus: payload?.demandsByStatus ?? [],
  demandsByMonth: payload?.demandsByMonth ?? [],
});

const normalizeAppointmentReport = (payload?: Partial<AppointmentReportDTO> | null): AppointmentReportDTO => ({
  totalAppointments: numberFrom(payload?.totalAppointments),
  scheduledAppointments: numberFrom(payload?.scheduledAppointments),
  completedAppointments: numberFrom(payload?.completedAppointments),
  canceledAppointments: numberFrom(payload?.canceledAppointments),
  appointmentsByStatus: payload?.appointmentsByStatus ?? [],
  appointmentsByMonth: payload?.appointmentsByMonth ?? [],
});

const normalizeDashboardReport = (payload?: Partial<DashboardReportDTO> | null): DashboardReportDTO => ({
  totalCitizens: numberFrom(payload?.totalCitizens),
  totalActiveCitizens: numberFrom(payload?.totalActiveCitizens),
  totalInactiveCitizens: numberFrom(payload?.totalInactiveCitizens),
  totalLeaders: numberFrom(payload?.totalLeaders),
  totalVoters: numberFrom(payload?.totalVoters),
  demands: normalizeDemandReport(payload?.demands),
  appointments: normalizeAppointmentReport(payload?.appointments),
  citizensByType: payload?.citizensByType ?? [],
  citizensByNeighborhood: payload?.citizensByNeighborhood ?? [],
  citizensByDistrict: payload?.citizensByDistrict ?? [],
  topLeaders: payload?.topLeaders ?? [],
});

const normalizeCitizenDetails = (payload: CitizenResponseByIdDTO): CitizenResponseByIdDTO => ({
  ...payload,
  ledCitizens: payload.ledCitizens ?? [],
  demands: payload.demands ?? [],
});

const normalizeAgendaDetails = (payload: AgendaResponseByIdDTO): AgendaResponseByIdDTO => ({
  ...payload,
  appointments: payload.appointments ?? [],
});

export const authService = {
  login: async (data: LoginData) => (await api.post<LoginResponse>("/Auth/login", data)).data,
  registerAssessor: async (data: RegisterData) => (await api.post<RegisterResponse>("/Auth/register-assessor", data)).data,
  registerAssemblyman: async (data: RegisterData) => (await api.post<RegisterResponse>("/Auth/register-assemblyman", data)).data,
  me: async () => (await api.get<MeResponseDTO>("/Auth/Me")).data,
  logout: async () => api.post("/Auth/logout"),
};

export const citizenService = {
  list: async (params?: PaginationParams) => listFrom((await api.get<CitizenResponseDTO[] | PagedResult<CitizenResponseDTO>>("/Citizen", { params })).data),
  leaders: async (params?: PaginationParams) => listFrom((await api.get<CitizenResponseDTO[] | PagedResult<CitizenResponseDTO>>("/Citizen/citizens/leaders", { params })).data),
  create: async (data: CitizenCreateDTO) => (await api.post<CitizenResponseDTO>("/Citizen", data)).data,
  update: async (id: string, data: CitizenUpdateDTO) => (await api.put<CitizenResponseDTO>(`/Citizen/${id}`, data)).data,
  getById: async (id: string) => normalizeCitizenDetails((await api.get<CitizenResponseByIdDTO>(`/Citizen/${id}`)).data),
};

export const demandService = {
  list: async (params?: PaginationParams) => listFrom((await api.get<DemandResponseDTO[] | PagedResult<DemandResponseDTO>>("/Demand", { params })).data),
  listByCitizen: async (citizenId: string, params?: PaginationParams) =>
    listFrom((await api.get<DemandResponseDTO[] | PagedResult<DemandResponseDTO>>(`/Demand/demands/citizen/${citizenId}`, { params })).data),
  getById: async (id: string) => (await api.get<DemandResponseByIdDTO>(`/Demand/${id}`)).data,
  getByIdFromList: async (id: string, params?: PaginationParams): Promise<DemandResponseByIdDTO | undefined> =>
    (await demandService.list(params)).find((demand) => demand.demandId === id),
  create: async (data: DemandCreateDTO) => (await api.post<DemandResponseDTO>("/Demand", data)).data,
  update: async (id: string, data: DemandUpdateDTO) => (await api.put<DemandResponseDTO>(`/Demand/demand/update/${id}`, data)).data,
  delete: async (id: string) => api.delete(`/Demand/demand/delete/${id}`),
};

export const agendaService = {
  list: async (params?: PaginationParams) => listFrom((await api.get<AgendaResponseDTO[] | PagedResult<AgendaResponseDTO>>("/Agenda/agenda/my", { params })).data),
  create: async (data: AgendaCreateDTO) => (await api.post<AgendaResponseDTO>("/Agenda", data)).data,
  update: async (id: string, data: AgendaUpdateDTO) => (await api.put<AgendaResponseDTO>(`/Agenda/agenda/${id}`, data)).data,
  delete: async (id: string) => api.delete(`/Agenda/agenda/${id}`),
  getById: async (id: string) => normalizeAgendaDetails((await api.get<AgendaResponseByIdDTO>(`/Agenda/agenda/${id}`)).data),
};

export const appointmentService = {
  list: async (params?: PaginationParams) => listFrom((await api.get<AppointmentResponseDTO[] | PagedResult<AppointmentResponseDTO>>("/Appointment", { params })).data),
  create: async (data: AppointmentCreateDTO) => (await api.post<AppointmentResponseDTO>("/Appointment", data)).data,
  update: async (id: string, data: AppointmentUpdateDTO) => (await api.put<AppointmentResponseDTO>(`/Appointment/${id}`, data)).data,
  delete: async (id: string) => api.delete(`/Appointment/${id}`),
  getById: async (id: string) => (await api.get<AppointmentResponseByIdDTO>(`/Appointment/${id}`)).data,
};

export const reportService = {
  dashboard: async (params?: ReportBaseFilterDTO) => normalizeDashboardReport((await api.get<DashboardReportDTO>("/reports/dashboard", { params })).data),
  demands: async (params?: DemandReportFilterDTO) => normalizeDemandReport((await api.get<DemandReportDTO>("/reports/demands", { params })).data),
  appointments: async (params?: AppointmentReportFilterDTO) => normalizeAppointmentReport((await api.get<AppointmentReportDTO>("/reports/appointments", { params })).data),
  topLeaders: async (params?: ReportBaseFilterDTO) => listFrom((await api.get<LeaderRankingDTO[] | PagedResult<LeaderRankingDTO>>("/reports/top-leaders", { params })).data),
};
