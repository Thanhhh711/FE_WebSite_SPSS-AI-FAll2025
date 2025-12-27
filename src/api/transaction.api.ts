import { SuccessResponse } from './../utils/utils.type'
import http from '../utils/http'
import { Transaction } from '../types/transaction.type'

const TRANSACTION = 'transactions'

export const transactionApi = {
  getTransaction: () => {
    return http.get<SuccessResponse<Transaction[]>>(`${TRANSACTION}`)
  }
}
