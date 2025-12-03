import { Blog, BlogForm, Reply, ReplyForm, Review, ReviewReply } from '../types/media.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

export const BLOGS = 'blogs'

export const blogsApi = {
  getBlogs: () => http.get<SuccessResponse<Blog[]>>(`${BLOGS}`),

  getBlogById: (blogId: string) => http.get<SuccessResponse<Blog>>(`${BLOGS}/${blogId}`),

  createBlog: (body: BlogForm) => http.post<SuccessResponse<Blog>>(`${BLOGS}`, body),

  updateBlog: (blogId: string, body: BlogForm) => http.put<SuccessResponse<Blog>>(`${BLOGS}/${blogId}`, body),

  deleteBlog: (blogId: string) => http.delete<SuccessResponse<Blog>>(`${BLOGS}/${blogId}`)
}

export const REPLIES = 'replies'

export const repliesApi = {
  createReply: (body: ReplyForm) => http.post<SuccessResponse<Reply>>(`${REPLIES}`, body),

  updateReply: (replyId: string, body: ReplyForm) =>
    http.put<SuccessResponse<ReviewReply>>(`${REPLIES}/${replyId}`, body),

  deleteReply: (replyId: string) => http.delete<SuccessResponse<Reply>>(`${REPLIES}/${replyId}`)
}

export const REVIEWS = 'reviews'

export const reviewsApi = {
  getReviewsByProductItemId: (productItemId: string) =>
    http.get<SuccessResponse<Review[]>>(`${REVIEWS}/product/${productItemId}`)
}
