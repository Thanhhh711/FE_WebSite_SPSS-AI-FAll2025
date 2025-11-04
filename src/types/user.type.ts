import { Role } from '../constants/Roles'

export interface User {
  userId: string
  userName: string
  emailAddress: string
  role: Role
}
