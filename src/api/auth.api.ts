import { Role } from '../constants/Roles'
import { AuthResponse } from '../types/auth.type'
import http from '../utils/http'

export const URL_LOGIN = 'authentication/login'
export const URL_REGISTER_PRIVILEGED = 'authentication/register-privileged'
export const URL_LOGOUT = 'authentication/logout'
export const URL_CHANGE_PASSWORD = 'authentication/change-password'
export const URL_VERIFY_LOGIN = 'authentication/verify-login-otp'
// export const URL_REFRESH_TOKEN = 'refresh-access-token'

const authApi = {
  loginAccount: (body: { usernameOrEmail: string; password: string }) => http.post<AuthResponse>(URL_LOGIN, body),

  logoutAccount: (body: { refreshToken: string }) => http.post<AuthResponse>(URL_LOGOUT, body),

  registerPrivileged: (body: {
    userName: string
    email: string
    password: string
    phoneNumber: string
    roleName: Role
  }) => http.post<AuthResponse>(URL_REGISTER_PRIVILEGED, body),

  changePassWord: (body: { currentPassword: string; newPassword: string }) =>
    http.post<AuthResponse>(URL_CHANGE_PASSWORD, body),

  //   getProfile: async (params: { name: string }) => await http.get<GetProfileResponse>(URL_GET_USER + params.name)

  verifyLoginOtp: (body: { email: string; code: string }) => http.post<AuthResponse>(URL_VERIFY_LOGIN, body)
}

export default authApi
