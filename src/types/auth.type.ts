import { SuccessResponse } from '../utils/utils.type'
import { AuthUser, User } from './user.type'

export type AuthResponse = SuccessResponse<{
  accessToken: string
  refreshToken: string
  authUserDto: AuthUser
}>

export interface PagingData<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Generic type cho API trả về paging
export type PaginaResponse<T> = SuccessResponse<PagingData<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserByIdResponse = SuccessResponse<User>
