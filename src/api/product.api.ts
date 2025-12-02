import { Product, ProductForm } from '../types/product.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const PRODUCTS = 'products'
// const PRODUCTS = `${ProductOrderService}/products`  // nếu backend yêu cầu prefix

export const productApi = {
  getProducts: () => http.get<SuccessResponse<Product[]>>(PRODUCTS),

  getProductById: (productId: string) => http.get<SuccessResponse<Product>>(`${PRODUCTS}/${productId}`),

  createProduct: (body: ProductForm) => http.post<SuccessResponse<Product>>(PRODUCTS, body),

  updateProduct: (productId: string, body: ProductForm) =>
    http.put<SuccessResponse<Product>>(`${PRODUCTS}/${productId}`, body),

  deleteProduct: (productId: string) => http.delete<SuccessResponse<null>>(`${PRODUCTS}/${productId}`)
}
