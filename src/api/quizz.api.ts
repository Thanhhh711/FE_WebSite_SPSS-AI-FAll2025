import { SuccessResponse } from './../utils/utils.type'
import { CreateSkinTestRequest, SkinTest } from '../types/quizz.type'
import http from '../utils/http'

export const URL_GET_QUIZZ = 'quizzes'

const quizzApi = {
  getQuizzs: () => http.get<SuccessResponse<SkinTest[]>>(URL_GET_QUIZZ),

  createQuizzs: (body: CreateSkinTestRequest) => http.post(`${URL_GET_QUIZZ}/baumann-full`, body),
  editQuizzs: (id: string, body: CreateSkinTestRequest) => http.put(`${URL_GET_QUIZZ}${id}/baumann-full`, body),
  deleteQuizzs: (id: string) => http.delete(`${URL_GET_QUIZZ}/baumann-full/${id}`)
}

export default quizzApi
