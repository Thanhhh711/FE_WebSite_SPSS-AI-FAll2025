export interface SkinTest {
  id: string
  name: string
  isDefault: boolean
  questions: Question[]
  createdTime: string
}

export interface Option {
  value: string
  score: number
}

export interface Question {
  value: string
  section: string
  options: Option[]
}

export interface ResultConfig {
  skinTypeId: string
  odScore: string
  srScore: string
  pnScore: string
  wtScore: string
}

export interface CreateSkinTestRequest {
  name: string
  isDefault: boolean
  questions: Question[]
  resultConfigs: ResultConfig[]
}
