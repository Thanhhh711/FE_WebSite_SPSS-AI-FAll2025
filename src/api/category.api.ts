import { Category, CategoryForm } from '../types/category.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const CATEGORY = 'product-categories'

export const categoryApi = {
  getCategories: () => http.get<SuccessResponse<Category[]>>(`${CATEGORY}`),

  getCategoryById: (categoryId: string) => http.get<SuccessResponse<Category>>(`${CATEGORY}/${categoryId}`),

  createCategory: (body: CategoryForm) => http.post<SuccessResponse<Category>>(`${CATEGORY}`, body),

  updateCategory: (categoryId: string, body: CategoryForm) =>
    http.put<SuccessResponse<Category>>(`${CATEGORY}/${categoryId}`, body),

  deleteCategory: (categoryId: string) => http.delete<SuccessResponse<Category>>(`${CATEGORY}/${categoryId}`)
}
