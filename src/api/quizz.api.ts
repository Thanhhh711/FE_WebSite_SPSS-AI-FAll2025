import { SuccessResponse } from './../utils/utils.type'
import { CreateSkinTestRequest, EditQuestion, SkinTest, SkinTestDetail } from '../types/quizz.type'
import http from '../utils/http'

export const URL_GET_QUIZZ = 'quizzes'

const quizzApi = {
  getQuizzs: () => http.get<SuccessResponse<SkinTest[]>>(URL_GET_QUIZZ),
  getQuizzsById: (id: string) => http.get<SuccessResponse<SkinTestDetail>>(`${URL_GET_QUIZZ}/${id}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createQuizzs: (body: CreateSkinTestRequest) => http.post<SuccessResponse<any>>(`${URL_GET_QUIZZ}/baumann-full`, body),
  editQuizzs: (id: string, body: EditQuestion) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http.put<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${id}/baumann-full`, body),
  deleteQuizzs: (id: string) => http.delete(`${URL_GET_QUIZZ}/baumann-full/${id}`)
}

export default quizzApi
