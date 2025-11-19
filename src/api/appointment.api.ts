import { Appointment, AppointmentForm, AppointmentResponse } from '../types/appoinment.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const APPOINTMENTS = '/appointments'

export const appointmentApi = {
  getAppoinments: () => http.get<AppointmentResponse>(`${APPOINTMENTS}`),

  getAppoinmentByBeatyAdvisorId: (BeatyAdvisorId: string) =>
    http.get<SuccessResponse<Appointment[]>>(`${APPOINTMENTS}/staff/${BeatyAdvisorId}`),

  createAppoinments: (body: AppointmentForm) => http.post<AppointmentResponse>(`${APPOINTMENTS}`, body),

  updateAppoinments: (apppoimentId: string, appoinmentForm: AppointmentForm) =>
    http.put<AppointmentResponse>(`${APPOINTMENTS}/${apppoimentId}`, appoinmentForm),

  deleteAppoiment: (apppoimentId: string) => http.delete<AppointmentResponse>(`${APPOINTMENTS}/${apppoimentId}`)

  //   createUser: (body: UserForm) => http.post<PagingData<User>>(USERS, body),

  //   getUsersById: (userId: string) => http.get<UserByIdResponse>(`${USERS}/${userId}`),

  //   updateUser: (userId: string, body: UserForm) => http.put<UserByIdResponse>(`${USERS}/${userId}`, body),

  //   // deleteUser: (userId: string) => http.delete(`${USERS}/${userId}`, body)
  //   lockUser: (userId: string, banReason: string) =>
  //     http.patch<UserByIdResponse>(`${USERS}/${userId}/lock`, { banReason }),
  //   unLockUser: (userId: string) => http.patch<UserByIdResponse>(`${USERS}/${userId}/unlock`)
}
