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
  AdminCancelSubscriptionDTO,
  AdminChangeOwnerPlanDTO,
  AdminReactivateSubscriptionDTO,
  AdminSuspendSubscriptionDTO,
  CancelSubscriptionDTO,
  ChangePlanDTO,
  LoginData,
  LoginResponse,
  LeaderRankingDTO,
  ManualAssignPlanDTO,
  MeResponseDTO,
  OwnerSubscriptionCreateDTO,
  OwnerSubscriptionResponseDTO,
  PagedResult,
  PaginationParams,
  PaymentTransactionCreateDTO,
  PaymentTransactionFilterDTO,
  PaymentTransactionResponseDTO,
  PaymentTransactionUpdateStatusDTO,
  PlanCreateDTO,
  PlanResponseDTO,
  PlanUpdateDTO,
  PlanUsageResponseDTO,
  PlanUsageUpdateDTO,
  PostCommentCreateDTO,
  PostCommentResponseDTO,
  PostCreateDTO,
  PostResponseDTO,
  PostUpdateDTO,
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

const pagedFrom = <T>(payload: T[] | PagedResult<T> | null | undefined, fallback?: PaginationParams): PagedResult<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      totalItems: payload.length,
      pageNumber: fallback?.pageNumber ?? 1,
      pageSize: fallback?.pageSize ?? payload.length,
    };
  }

  if (!payload) {
    return {
      items: [],
      totalItems: 0,
      pageNumber: fallback?.pageNumber ?? 1,
      pageSize: fallback?.pageSize ?? 10,
    };
  }

  const normalizedPayload = payload as PagedResult<T> & { Items?: T[]; Data?: T[]; TotalItems?: number; TotalCount?: number; PageNumber?: number; PageSize?: number };
  const items = normalizedPayload.items ?? normalizedPayload.data ?? normalizedPayload.Items ?? normalizedPayload.Data ?? [];

  return {
    ...payload,
    items,
    totalItems: normalizedPayload.totalItems ?? normalizedPayload.totalCount ?? normalizedPayload.TotalItems ?? normalizedPayload.TotalCount ?? items.length,
    pageNumber: normalizedPayload.pageNumber ?? normalizedPayload.PageNumber ?? fallback?.pageNumber ?? 1,
    pageSize: normalizedPayload.pageSize ?? normalizedPayload.PageSize ?? fallback?.pageSize ?? items.length,
  };
};

const hasHttpStatus = (error: unknown, status: number) =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === status;

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

export const postService = {
  list: async (params?: PaginationParams) => pagedFrom((await api.get<PostResponseDTO[] | PagedResult<PostResponseDTO>>("/posts", { params })).data, params),
  getById: async (id: string) => (await api.get<PostResponseDTO>(`/posts/${id}`)).data,
  create: async (data: PostCreateDTO) => (await api.post<PostResponseDTO>("/posts", data)).data,
  update: async (id: string, data: PostUpdateDTO) => (await api.put<PostResponseDTO>(`/posts/post/update/${id}`, data)).data,
  delete: async (id: string) => api.delete(`/posts/post/delete/${id}`),
};

export const postCommentService = {
  listByPost: async (postId: string, params?: PaginationParams) =>
    pagedFrom((await api.get<PostCommentResponseDTO[] | PagedResult<PostCommentResponseDTO>>(`/PostComment/${postId}/comments`, { params })).data, params),
  getById: async (commentId: string) => (await api.get<PostCommentResponseDTO>(`/PostComment/${commentId}`)).data,
  create: async (data: PostCommentCreateDTO) => (await api.post<PostCommentResponseDTO>("/PostComment", data)).data,
  delete: async (commentId: string) => api.delete(`/PostComment/${commentId}`),
};

export const reportService = {
  dashboard: async (params?: ReportBaseFilterDTO) => normalizeDashboardReport((await api.get<DashboardReportDTO>("/reports/dashboard", { params })).data),
  demands: async (params?: DemandReportFilterDTO) => normalizeDemandReport((await api.get<DemandReportDTO>("/reports/demands", { params })).data),
  appointments: async (params?: AppointmentReportFilterDTO) => normalizeAppointmentReport((await api.get<AppointmentReportDTO>("/reports/appointments", { params })).data),
  topLeaders: async (params?: ReportBaseFilterDTO) => listFrom((await api.get<LeaderRankingDTO[] | PagedResult<LeaderRankingDTO>>("/reports/top-leaders", { params })).data),
};

