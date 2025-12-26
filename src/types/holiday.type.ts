export interface Holiday {
  id: string
  holidayDate: string // ISO date string
  description: string
  createdAt: string // ISO datetime with timezone
  isDeleted: boolean
}

export interface CreateHolidayBody {
  holidayDate: string // ISO date string
  description: string
}
