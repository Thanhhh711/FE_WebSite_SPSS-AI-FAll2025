import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import { URL_LOGIN, URL_LOGOUT, URL_VERIFY_LOGIN } from '../api/auth.api'
import config from '../constants/config'
import { HttpStatusCode } from '../constants/HttpStatusCode.enum'
import { AuthResponse } from '../types/auth.type'
import { clearLS, getTokenFromLS, saveAccessTokenToLS, saveRefreshTokenToLS } from './auth'

// import { path } from '../constants/path'
// import { useNavigate } from 'react-router-dom'

class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  // navigate = useNavigate()
  constructor() {
    const { access_token, refresh_token } = getTokenFromLS()
    this.accessToken = access_token
    this.refreshToken = refresh_token
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        console.log(config.headers.Authorization)

        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
          console.log(config.headers.Authorization)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        console.log('url', url)

        if (url === URL_VERIFY_LOGIN || url === URL_LOGIN) {
          const data = response.data as AuthResponse
          console.log(data)
          this.accessToken = data.data.accessToken
          console.log('accessToken', data.data.accessToken)

          this.refreshToken = data.data.refreshToken
          console.log('refreshToken', data.data.refreshToken)

          //  Lưu local nè
          saveAccessTokenToLS(this.accessToken)
          saveRefreshTokenToLS(this.refreshToken)
          //   setProfileToLS(data.result.user)
        } else if (url === URL_LOGOUT) {
          console.log('đây')
          this.accessToken = ''
          this.refreshToken = ''
          clearLS()
          // this.navigate(path.home)
        }
        return response
      },
      (error: AxiosError) => {
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          console.log(error.response)

          const message = data?.message || error.message
          toast.error(message)
          console.log(message)
        }
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          // 401
          clearLS()
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
