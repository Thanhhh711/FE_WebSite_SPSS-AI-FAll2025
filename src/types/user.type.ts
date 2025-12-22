import { Role } from '../constants/Roles'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuthUser {
  userId: string
  userName: string
  emailAddress: string
  role: Role
  avatarUrl: string
}

// AuthUser

export interface RoleUser {
  roleId: string
  roleName: string
  description: string
}

export enum Status {
  Active = 'Active',
  UnActive = 'Inactive'
}

export interface User {
  userId: string
  roleId: string
  roleName: string
  role: RoleUser
  userName: string
  surName: string | null
  firstName: string | null
  lastName: string | null
  emailAddress: string
  phoneNumber: string
  avatarUrl: string | null
  status: Status
  isExpert: string
  skinTypeId: string | null
  skinTypeName: string | null
  skinType: any | null
  skinConditionId: string | null
  skinConditionName: string | null
  skinCondition: any | null
  age: number | null
  gender: string | null
  doB: string | null // ISO date string
  diet: string | null
  dailyRoutine: string | null
  allergy: string | null
  certificate: string | null
  isDeleted: boolean
  banReason: string
  createdBy: string
  createdTime: string // ISO date string
  lastUpdatedBy: string
  lastUpdatedTime: string // ISO date string
  deletedBy: string | null
  deletedTime: string | null
  addresses: Address[]
  blogs: any[]
  chatHistories: any[]
  refreshTokens: any[]
  replies: any[]
  reviews: any[]
  transactions: any[]
}

export interface UserForm {
  roleId: string
  status: string
  userName: string
  password: string
  surName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  avatarUrl: string
  skinTypeId: string
  skinConditionId: string
  age: number
  doB: string
  diet: string
  dailyRoutine: string
  allergy: string
  certificate: string
}

export interface Address {
  id: string
  countryId: number
  countryName: string
  customerName: string
  phoneNumber: string
  isDefault: boolean
  streetNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  ward: string
  postCode: string
  province: string
}

export interface SystermUserForm {
  roleId: string
  status: string
  isExpert: boolean

  userName: string
  password: string

  surName: string
  firstName: string
  emailAddress: string
  phoneNumber: string
  doB: string // ISO date string (VD: 2025-12-22T06:57:40.610Z)
  avatarUrl: string

  certificate: string
  specialties: number[]
  yearsExperience: number
  education: string
  training: string
  clinic: string
}
