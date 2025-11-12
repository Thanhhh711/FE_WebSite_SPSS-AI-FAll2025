import { PaginaResponse, PagingData, UserByIdResponse } from '../types/auth.type'
import { User, UserForm } from '../types/user.type'
import http from '../utils/http'

export const USERS = 'users'

const userApi = {
  getUsers: (pageNumber = 1, pageSize = 10) =>
    http.get<PaginaResponse<User>>(`${USERS}?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  createUser: (body: UserForm) => http.post<PagingData<User>>(USERS, body),

  getUsersById: (userId: string) => http.get<UserByIdResponse>(`${USERS}/${userId}`),

  updateUser: (userId: string, body: UserForm) => http.put<UserByIdResponse>(`${USERS}/${userId}`, body),

  // deleteUser: (userId: string) => http.delete(`${USERS}/${userId}`, body)
  lockUser: (userId: string, banReason: string) =>
    http.patch<UserByIdResponse>(`${USERS}/${userId}/lock`, { banReason }),
  unLockUser: (userId: string) => http.patch<UserByIdResponse>(`${USERS}/${userId}/unlock`)
}

export default userApi
