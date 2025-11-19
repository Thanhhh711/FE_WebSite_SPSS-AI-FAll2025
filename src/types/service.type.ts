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

export interface ServiceForm {
  name: string
  description: string
  durationMinutes: number
  price: number
}
