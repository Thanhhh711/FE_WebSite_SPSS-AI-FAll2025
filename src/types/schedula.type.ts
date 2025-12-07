export interface FormUpdateSchedular {
  shiftDate: string
  startTime: string
  endTime: string
  slotIndex: number
  status: number
  roomId: string
  notes: string
}

export interface ScheduleRequest {
  staffId: string
  shiftDate: string // ISO string
  startTime: string // HH:mm hoặc HH:mm:ss
  endTime: string // HH:mm hoặc HH:mm:ss
  slotIndex: number
  status: number
  registrationId: string
  roomId: string
  notes: string
}

export interface BookingPayload {
  roomId: string
  staffId: string
  startDate: string
  endDate: string
}
