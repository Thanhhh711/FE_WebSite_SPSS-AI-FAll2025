import { PaginaResponse } from '../types/auth.type'
import { Role } from '../types/role.type'
import http from '../utils/http'

const ROLES = 'roles'

export const roleApi = {
  getRoles: () => http.get<PaginaResponse<Role[]>>(`${ROLES}`)
}
