import { SuccessResponse } from './../utils/utils.type'
import { PagingData, UserByIdResponse } from '../types/auth.type'
import { SystermUserForm, User, UserForm } from '../types/user.type'
import http from '../utils/http'

export const USERS = 'users'
export const ACCOUNT = 'account'
const userApi = {
  getUsers: () => http.get<SuccessResponse<User[]>>(`${USERS}`),

  createUser: (body: UserForm) => http.post<PagingData<User>>(USERS, body),

  getUsersById: (userId: string) => http.get<UserByIdResponse>(`${USERS}/${userId}`),

  updateUser: (userId: string, body: SystermUserForm) => http.put<UserByIdResponse>(`${USERS}/${userId}`, body),

  editUser: (id: string, body: SystermUserForm) => http.put<SuccessResponse<User>>(`${USERS}/${id}`, body),

  // deleteUser: (userId: string) => http.delete(`${USERS}/${userId}`, body)
  lockUser: (userId: string, banReason: string) =>
    http.patch<UserByIdResponse>(`${USERS}/${userId}/lock`, { banReason }),
  unLockUser: (userId: string) => http.patch<UserByIdResponse>(`${USERS}/${userId}/unlock`),

  changeRole: (userId: string, roleId: string) => http.patch(`${USERS}/${userId}/assign-role`, { roleId }),

  getBeatyAdvisor: () => http.get<SuccessResponse<User[]>>(`${ACCOUNT}/beauty-advisor`)
}
export default userApi
