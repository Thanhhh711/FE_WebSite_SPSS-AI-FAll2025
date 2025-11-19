import { Appointment } from './appoinment.type'

export interface TreatmentSessionForm {
  planId: string
  sessionNumber: number
  staffId: string
  sessionDate: string
  startTime: string
  endTime: string
  treatmentProcedure: string
  resultSummary: string
  status: TreatmentSessionStatus
  devices: string
  kits: string
  roomId: string
}

export enum TreatmentSessionStatus {
  /// <summary>
  /// Đã lên lịch (Scheduled)
  /// </summary>
  Scheduled = 0,

  /// <summary>
  /// Đang thực hiện (In Progress)
  /// </summary>
  InProgress = 1,

  /// <summary>
  /// Hoàn thành (Completed)
  /// </summary>
  Completed = 2,

  /// <summary>
  /// Bị hủy (Cancelled)
  /// </summary>
  Cancelled = 3,

  /// <summary>
  /// Hoãn lại (Rescheduled)
  /// </summary>
  Rescheduled = 4,

  /// <summary>
  /// Không đến (No Show)
  /// </summary>
  NoShow = 5
}

export interface TreatmentSession {
  id: string
  sessionNumber: number
  staffId: string
  sessionDate: string // ISO date string
  startTime: string // "HH:mm:ss"
  endTime: string // "HH:mm:ss"
  treatmentProcedure: string
  resultSummary: string
  status: TreatmentSessionStatus
  createdAt: string
  updatedAt: string | null
  devices: string
  kits: string
  planId: string
  isDeleted: boolean
  plan: TreatmentPlanInSession
  appointments: Appointment[]
  roomId: string
}

export interface TreatmentPlanInSession {
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
  status: number
  description: string
}
