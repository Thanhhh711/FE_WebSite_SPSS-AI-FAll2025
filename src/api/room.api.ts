import { Room, RoomForm } from '../types/room.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const ROOMS = 'rooms'

export interface RoomAvailableParams {
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export const roomApi = {
  getRooms: () => http.get<SuccessResponse<Room[]>>(`${ROOMS}`),

  getRoomById: (roomID: string) => http.get<SuccessResponse<Room>>(`${ROOMS}/${roomID}`),

  createRoom: (body: RoomForm) => http.post<SuccessResponse<Room>>(`${ROOMS}`, body),

  updateRoom: (roomID: string, roomsForm: RoomForm) => http.put<SuccessResponse<Room>>(`${ROOMS}/${roomID}`, roomsForm),

  deleteRoom: (roomID: string) => http.delete<SuccessResponse<Room>>(`${ROOMS}/${roomID}`),

  getRoomsAvailable: (params: RoomAvailableParams) =>
    http.get<SuccessResponse<Room[]>>(`${ROOMS}/available`, {
      params: {
        startDate: `${params.startDate}T00:00:00`,
        endDate: `${params.endDate}T00:00:00`,
        startTime: params.startTime,
        endTime: params.endTime
      }
    })
}
