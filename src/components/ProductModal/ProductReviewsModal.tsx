/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react'
import { repliesApi, reviewsApi } from '../../api/media.api'
import { Review } from '../../types/media.type'
import { formatDateToDDMMYYYY } from '../../utils/validForm'
import { ReplyFormModal } from './ReplyForm'
import { toast } from 'react-toastify'
import { useAppContext } from '../../context/AuthContext'
import { Role } from '../../constants/Roles'
import { X, Star, MessageCircle, Trash2, Edit2, Info } from 'lucide-react'

interface ProductReviewsModalProps {
  productItemId: string
  productName: string
  onClose: () => void
}

const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({ productItemId, onClose, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const { profile } = useAppContext()

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await reviewsApi.getReviewsByProductItemId(productItemId)
      setReviews(response.data.data)
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }, [productItemId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDeleteReply = async (replyId: string) => {
    console.log('replyId', replyId)

    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        await repliesApi.deleteReply(replyId)
        toast.success('Reply deleted successfully')
        fetchReviews()
      } catch (err) {
        toast.error('Error deleting reply')
      }
    }
  }

  return (
    // Overlay with Glassmorphism Blur
    <div className='fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-500/20 backdrop-blur-md transition-all duration-300'>
      {/* Modal Container */}
      <div className='bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col'>
        {/* Header Section */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50'>
          <div>
            <h3 className='text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight'>
              Product Reviews
            </h3>
            <p className='text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mt-1'>ID: {productName}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all text-gray-400 hover:text-rose-500'
          >
            <X size={24} />
          </button>
        </div>

        {/* Reviews List (Scrollable) */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-20 space-y-4'>
              <div className='w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Syncing reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className='text-center py-16'>
              <div className='bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-300'>
                <MessageCircle size={40} />
              </div>
              <p className='text-sm font-black text-gray-400 uppercase tracking-widest'>No feedback found yet.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className='group bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] hover:border-brand-200 transition-all'
              >
                {/* User Info & Rating */}
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-sm'>
                      {review.userName.substring(0, 2)}
                    </div>
                    <div>
                      <p className='font-black text-gray-900 dark:text-white text-sm leading-none mb-1'>
                        {review.userName}
                      </p>
                      {/* <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tight'>
                        Posted on {formatDateToDDMMYYYY(review.)}
                      </p> */}
                    </div>
                  </div>
                  <div className='flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm'>
                    <span className='text-xs font-black text-amber-500 mr-1.5'>{review.ratingValue}</span>
                    <Star size={14} className='fill-amber-500 text-amber-500' />
                  </div>
                </div>

                {/* Review Content */}
                <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-4'>
                  {review.comment}
                </p>

                {/* Admin Reply Section */}
                {review.reply ? (
                  <div className='mt-4 p-5 bg-white dark:bg-gray-800 rounded-3xl border-l-4 border-brand-500 shadow-sm relative'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[9px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg'>
                          Official Reply
                        </span>
                      </div>
                      {profile?.role === Role.ADMIN && (
                        <div className='flex gap-1'>
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className='p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all'
                            title='Edit Reply'
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReply(review.reply!.id)}
                            className='p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all'
                            title='Delete Reply'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className='text-sm italic font-medium text-gray-700 dark:text-gray-200'>
                      "{review.reply.replyContent}"
                    </p>
                  </div>
                ) : (
                  profile?.role === Role.ADMIN && (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className='mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-all'
                    >
                      <MessageCircle size={14} /> Send Response
                    </button>
                  )
                )}

                {/* Reply Form Injection */}
                {replyingTo === review.id && (
                  <div className='mt-6 animate-in fade-in slide-in-from-top-2 duration-300'>
                    <ReplyFormModal
                      setRefetchTrigger={() => {}}
                      reviewId={review.id}
                      existingReply={review.reply}
                      onReplySuccess={() => {
                        setReplyingTo(null)
                        fetchReviews()
                      }}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className='p-5 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex justify-center items-center gap-2'>
          <Info size={14} className='text-gray-400' />
          <p className='text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]'>
            Feedback Management Module • {reviews.length} entries
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductReviewsModal
