import { Slot, SlotForm } from '../types/slot.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const SLOTS = 'slots'
export const slotApi = {
  getSlots: () => http.get<SuccessResponse<Slot[]>>(`${SLOTS}`),

  getSlotById: (slotID: string) => http.get<SuccessResponse<Slot>>(`${SLOTS}/registrations/${slotID}`),

  createSlot: (body: SlotForm) => http.post<SuccessResponse<Slot>>(`${SLOTS}`, body),

  updateSlot: (slotID: string, slotForm: SlotForm) => http.put<SuccessResponse<Slot>>(`${SLOTS}/${slotID}`, slotForm),

  deleteSlot: (slotID: string) => http.delete<SuccessResponse<Slot>>(`${SLOTS}/${slotID}`)
}
