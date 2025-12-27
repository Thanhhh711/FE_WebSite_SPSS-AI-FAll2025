import { Service } from './service.type'

export interface MedicalReportForm {
  customerId: string
  reportDate: string // ISO date string
  summary: string
  diagnosis: string
  observations: string
  vitals: string
  recommendation: string
  nextFollowUpDate?: string | null // ISO date string
  followUpInstructions?: string
  status: number
  appointmentId: string
  imageUrls: string[]
}

export interface Appointment {
  id: string
  userId: string
  scheduleId: string
  serviceId: string
  appointmentDate: string
  startDateTime: string
  endDateTime: string
  status: number
  notes: string
  service: Service
}

export interface ReportImage {
  id: string
  imageUrl: string
  reportId: string
  isDeleted: boolean
  createdAt: string
}
export interface Report {
  id: string
  staffId: string
  customerId: string
  reportDate: string // ISO string
  summary: string
  diagnosis: string
  observations: string
  vitals: string
  recommendation: string
  nextFollowUpDate: string // ISO string
  followUpInstructions: string
  status: number
  createdAt: string // ISO string
  updatedAt: string | null
  appointmentId: string
  isDeleted: boolean
  appointment: Appointment
  reportImages: ReportImage[]
}

export interface MedicalReportRequestEditForm {
  staffId: string
  customerId: string
  reportDate: string
  summary: string
  diagnosis: string
  observations: string
  vitals: string
  recommendation: string
  nextFollowUpDate?: string | null
  followUpInstructions?: string
  status: ReportStatus
  appointmentId?: string
  imageUrls?: string[]
}

export enum ReportStatus {
  /// <summary>
  /// Báo cáo nháp (Draft)
  /// </summary>
  Draft = 0,

  /// <summary>
  /// Đang xử lý (In Progress)
  /// </summary>
  InProgress = 1,

  /// <summary>
  /// Hoàn thành (Completed)
  /// </summary>
  Completed = 2,

  /// <summary>
  /// Đã gửi cho khách hàng (Sent to Customer)
  /// </summary>
  Sent = 3,

  /// <summary>
  /// Cần xem lại (Needs Review)
  /// </summary>
  NeedsReview = 4,

  /// <summary>
  /// Đã phê duyệt (Approved)
  /// </summary>
  Approved = 5
}
