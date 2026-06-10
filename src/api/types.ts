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
  pageNumber?: number;
  pageSize?: number;
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
