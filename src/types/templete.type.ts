export interface ScheduleTemplate {
  id: string
  name: string
  startTime: string
  endTime: string
  slotId: string
  description: string
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
}

export interface TemplateForm {
  name: string
  description: string
  startTime: string
  endTime: string
  slotId: string
}
