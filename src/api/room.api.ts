import { Room, RoomForm } from '../types/room.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const ROOMS = 'rooms'
export const roomApi = {
  getRooms: () => http.get<SuccessResponse<Room[]>>(`${ROOMS}`),

  getRoomById: (roomID: string) => http.get<SuccessResponse<Room>>(`${ROOMS}/${roomID}`),

  createRoom: (body: RoomForm) => http.post<SuccessResponse<Room>>(`${ROOMS}`, body),

  updateRoom: (roomID: string, roomsForm: RoomForm) => http.put<SuccessResponse<Room>>(`${ROOMS}/${roomID}`, roomsForm),

  deleteRoom: (roomID: string) => http.delete<SuccessResponse<Room>>(`${ROOMS}/${roomID}`)
}