export const planService = {
  list: async (params?: PaginationParams) => pagedFrom((await api.get<PlanResponseDTO[] | PagedResult<PlanResponseDTO>>("/plans", { params })).data, params),
  publicList: async (params?: PaginationParams) => {
    try {
      return pagedFrom((await api.get<PlanResponseDTO[] | PagedResult<PlanResponseDTO>>("/plans/public", { params })).data, params);
    } catch (error) {
      if (!hasHttpStatus(error, 404)) throw error;

      const fallbackResult = pagedFrom(
        (await api.get<PlanResponseDTO[] | PagedResult<PlanResponseDTO>>("/plans", { params: { ...params, onlyActive: true } })).data,
        params,
      );
      const publicItems = (fallbackResult.items ?? fallbackResult.data ?? []).filter((plan) => plan.isPublic);

      return {
        ...fallbackResult,
        items: publicItems,
        data: publicItems,
        totalItems: publicItems.length,
        totalCount: publicItems.length,
      };
    }
  },
  getById: async (id: string) => (await api.get<PlanResponseDTO>(`/plans/${id}`)).data,
  getBySlug: async (slug: string) => (await api.get<PlanResponseDTO>(`/plans/slug/${slug}`)).data,
  create: async (data: PlanCreateDTO) => (await api.post<PlanResponseDTO>("/plans", data)).data,
  update: async (id: string, data: PlanUpdateDTO) => (await api.put<PlanResponseDTO>(`/plans/${id}`, data)).data,
  activate: async (id: string) => (await api.patch<PlanResponseDTO>(`/plans/${id}/activate`)).data,
  deactivate: async (id: string) => (await api.patch<PlanResponseDTO>(`/plans/${id}/deactivate`)).data,
  delete: async (id: string) => api.delete(`/plans/${id}`),
  getPlans: async (params?: PaginationParams) => planService.list(params),
  getPublicPlans: async (params?: PaginationParams) => planService.publicList(params),
  getPlanById: async (id: string) => planService.getById(id),
  getPlanBySlug: async (slug: string) => planService.getBySlug(slug),
  createPlan: async (data: PlanCreateDTO) => planService.create(data),
  updatePlan: async (id: string, data: PlanUpdateDTO) => planService.update(id, data),
  activatePlan: async (id: string) => planService.activate(id),
  deactivatePlan: async (id: string) => planService.deactivate(id),
  deletePlan: async (id: string) => planService.delete(id),
};

export const subscriptionService = {
  active: async () => (await api.get<OwnerSubscriptionResponseDTO>("/subscriptions/active")).data,
  getById: async (id: string) => (await api.get<OwnerSubscriptionResponseDTO>(`/subscriptions/${id}`)).data,
  owner: async (params?: PaginationParams) => pagedFrom((await api.get<OwnerSubscriptionResponseDTO[] | PagedResult<OwnerSubscriptionResponseDTO>>("/subscriptions/owner", { params })).data, params),
  create: async (data: OwnerSubscriptionCreateDTO) => (await api.post<OwnerSubscriptionResponseDTO>("/subscriptions", data)).data,
  changePlan: async (id: string, data: ChangePlanDTO) => (await api.patch<OwnerSubscriptionResponseDTO>(`/subscriptions/${id}/change-plan`, data)).data,
  cancel: async (id: string, data: CancelSubscriptionDTO) => (await api.patch<OwnerSubscriptionResponseDTO>(`/subscriptions/${id}/cancel`, data)).data,
  suspend: async (id: string, reason?: string) => (await api.patch<OwnerSubscriptionResponseDTO>(`/subscriptions/${id}/suspend`, { reason })).data,
  reactivate: async (id: string) => (await api.patch<OwnerSubscriptionResponseDTO>(`/subscriptions/${id}/reactivate`)).data,
  getActiveSubscription: async () => subscriptionService.active(),
  getSubscriptionById: async (id: string) => subscriptionService.getById(id),
  getMySubscriptions: async (params?: PaginationParams) => subscriptionService.owner(params),
};

export const adminSubscriptionService = {
  list: async (params?: PaginationParams) => pagedFrom((await api.get<OwnerSubscriptionResponseDTO[] | PagedResult<OwnerSubscriptionResponseDTO>>("/admin/subscriptions", { params })).data, params),
  byOwner: async (ownerId: string, params?: PaginationParams) => pagedFrom((await api.get<OwnerSubscriptionResponseDTO[] | PagedResult<OwnerSubscriptionResponseDTO>>(`/admin/subscriptions/owner/${ownerId}`, { params })).data, params),
  assignPlan: async (data: ManualAssignPlanDTO) => (await api.post<OwnerSubscriptionResponseDTO>("/admin/subscriptions/assign-plan", data)).data,
  changeOwnerPlan: async (data: AdminChangeOwnerPlanDTO) => (await api.patch<OwnerSubscriptionResponseDTO>("/admin/subscriptions/change-plan", data)).data,
  cancelOwnerSubscription: async (data: AdminCancelSubscriptionDTO) => (await api.patch<OwnerSubscriptionResponseDTO>("/admin/subscriptions/cancel", data)).data,
  suspendOwnerSubscription: async (data: AdminSuspendSubscriptionDTO) => (await api.patch<OwnerSubscriptionResponseDTO>("/admin/subscriptions/suspend", data)).data,
  reactivateOwnerSubscription: async (data: AdminReactivateSubscriptionDTO) => (await api.patch<OwnerSubscriptionResponseDTO>("/admin/subscriptions/reactivate", data)).data,
  getSubscriptions: async (params?: PaginationParams) => adminSubscriptionService.list(params),
  getSubscriptionsByOwner: async (ownerId: string, params?: PaginationParams) => adminSubscriptionService.byOwner(ownerId, params),
};

