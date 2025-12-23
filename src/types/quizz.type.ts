export interface SkinTest {
  id: string
  name: string
  isDefault: boolean
  totalQuestions: number
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

export interface SkinTestDetail {
  id: string
  name: string
  isDefault: boolean
  questions: SkinTestQuestion[]
  results: SkinTestResult[]
  createdTime: string
}

export interface SkinTestQuestion {
  id: string
  value: string
  section: SkinSection
  quizOptions: SkinTestOption[]
}

export type SkinSection = 'OD' | 'SR' | 'PN' | 'WT'
export interface SkinTestOption {
  id: string
  value: string
  score: number
}

export interface SkinTestResult {
  id: string
  quizSetId: string
  quizSetName: string
  skinTypeId: string
  skinTypeName: string
  odScore: string
  srScore: string
  pnScore: string
  wtScore: string
}

export interface EditQuizForm {
  id: string
  name?: string
  isDefault?: boolean
  questions?: EditQuestion[]
  resultConfigs?: EditResultConfig[]
}

export interface EditQuestion {
  id: string
  value?: string
  section?: string
  options?: EditOption[]
}

export interface EditOption {
  id: string
  value?: string
  score?: number
}

export interface EditResultConfig {
  skinTypeId: string
  odScore?: string
  srScore?: string
  pnScore?: string
  wtScore?: string
}

export interface QuizQuestion {
  quizSetId: string
  value: string
  section: string
}

export type QuizQuestionEditForm = Omit<QuizQuestion, 'quizSetId'>

export interface QuestionOption {
  questionId: string
  value: string
  score: number
}

export type QuestionOptionEditForm = Omit<QuestionOption, 'questionId'>

export interface QuizSet {
  name: string
  isDefault: boolean
}

export interface SkinTypeScoreConfig {
  skinTypeId: string
  odScore: string
  srScore: string
  pnScore: string
  wtScore: string
}

export interface QuizEditForm {
  name: string
  isDefault: boolean
}

export interface QuizSetEditSkinTypeScore {
  skinTypeId: string
  odScore: string
  srScore: string
  pnScore: string
  wtScore: string
}

export interface QuizSetSkinTypeScore {
  quizSetId: string
  skinTypeId: string
  odScore: string
  srScore: string
  pnScore: string
  wtScore: string
}
