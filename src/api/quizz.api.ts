/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateSkinTestRequest,
  QuestionOption,
  QuestionOptionEditForm,
  QuizEditForm,
  QuizQuestion,
  QuizQuestionEditForm,
  QuizSetEditSkinTypeScore,
  QuizSetSkinTypeScore,
  SkinTest,
  SkinTestDetail
} from '../types/quizz.type'
import http from '../utils/http'
import { SuccessResponse } from './../utils/utils.type'

export const URL_GET_QUIZZ = 'quizzes'
export const URL_QUESTIONS = 'questions'
export const URL_RESULTS = 'results'
export const URL_OPTIONS = 'options'

export const quizzApi = {
  getQuizzs: () => http.get<SuccessResponse<SkinTest[]>>(URL_GET_QUIZZ),
  getQuizzsById: (id: string) => http.get<SuccessResponse<SkinTestDetail>>(`${URL_GET_QUIZZ}/${id}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createQuizzs: (body: CreateSkinTestRequest) => http.post<SuccessResponse<any>>(`${URL_GET_QUIZZ}/baumann-full`, body),

  editQuizzs: (id: string, body: QuizEditForm) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http.put<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${id} `, body),

  deleteQuizzs: (id: string) => http.delete(`${URL_GET_QUIZZ}/${id}`)
}

export const questionApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createQuestion: (body: QuizQuestion) => http.post<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_QUESTIONS}`, body),

  editQuestion: (id: string, body: QuizQuestionEditForm) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http.put<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_QUESTIONS}/${id}`, body),

  deleteQuestion: (id: string) => http.delete(`${URL_GET_QUIZZ}/${URL_QUESTIONS}/${id}`)
}

export const optionApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createOption: (body: QuestionOption) => http.post<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_OPTIONS}`, body),

  editOption: (id: string, body: QuestionOptionEditForm) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http.put<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_OPTIONS}/${id}`, body),

  deleteOption: (id: string) => http.delete(`${URL_GET_QUIZZ}/${URL_OPTIONS}/${id}`)
}

export const resultApi = {
  getResultById: (id: string) => http.get<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_RESULTS}/${id}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createResult: (body: QuizSetSkinTypeScore) =>
    http.post<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_RESULTS}`, body),

  editResult: (id: string, body: QuizSetEditSkinTypeScore) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http.put<SuccessResponse<any>>(`${URL_GET_QUIZZ}/${URL_RESULTS}/${id}`, body),

  deleteResult: (id: string) => http.delete(`${URL_GET_QUIZZ}/${URL_RESULTS}/${id}`)
}
