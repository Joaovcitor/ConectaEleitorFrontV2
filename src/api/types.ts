export type Role = "Admin" | "Assemblyman" | "Assessor" | "Leader" | "Voter" | string;

export type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

export type PagedResult<T> = {
  items?: T[];
  data?: T[];
  totalItems?: number;
  totalCount?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
};

export type RegisterData = {
  email: string;
  password: string;
  confirmPassword: string;
  completeName: string;
};

export type RegisterResponse = {
  message?: string;
};

export type MeResponseDTO = {
  userId: string;
  ownerId: string;
  completeName: string;
  email: string;
  roles: Role[];
};

export type ReportBaseFilterDTO = {
  startDate?: string;
  endDate?: string;
  neighborhood?: string;
  district?: string;
  citizenId?: string;
  leaderId?: string;
};

export type DemandReportFilterDTO = ReportBaseFilterDTO & {
  status?: number;
};

export type AppointmentReportFilterDTO = ReportBaseFilterDTO & {
  status?: number;
  responsibleUserId?: string;
};

export enum CitizenType {
  Voter = 1,
  Leader = 2,
  Both = 3,
}

export enum DemandStatus {
  Open = 1,
  InProgress = 2,
  Resolved = 3,
  Canceled = 4,
}

export enum DemandPriority {
  Low = 1,
  Medium = 2,
  High = 3,
}

export enum AppointmentStatus {
  Scheduled = 1,
  Completed = 2,
  Canceled = 3,
}

export const citizenTypeLabel: Record<number, string> = {
  [CitizenType.Voter]: "Eleitor",
  [CitizenType.Leader]: "Liderança",
  [CitizenType.Both]: "Eleitor e liderança",
};

export const demandStatusLabel: Record<number, string> = {
  [DemandStatus.Open]: "Aberta",
  [DemandStatus.InProgress]: "Em andamento",
  [DemandStatus.Resolved]: "Resolvida",
  [DemandStatus.Canceled]: "Cancelada",
};

export const demandPriorityLabel: Record<number, string> = {
  [DemandPriority.Low]: "Baixa",
  [DemandPriority.Medium]: "Média",
  [DemandPriority.High]: "Alta",
};

export const appointmentStatusLabel: Record<number, string> = {
  [AppointmentStatus.Scheduled]: "Agendado",
  [AppointmentStatus.Completed]: "Concluído",
  [AppointmentStatus.Canceled]: "Cancelado",
};

export type CitizenCreateDTO = {
  fullName: string;
  nickname?: string | null;
  cpf?: string | null;
  voterRegistration?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  whatsApp?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  electoralZone?: string | null;
  electoralSection?: string | null;
  notes?: string | null;
  type: number;
  leaderId?: string | null;
  userId?: string | null;
};

export type CitizenUpdateDTO = {
  fullName: string;
  nickname?: string | null;
  cpf?: string | null;
  voterRegistration?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  whatsApp?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  electoralZone?: string | null;
  electoralSection?: string | null;
  notes?: string | null;
  type: number;
  leaderId?: string | null;
  userId?: string | null;
  isActive: boolean;
};

