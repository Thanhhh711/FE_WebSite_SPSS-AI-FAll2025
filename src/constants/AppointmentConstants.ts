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
    name: 'Pending',
    calendar: 'Warning', // Yellow/Orange
    dotColor: 'bg-yellow-500'
  },
  [AppointmentStatusCode.Confirmed]: {
    name: 'Confirmed',
    calendar: 'Success', // Green
    dotColor: 'bg-green-500'
  },
  [AppointmentStatusCode.InProgress]: {
    name: 'In Progress',
    calendar: 'Primary', // Blue
    dotColor: 'bg-blue-500'
  },
  [AppointmentStatusCode.Completed]: {
    name: 'Completed',
    calendar: 'Primary', // Blue
    dotColor: 'bg-indigo-500'
  },
  [AppointmentStatusCode.Cancelled]: {
    name: 'Cancelled',
    calendar: 'Danger', // Red
    dotColor: 'bg-red-500'
  },
  [AppointmentStatusCode.NoShow]: {
    name: 'No Show',
    calendar: 'Danger',
    dotColor: 'bg-red-800'
  },
  [AppointmentStatusCode.Rescheduled]: {
    name: 'Rescheduled',
    calendar: 'Warning',
    dotColor: 'bg-orange-500'
  }
} as const

// Array for rendering radio buttons in a modal
export const APPOINTMENT_STATUS_LIST = Object.entries(APPOINTMENT_STATUS_MAP).map(([code, value]) => ({
  code: Number(code),
  name: value.name,
  dotColor: value.dotColor
}))

export type AppointmentStatus = (typeof AppointmentStatusCode)[keyof typeof AppointmentStatusCode]
