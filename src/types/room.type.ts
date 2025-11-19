export interface Room {
  id: string
  location: string
  floorNumber: number
  roomName: string
  capacity: number
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
}

export interface RoomForm {
  roomName: string
  location: string
  floorNumber: number
  capacity: number
}
