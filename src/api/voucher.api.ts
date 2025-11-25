import { Voucher, VoucherForm } from '../types/vourcher.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const VOUCHERS = 'vouchers'

const vouchersApi = {
  getVouchers: () => http.get<SuccessResponse<Voucher[]>>(`${VOUCHERS}`),

  getVoucherById: (voucherId: string) => http.get<SuccessResponse<Voucher>>(`${VOUCHERS}/${voucherId}`),

  createVoucher: (body: VoucherForm) => http.post<SuccessResponse<Voucher>>(`${VOUCHERS}`, body),

  updateVoucher: (voucherId: string, body: VoucherForm) =>
    http.put<SuccessResponse<Voucher>>(`${VOUCHERS}/${voucherId}`, body),

  deleteVoucher: (voucherId: string) => http.delete<SuccessResponse<null>>(`${VOUCHERS}/${voucherId}`)
}

export default vouchersApi
