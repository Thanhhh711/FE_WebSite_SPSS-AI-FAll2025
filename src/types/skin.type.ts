export interface SkinCondition {
  id: string
  name: string
  description: string
  severityLevel: number
  isChronic: boolean
  createdBy: string
  lastUpdatedBy: string
  deletedBy: string | null
  createdTime: string
  lastUpdatedTime: string
  deletedTime: string | null
  isDeleted: boolean
}

export interface SkinConditionForm {
  name: string
  description: string
  severityLevel: number
  isChronic: boolean
}

export interface SkinType {
  id: string
  name: string
  description: string
}

export interface SkinTypeForm {
  name: string
  description: string
}

export interface SkinProfile {
  id: string
  skinTypeId: string
  skinTypeName: string
  age: number
  gender: 'male' | 'female' | 'other'
  livingEnvironment: number
  climateRegion: number
  humidityLevel: number
  uvIndex: number
  pollutionLevel: number
  skinHistory: string
  dailyRoutine: string
  waterIntake: string
  stressLevel: string
  diet: string
  exerciseFrequency: string
  sleepHabit: string
  allergy: string
  sensitivities: string
}
