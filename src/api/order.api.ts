import { OrderResponse } from '../types/order.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const ORDERS = 'orders'

export const orderApi = {
  getOrders: () => http.get<SuccessResponse<OrderResponse[]>>(ORDERS)
}
