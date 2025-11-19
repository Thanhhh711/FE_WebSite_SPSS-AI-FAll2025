export interface ScheduleTemplate {
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

export interface TemplateForm {
  name: string
  description: string
}
