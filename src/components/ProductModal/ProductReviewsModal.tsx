// ProductReviewsModal.tsx

import React, { useCallback, useEffect, useState } from 'react'
import { repliesApi, reviewsApi } from '../../api/media.api'
import { Review } from '../../types/media.type'
import { formatDateToDDMMYYYY } from '../../utils/validForm'
import { ReplyFormModal } from './ReplyForm'
import { toast } from 'react-toastify'
import { useAppContext } from '../../context/AuthContext'
import { Role } from '../../constants/Roles'

interface ProductReviewsModalProps {
  productItemId: string
  productName: string
  onClose: () => void
}

const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({ productItemId, onClose, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const { profile } = useAppContext()

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // API CALL: GET REVIEWS BY PRODUCT ITEM ID
      const response = await reviewsApi.getReviewsByProductItemId(productItemId)
      setReviews(response.data.data)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setError('Failed to load reviews for this product.')
    } finally {
      setIsLoading(false)
    }
  }, [productItemId, refetchTrigger])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Function to handle reply deletion
  const handleDeleteReply = async (replyId: string) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        // API CALL: DELETE REPLY
        const res = await repliesApi.deleteReply(replyId)

        setRefetchTrigger((prev) => prev + 1)
        toast.error(res.data.message)
        fetchReviews() // Refresh reviews list
      } catch (error) {
        console.error('Failed to delete reply:', error)
        alert('Failed to delete reply. Please try again.')
      }
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center border-b pb-3 mb-4'>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white truncate'>
            Product Reviews (Name: {productName})
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          >
            &times;
          </button>
        </div>

        {isLoading && <p className='text-center dark:text-gray-300'>Loading reviews...</p>}
        {error && (
          <div className='p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <p className='text-center dark:text-gray-300'>No reviews found for this product.</p>
        )}

        {/* Reviews List */}
        <div className='space-y-6'>
          {reviews.map((review) => (
            <div key={review.id} className='p-4 border rounded-lg dark:border-gray-700'>
              <div className='flex items-center space-x-3 mb-2'>
                <img
                  src={review.avatarUrl || 'https://via.placeholder.com/40'}
                  alt={review.userName}
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div>
                  <p className='font-semibold text-gray-900 dark:text-white'>{review.userName}</p>
                  <div className='flex items-center text-sm text-yellow-500'>
                    {/* Star Rating Display */}
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${i < review.ratingValue ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    <span className='ml-2 text-gray-500 dark:text-gray-400 text-xs'>({review.ratingValue} / 5)</span>
                  </div>
                </div>
                <p className='text-xs text-gray-400 ml-auto'>{new Date(review.lastUpdatedTime).toLocaleDateString()}</p>
              </div>

              {/* Review Content */}
              <p className='text-gray-700 dark:text-gray-300 mt-2'>{review.comment}</p>

              {/* Review Images (if any) */}
              {review.reviewImages && review.reviewImages.length > 0 && (
                <div className='flex space-x-2 mt-3'>
                  {review.reviewImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className='w-16 h-16 object-cover rounded-md border dark:border-gray-600 cursor-pointer'
                    />
                  ))}
                </div>
              )}

              {/* Review Reply Section */}
              {/* Khối chính kiểm tra xem đã có reply hay chưa */}
              {review.reply ? (
                // --- 1. ĐÃ CÓ REPLY ---
                <div className='mt-4 ml-8 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md'>
                  <div className='flex items-center space-x-2'>
                    <p className='font-semibold text-indigo-700 dark:text-indigo-300'>
                      {review.reply.userName} (Admin)
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Replied on: {formatDateToDDMMYYYY(review.reply.lastUpdatedTime as string)}
                    </p>
                  </div>
                  <p className='text-gray-700 dark:text-gray-300 mt-1'>{review.reply.replyContent}</p>

                  {/* Action Buttons: CHỈ HIỂN THỊ KHI LÀ ADMIN (điều kiện này đã đúng) */}
                  {profile?.role === Role.ADMIN && (
                    <div className='flex space-x-3 mt-2'>
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className='text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
                      >
                        Edit Reply
                      </button>
                      <button
                        onClick={() => handleDeleteReply(review.reply!.id)}
                        className='text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium'
                      >
                        Delete Reply
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                profile?.role === Role.ADMIN && (
                  <div className='mt-4 flex justify-end'>
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      // Thêm Dark Mode styles để nhất quán
                      className='text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
                    >
                      Reply to this Review
                    </button>
                  </div>
                )
              )}
              {/* Render the form if this review is selected for reply or edit */}
              {replyingTo === review.id && (
                <ReplyFormModal
                  setRefetchTrigger={setRefetchTrigger}
                  reviewId={review.id}
                  existingReply={review.reply}
                  onReplySuccess={fetchReviews}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductReviewsModal
