/* eslint-disable @typescript-eslint/no-explicit-any */
export interface VoucherForm {
  code: string
  description: string
  discountRate: number
  minimumOrderValue: number
  maximumDiscountAmount: number
  startDate: string
  endDate: string
  usageLimit: number
  status?: VoucherStatusEnum
}

export interface Voucher {
  id: string
  code: string
  description: string
  status: VoucherStatusEnum
  discountRate: number
  minimumOrderValue: number
  maximumDiscountAmount: number
  startDate: string
  endDate: string
  usageLimit: number
  isDeleted: boolean
  orders: any[]
}

export enum VoucherStatusEnum {
  Inactive = 0,
  Active = 1,
  Expired = 2,
  Scheduled = 3
}
