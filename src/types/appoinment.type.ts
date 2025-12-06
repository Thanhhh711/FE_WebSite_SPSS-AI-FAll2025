import { WorkScheduleStatus } from '../constants/SchedularConstants'
import { SuccessResponse } from '../utils/utils.type'
import { Room } from './room.type'
import { Service } from './service.type'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Appointment {
  id: string
  userId: string
  staffId: string
  appointmentDate: string // ISO date
  startDateTime: string // ISO datetime
  endDateTime: string // ISO datetime
  durationMinutes: number
  status: number
  createdAt: string
  updatedAt: string | null
  serviceId: string
  scheduleId: string
  sessionId: string | null
  notes: string
  isDeleted: boolean
  reports: any[] // Nếu có định nghĩa cụ thể về report thì thay 'any'
  session: any | null // Nếu có interface riêng thì thay 'any'
  schedule: Schedule
  service: Service
}

export interface Schedule {
  id: string
  staffId: string
  shiftDate: string
  startTime: string
  endTime: string
  slotIndex: number
  status: WorkScheduleStatus
  registrationId: string
  roomId: string
  notes: string
  room: Room
}

export interface ScheduleWork {
  id: string
  staffId: string
  shiftDate: string // ISO Date
  startTime: string
  endTime: string

  slotIndex: number
  status: WorkScheduleStatus
  createdAt: string
  updatedAt: string
  registrationId: string
  roomId: string
  notes: string
  isDeleted: boolean
  room: Room
  appointments: Appointment[]
}

export type AppointmentResponse = SuccessResponse<Appointment[]>

export interface AppointmentForm {
  userId: string
  staffId: string
  appointmentDate: string // ISO string
  startDateTime: string // ISO string
  durationMinutes: number
  status: number
  serviceId: string
  scheduleId: string
  sessionId: string | null
  notes: string
}

export interface AppointmentDashboard {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  appointmentsByDate: Record<string, number>
}
