import { AppPath } from './Paths'

export enum Role {
  ADMIN = 'Admin',
  CUSTOMER = 'Customer',

  STORE_STAFF = 'StoreStaff',
  BEAUTY_ADVISOR = 'BeautyAdvisor',
  SCHEDULE_MANAGER = 'ScheduleManager'
}

export const roleRedirectPath = (role: string | undefined) => {
  if (!role) return AppPath.SIGN_IN

  switch (
    role.toLowerCase() // normalize
  ) {
    case 'admin':
      return AppPath.HOME
    case 'beautyadvisor':
      return AppPath.CALENDAR
    case 'schedulemanager':
      return AppPath.CALENDAR
    case 'storestaff':
      return AppPath.BASIC_TABLES_ORDER
    case 'customer':
      return AppPath.HOME
    default:
      return AppPath.NOT_FOUND
  }
}
