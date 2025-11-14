export const AppointmentStatusCode = {
  Pending: 0,
  Confirmed: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
  NoShow: 5,
  Rescheduled: 6
} as const

export const APPOINTMENT_STATUS_MAP = {
  [AppointmentStatusCode.Pending]: {
    name: 'Chờ xác nhận',
    calendar: 'Warning', // Yellow/Orange
    dotColor: 'bg-yellow-500'
  },
  [AppointmentStatusCode.Confirmed]: {
    name: 'Đã xác nhận',
    calendar: 'Success', // Green
    dotColor: 'bg-green-500'
  },
  [AppointmentStatusCode.InProgress]: {
    name: 'Đang thực hiện',
    calendar: 'Primary', // Blue
    dotColor: 'bg-blue-500'
  },
  [AppointmentStatusCode.Completed]: {
    name: 'Hoàn thành',
    calendar: 'Primary', // Blue
    dotColor: 'bg-indigo-500'
  },
  [AppointmentStatusCode.Cancelled]: {
    name: 'Đã hủy',
    calendar: 'Danger', // Red
    dotColor: 'bg-red-500'
  },
  [AppointmentStatusCode.NoShow]: {
    name: 'Không đến',
    calendar: 'Danger',
    dotColor: 'bg-red-800'
  },
  [AppointmentStatusCode.Rescheduled]: {
    name: 'Đã reschedule',
    calendar: 'Warning',
    dotColor: 'bg-orange-500'
  }
} as const

// Tạo một mảng dễ dàng cho việc render Radio Button trong Modal
export const APPOINTMENT_STATUS_LIST = Object.entries(APPOINTMENT_STATUS_MAP).map(([code, value]) => ({
  code: Number(code),
  name: value.name,
  dotColor: value.dotColor
}))
