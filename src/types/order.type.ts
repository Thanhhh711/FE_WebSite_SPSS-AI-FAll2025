export interface OrderResponse {
  id: string
  status: OrderStatus
  orderTotal: number
  cancelReasonId: string | null
  userId: string
  paymentMethodId: string
  addressId: string
  voucherId: string | null
  createdBy: string
  lastUpdatedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  isDeleted: boolean
  deletedTime: string | null
  deletedBy: string | null

  cancelReason: string | null
  paymentType: string
  voucher: string | null

  user: OrderUser
  orderDetails: OrderDetail[]
  statusChanges: StatusChange[]
}

export interface OrderUser {
  userId: string
  roleId: string | null
  roleName: string
  userName: string
  surName: string
  firstName: string
  emailAddress: string
  phoneNumber: string
  avatarUrl: string
  status: string
  skinTypeId: number | null
  skinTypeName: string | null
  skinConditionId: number | null
  skinConditionName: string | null
  age: number | null
  doB: string | null
  diet: string | null
  dailyRoutine: string | null
  allergy: string | null
  certificate: string | null

  addresses: OrderUserAddress[]
}

export interface OrderUserAddress {
  id: string
  countryId: number
  countryName: string
  customerName: string
  phoneNumber: string
  isDefault: boolean
  streetNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  ward: string
  postCode: string
  province: string
}

export interface OrderDetail {
  id: string
  quantity: number
  price: number
  orderId: string
  productId: string
  productName: string
  brandName: string
  thumbnailUrl: string
}

export interface StatusChange {
  id: string
  date: string
  status: OrderStatus
  orderId: string
}

export enum OrderStatus {
  Pending = 'Pending Payment',
  Processing = 'Processing',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}
