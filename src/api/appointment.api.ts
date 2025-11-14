import { AppointmentResponse } from '../types/appoinment.type'
import http from '../utils/http'

const APPOINTMENTS = '/appointments'

export const appointmentApi = {
  getAppoinments: () => http.get<AppointmentResponse>(`${APPOINTMENTS}`)

  //   createUser: (body: UserForm) => http.post<PagingData<User>>(USERS, body),

  //   getUsersById: (userId: string) => http.get<UserByIdResponse>(`${USERS}/${userId}`),

  //   updateUser: (userId: string, body: UserForm) => http.put<UserByIdResponse>(`${USERS}/${userId}`, body),

  //   // deleteUser: (userId: string) => http.delete(`${USERS}/${userId}`, body)
  //   lockUser: (userId: string, banReason: string) =>
  //     http.patch<UserByIdResponse>(`${USERS}/${userId}/lock`, { banReason }),
  //   unLockUser: (userId: string) => http.patch<UserByIdResponse>(`${USERS}/${userId}/unlock`)
}
