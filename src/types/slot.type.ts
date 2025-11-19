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

export interface SlotForm {
  slotMinutes: number
  breakMinutes: number
}
