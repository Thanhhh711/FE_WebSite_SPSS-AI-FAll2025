export interface BlogSection {
  contentType: string
  subtitle: string
  content: string
  order: number
}

export interface Blog {
  id: string
  title: string
  description: string
  thumbnail: string
  sections: BlogSection[]
  lastUpdatedTime: string
  authorName: string
}

export interface BlogForm {
  title: string
  description: string
  thumbnail: string
  sections: BlogSection[]
}

export interface ReplyForm {
  reviewId: string
  replyContent: string
}

export interface Reply {
  id: string
  reviewId: string
  avatarUrl: string
  userName: string
  replyContent: string
  lastUpdatedTime: string | null
}

export interface ReviewProductImage {
  id: string
  imageUrl: string
  isThumbnail: boolean
}

export interface ReviewReply {
  id: string
  reviewId: string
  avatarUrl: string
  userName: string
  replyContent: string
  lastUpdatedTime: string | null
}

export interface Review {
  id: string
  userName: string
  avatarUrl: string
  productImage: ReviewProductImage[]
  productId: string
  productName: string
  reviewImages: string[]
  ratingValue: number
  comment: string
  lastUpdatedTime: string
  reply: ReviewReply | null
  isEditble: boolean
}