export type CitizenResponseDTO = {
  citizenId: string;
  fullName: string;
  nickname?: string | null;
  phone?: string | null;
  whatsApp?: string | null;
  neighborhood?: string | null;
  district?: string | null;
  electoralZone?: string | null;
  electoralSection?: string | null;
  notes?: string | null;
  type: number;
  leaderId?: string | null;
  leaderName?: string | null;
  userId?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CitizenResponseByIdDTO = CitizenResponseDTO & {
  cpf?: string | null;
  voterRegistration?: string | null;
  birthDate?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  ledCitizens: CitizenResponseDTO[];
  demands: DemandResponseDTO[];
  updatedAt?: string | null;
};

export type DemandCreateDTO = {
  title: string;
  description: string;
  priority: number;
  citizenId: string;
};

export type DemandUpdateDTO = DemandCreateDTO & {
  status: number;
};

export type DemandResponseDTO = {
  demandId: string;
  title: string;
  description: string;
  status: number;
  priority: number;
  citizenId: string;
  citizenName: string;
  createdAt: string;
  completedAt?: string | null;
};

export type DemandResponseByIdDTO = DemandResponseDTO;

export type AgendaCreateDTO = {
  name: string;
  description?: string | null;
};

export type AgendaUpdateDTO = AgendaCreateDTO;

export type AgendaResponseDTO = {
  agendaId: string;
  name: string;
  description?: string | null;
  totalAppointments: number;
  createdAt: string;
};

export type AgendaResponseByIdDTO = AgendaResponseDTO & {
  appointments: AppointmentResponseDTO[];
};

export type AppointmentCreateDTO = {
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  agendaId: string;
  citizenId?: string | null;
};

export type AppointmentUpdateDTO = AppointmentCreateDTO & {
  status: number;
};

export type AppointmentResponseDTO = {
  appointmentId: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  status: number;
  agendaId: string;
  agendaName: string;
  citizenId?: string | null;
  citizenName?: string | null;
  createdAt: string;
};

export type AppointmentResponseByIdDTO = AppointmentResponseDTO;

export type PostCreateDTO = {
  categoryId?: string | null;
  title: string;
  content: string;
  summary?: string | null;
  coverImageUrl?: string | null;
  isPinned: boolean;
  isPublished: boolean;
  isPublic: boolean;
};

export type PostUpdateDTO = PostCreateDTO;

export type PostResponseDTO = PostCreateDTO & {
  assemblymanPostId: string;
  ownerId: string;
  userId: string;
  categoryName?: string | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string | null;
};

export type PostCommentCreateDTO = {
  postId: string;
  content: string;
  parentCommentId?: string | null;
};

export type PostCommentResponseDTO = {
  assemblymanPostCommentId: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: string;
  replies: PostCommentResponseDTO[];
};

export type CitizensByDistrictDTO = {
  district: string;
  total: number;
};

export type CitizensByNeighborhoodDTO = {
  neighborhood: string;
  total: number;
};

export type CitizensByTypeDTO = {
  type: number;
  total: number;
};

export type DemandsByStatusDTO = {
  status: number;
  total: number;
};

export type DemandsByMonthDTO = {
  year: number;
  month: number;
  total: number;
};

export type AppointmentsByStatusDTO = {
  status: number;
  total: number;
};

export type AppointmentsByMonthDTO = {
  year: number;
  month: number;
  total: number;
};

export type LeaderRankingDTO = {
  leaderId: string;
  leaderName: string;
  totalLedCitizens: number;
};

export type DemandReportDTO = {
  totalDemands: number;
  openDemands: number;
  inProgressDemands: number;
  completedDemands: number;
  canceledDemands: number;
  demandsByStatus: DemandsByStatusDTO[];
  demandsByMonth: DemandsByMonthDTO[];
};

export type AppointmentReportDTO = {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  appointmentsByStatus: AppointmentsByStatusDTO[];
  appointmentsByMonth: AppointmentsByMonthDTO[];
};

export type DashboardReportDTO = {
  totalCitizens: number;
  totalActiveCitizens: number;
  totalInactiveCitizens: number;
  totalLeaders: number;
  totalVoters: number;
  demands: DemandReportDTO;
  appointments: AppointmentReportDTO;
  citizensByType: CitizensByTypeDTO[];
  citizensByNeighborhood: CitizensByNeighborhoodDTO[];
  citizensByDistrict: CitizensByDistrictDTO[];
  topLeaders: LeaderRankingDTO[];
};

export enum PlanLimitType {
  Users = 1,
  Voters = 2,
  Leaders = 3,
  Demands = 4,
  Appointments = 5,
  FileStorageMb = 6,
  Reports = 7,
  Exports = 8,
}

export enum SubscriptionStatus {
  Trial = 1,
  Active = 2,
  PastDue = 3,
  Suspended = 4,
  Canceled = 5,
  Expired = 6,
}

export enum BillingCycle {
  Monthly = 1,
  Yearly = 2,
}

export enum SubscriptionAction {
  Created = 1,
  PlanChanged = 2,
  Renewed = 3,
  Canceled = 4,
  Suspended = 5,
  Reactivated = 6,
  Expired = 7,
}

export enum PaymentProvider {
  Manual = 1,
  MercadoPago = 2,
  Asaas = 3,
  Stripe = 4,
  PagSeguro = 5,
}

export enum PaymentMethod {
  Pix = 1,
  CreditCard = 2,
  Boleto = 3,
  DebitCard = 4,
  BankTransfer = 5,
  Manual = 6,
}

export enum PaymentStatus {
  Pending = 1,
  WaitingPayment = 2,
  Paid = 3,
  Failed = 4,
  Canceled = 5,
  Refunded = 6,
  Expired = 7,
  Chargeback = 8,
}

export const planLimitTypeLabel: Record<number, string> = {
  [PlanLimitType.Users]: "Usuários",
  [PlanLimitType.Voters]: "Eleitores",
  [PlanLimitType.Leaders]: "Lideranças",
  [PlanLimitType.Demands]: "Demandas",
  [PlanLimitType.Appointments]: "Compromissos",
  [PlanLimitType.FileStorageMb]: "Armazenamento",
  [PlanLimitType.Reports]: "Relatórios",
  [PlanLimitType.Exports]: "Exportações",
};

export const subscriptionStatusLabel: Record<number, string> = {
  [SubscriptionStatus.Active]: "Ativa",
  [SubscriptionStatus.Trial]: "Trial",
  [SubscriptionStatus.PastDue]: "Em atraso",
  [SubscriptionStatus.Suspended]: "Suspensa",
  [SubscriptionStatus.Canceled]: "Cancelada",
  [SubscriptionStatus.Expired]: "Expirada",
};

export const billingCycleLabel: Record<number, string> = {
  [BillingCycle.Monthly]: "Mensal",
  [BillingCycle.Yearly]: "Anual",
};

export const subscriptionActionLabel: Record<number, string> = {
  [SubscriptionAction.Created]: "Criada",
  [SubscriptionAction.PlanChanged]: "Troca de plano",
  [SubscriptionAction.Renewed]: "Renovação",
  [SubscriptionAction.Canceled]: "Cancelamento",
  [SubscriptionAction.Suspended]: "Suspensão",
  [SubscriptionAction.Reactivated]: "Reativação",
  [SubscriptionAction.Expired]: "Expiração",
};

export const paymentProviderLabel: Record<number, string> = {
  [PaymentProvider.Manual]: "Manual",
  [PaymentProvider.MercadoPago]: "Mercado Pago",
  [PaymentProvider.Asaas]: "Asaas",
  [PaymentProvider.Stripe]: "Stripe",
  [PaymentProvider.PagSeguro]: "PagSeguro",
};

export const paymentMethodLabel: Record<number, string> = {
  [PaymentMethod.Pix]: "Pix",
  [PaymentMethod.CreditCard]: "Cartão de crédito",
  [PaymentMethod.Boleto]: "Boleto",
  [PaymentMethod.DebitCard]: "Cartão de débito",
  [PaymentMethod.BankTransfer]: "Transferência",
  [PaymentMethod.Manual]: "Manual",
};

export const paymentStatusLabel: Record<number, string> = {
  [PaymentStatus.Pending]: "Pendente",
  [PaymentStatus.WaitingPayment]: "Aguardando pagamento",
  [PaymentStatus.Paid]: "Pago",
  [PaymentStatus.Failed]: "Falhou",
  [PaymentStatus.Canceled]: "Cancelado",
  [PaymentStatus.Refunded]: "Reembolsado",
  [PaymentStatus.Expired]: "Expirado",
  [PaymentStatus.Chargeback]: "Chargeback",
};

export type PlanFeatureCreateDTO = {
  name: string;
  key: string;
  description?: string | null;
  isEnabled: boolean;
};

export type PlanFeatureResponseDTO = {
  planFeatureId: string;
  name: string;
  key: string;
  description?: string | null;
  isEnabled: boolean;
};

export type PlanLimitCreateDTO = {
  type: PlanLimitType;
  value?: number | null;
  isUnlimited: boolean;
};

export type PlanLimitResponseDTO = {
  planLimitId: string;
  type: PlanLimitType;
  value?: number | null;
  isUnlimited: boolean;
};

export type PlanCreateDTO = {
  name: string;
  slug: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice?: number | null;
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  features: PlanFeatureCreateDTO[];
  limits: PlanLimitCreateDTO[];
};

export type PlanUpdateDTO = {
  name: string;
  slug: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice?: number | null;
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
};

export type PlanResponseDTO = {
  planId: string;
  name: string;
  slug: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice?: number | null;
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string | null;
  features: PlanFeatureResponseDTO[];
  limits: PlanLimitResponseDTO[];
};

export type OwnerSubscriptionCreateDTO = {
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
};

export type OwnerSubscriptionUpdateStatusDTO = {
  status: SubscriptionStatus;
  reason?: string | null;
};

export type ChangePlanDTO = {
  planId: string;
  reason?: string | null;
};

export type CancelSubscriptionDTO = {
  cancelReason?: string | null;
};

export type ManualAssignPlanDTO = {
  ownerId: string;
  planId: string;
  billingCycle: BillingCycle;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  notes?: string | null;
};

export type AdminChangeOwnerPlanDTO = {
  ownerId: string;
  newPlanId: string;
  billingCycle: BillingCycle;
  reason?: string | null;
};

export type AdminCancelSubscriptionDTO = {
  ownerId: string;
  reason?: string | null;
};

export type AdminSuspendSubscriptionDTO = {
  ownerId: string;
  reason?: string | null;
};

export type AdminReactivateSubscriptionDTO = {
  ownerId: string;
  reason?: string | null;
};

export type SubscriptionHistoryResponseDTO = {
  subscriptionHistoryId: string;
  ownerSubscriptionId: string;
  action: SubscriptionAction;
  oldPlanId?: string | null;
  newPlanId?: string | null;
  description?: string | null;
  changedByUserId?: string | null;
  createdAt: string;
};

export type OwnerSubscriptionResponseDTO = {
  ownerSubscriptionId: string;
  ownerId: string;
  planId: string;
  planName?: string | null;
  planSlug?: string | null;
  plan?: PlanResponseDTO | null;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startedAt: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  canceledAt?: string | null;
  suspendedAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  history: SubscriptionHistoryResponseDTO[];
};

export type PlanUsageResponseDTO = {
  planUsageId: string;
  ownerId: string;
  year: number;
  month: number;
  usersCount: number;
  votersCount: number;
  leadersCount: number;
  demandsCount: number;
  appointmentsCount: number;
  reportsGeneratedCount: number;
  exportsGeneratedCount: number;
  storageUsedBytes: number;
  updatedAt: string;
};

export type PlanUsageUpdateDTO = {
  usersCount: number;
  votersCount: number;
  leadersCount: number;
  demandsCount: number;
  appointmentsCount: number;
  reportsGeneratedCount: number;
  exportsGeneratedCount: number;
  storageUsedBytes: number;
};

export type PaymentTransactionCreateDTO = {
  ownerSubscriptionId: string;
  provider: number;
  paymentMethod: number;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency?: string | null;
  dueDate: string;
  externalPaymentId?: string | null;
  externalInvoiceId?: string | null;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  boletoUrl?: string | null;
  metadataJson?: string | null;
};

export type PaymentTransactionUpdateStatusDTO = {
  failureReason?: string | null;
};

export type PaymentTransactionResponseDTO = {
  paymentTransactionId: string;
  ownerId: string;
  ownerSubscriptionId: string;
  planId: string;
  plan?: PlanResponseDTO | null;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  dueDate: string;
  paidAt?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  externalPaymentId?: string | null;
  externalInvoiceId?: string | null;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  boletoUrl?: string | null;
  failureReason?: string | null;
  metadataJson?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type PaymentTransactionFilterDTO = PaginationParams & {
  status?: PaymentStatus | null;
  provider?: PaymentProvider | null;
  paymentMethod?: PaymentMethod | null;
  startDate?: string | null;
  endDate?: string | null;
  subscriptionId?: string | null;
};
