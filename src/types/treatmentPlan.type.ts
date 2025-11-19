import { TreatmentSession } from './treatmentSession.type'

export interface TreatmentPlan {
  id: string
  createdByStaffId: string
  customerId: string
  customerApprovedAt: string | null
  estimatedCost: number
  durationWeeks: number
  totalSessions: number
  createdAt: string
  diagnosis: string
  goal: string
  startDate: string
  endDate: string
  status: TreatmentPlanStatus
  description: string
  lastUpdatedAt: string | null
  isDeleted: boolean
  treatmentSessions: TreatmentSession[]
}

export interface CreateTreatmentPlanDto {
  createdByStaffId: string
  customerId: string
  estimatedCost: number
  durationWeeks: number
  totalSessions: number
  diagnosis: string
  goal: string
  startDate: string // ISO datetime
  endDate: string // ISO datetime
  status: TreatmentPlanStatus
  description: string
}

export enum TreatmentPlanStatus {
  /// <summary>
  /// Nháp (Draft)
  /// </summary>
  Draft = 0,

  /// <summary>
  /// Chờ phê duyệt (Pending Approval)
  /// </summary>
  PendingApproval = 1,

  /// <summary>
  /// Đã phê duyệt (Approved)
  /// </summary>
  Approved = 2,

  /// <summary>
  /// Đang điều trị (In Progress)
  /// </summary>
  InProgress = 3,

  /// <summary>
  /// Hoàn thành (Completed)
  /// </summary>
  Completed = 4,

  /// <summary>
  /// Bị hủy (Cancelled)
  /// </summary>
  Cancelled = 5,

  /// <summary>
  /// Tạm ngưng (On Hold)
  /// </summary>
  OnHold = 6
}