export const planUsageService = {
  current: async () => (await api.get<PlanUsageResponseDTO>("/plan-usages/current")).data,
  byMonth: async (year: number, month: number) => (await api.get<PlanUsageResponseDTO>(`/plan-usages/${year}/${month}`)).data,
  updateCurrent: async (data: PlanUsageUpdateDTO) => (await api.put<PlanUsageResponseDTO>("/plan-usages/current", data)).data,
  getCurrentUsage: async () => planUsageService.current(),
  getUsageByPeriod: async (year: number, month: number) => planUsageService.byMonth(year, month),
  updateCurrentUsage: async (data: PlanUsageUpdateDTO) => planUsageService.updateCurrent(data),
};

export const paymentTransactionService = {
  list: async (params?: PaymentTransactionFilterDTO) => pagedFrom((await api.get<PaymentTransactionResponseDTO[] | PagedResult<PaymentTransactionResponseDTO>>("/payments", { params })).data, params),
  getById: async (id: string) => (await api.get<PaymentTransactionResponseDTO>(`/payments/${id}`)).data,
  bySubscription: async (subscriptionId: string, params?: PaginationParams) =>
    pagedFrom((await api.get<PaymentTransactionResponseDTO[] | PagedResult<PaymentTransactionResponseDTO>>(`/payments/subscription/${subscriptionId}`, { params })).data, params),
  pending: async (params?: PaginationParams) => pagedFrom((await api.get<PaymentTransactionResponseDTO[] | PagedResult<PaymentTransactionResponseDTO>>("/payments/pending", { params })).data, params),
  create: async (data: PaymentTransactionCreateDTO) => (await api.post<PaymentTransactionResponseDTO>("/payments", data)).data,
  markPaid: async (id: string, data?: PaymentTransactionUpdateStatusDTO) => (await api.patch<PaymentTransactionResponseDTO>(`/payments/${id}/paid`, data ?? {})).data,
  markFailed: async (id: string, data?: PaymentTransactionUpdateStatusDTO) => (await api.patch<PaymentTransactionResponseDTO>(`/payments/${id}/failed`, data ?? {})).data,
  cancel: async (id: string, data?: PaymentTransactionUpdateStatusDTO) => (await api.patch<PaymentTransactionResponseDTO>(`/payments/${id}/cancel`, data ?? {})).data,
  refund: async (id: string, data?: PaymentTransactionUpdateStatusDTO) => (await api.patch<PaymentTransactionResponseDTO>(`/payments/${id}/refund`, data ?? {})).data,
  getPayments: async (filter?: PaymentTransactionFilterDTO, params?: PaginationParams) => paymentTransactionService.list({ ...params, ...filter }),
  getPaymentById: async (id: string) => paymentTransactionService.getById(id),
  getPaymentsBySubscription: async (subscriptionId: string, params?: PaginationParams) => paymentTransactionService.bySubscription(subscriptionId, params),
  getPendingPayments: async () => paymentTransactionService.pending(),
};

export const adminPaymentTransactionService = {
  byOwner: async (ownerId: string, filter?: PaymentTransactionFilterDTO, params?: PaginationParams) =>
    pagedFrom((await api.get<PaymentTransactionResponseDTO[] | PagedResult<PaymentTransactionResponseDTO>>(`/admin/payments/owner/${ownerId}`, { params: { ...params, ...filter } })).data, params),
  markAsPaid: async (id: string) => (await api.patch<PaymentTransactionResponseDTO>(`/admin/payments/${id}/paid`)).data,
  markAsFailed: async (id: string, data: PaymentTransactionUpdateStatusDTO) => (await api.patch<PaymentTransactionResponseDTO>(`/admin/payments/${id}/failed`, data)).data,
  cancelPayment: async (id: string) => (await api.patch<PaymentTransactionResponseDTO>(`/admin/payments/${id}/cancel`)).data,
  refundPayment: async (id: string) => (await api.patch<PaymentTransactionResponseDTO>(`/admin/payments/${id}/refund`)).data,
  getPaymentsByOwner: async (ownerId: string, filter?: PaymentTransactionFilterDTO, params?: PaginationParams) => adminPaymentTransactionService.byOwner(ownerId, filter, params),
};
