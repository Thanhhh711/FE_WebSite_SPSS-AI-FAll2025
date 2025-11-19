export interface Slot {
  id: string
  slotMinutes: number
  breakMinutes: number
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
}

export interface RegistrationWeekday {
  weekday: number
  registrationId: string
}

export interface ScheduleRegistration {
  id: string
  staffId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  createdAt: string
  templateId: string
  slotId: string
  notes: string
  lastUpdatedBy: string | null
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
  slot: Slot
  template: Template
  registrationWeekdays: RegistrationWeekday[]
}

export interface SchedulePayload {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  templateId: string
  slotId: string
  notes: string
  weekdays: number[]
}
