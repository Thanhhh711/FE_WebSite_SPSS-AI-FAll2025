export interface Transaction {
  id: string
  userId: string
  userName: string
  gatewayTransactionId: string
  orderId: string | null
  appointmentId: string
  orderCode: number
  transactionType: string
  amount: number
  status: 'Approved' | 'Pending' | 'Rejected' | string
  description: string
  createdTime: string
  lastUpdatedTime: string
}
