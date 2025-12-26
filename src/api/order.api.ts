import { OrderResponse } from '../types/order.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const ORDERS = 'orders'

interface ChangeOrderStatusBody {
  status: string
  cancelReasonId: string | null
}

export const orderApi = {
  getOrders: () => http.get<SuccessResponse<OrderResponse[]>>(ORDERS),

  changeStatusOrder: (id: string, body: ChangeOrderStatusBody) =>
    http.put<SuccessResponse<OrderResponse[]>>(`${ORDERS}/${id}/status`, body)
}
