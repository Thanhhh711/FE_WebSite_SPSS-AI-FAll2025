import { SuccessResponse } from '../utils/utils.type'
import { User } from './user.type'

export type AuthResponse = SuccessResponse<{
  accessToken: string
  refreshToken: string
  authUserDto: User
}>
