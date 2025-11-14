import { SuccessResponse } from '../utils/utils.type'

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
  status: number
  registrationId: string
  roomId: string
  notes: string
  room: Room
}

export interface Room {
  id: string
  roomName: string
  location: string
  floorNumber: number
  capacity: number
  isDeleted: boolean
  createdBy: string
  createdTime: string // ISO datetime
  lastUpdatedBy: string | null
  lastUpdatedTime: string | null
  deletedTime: string
}

export interface Service {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
}

export interface ScheduleWork {
  id: string
  staffId: string
  shiftDate: string // ISO Date
  startTime: string
  endTime: string

  slotIndex: number
  status: number
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
