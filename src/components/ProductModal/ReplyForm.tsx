import { useState } from 'react'
import { toast } from 'react-toastify'
import { repliesApi } from '../../api/media.api'
import { ReplyForm, ReviewReply } from '../../types/media.type'

// Internal component for the Reply Form
interface ReplyFormProps {
  reviewId: string
  existingReply: ReviewReply | null // Null for Create, object for Update
  onReplySuccess: () => void
  onCancel: () => void
  setRefetchTrigger: React.Dispatch<React.SetStateAction<number>>
}

export const ReplyFormModal: React.FC<ReplyFormProps> = ({
  reviewId,
  existingReply,
  onReplySuccess,
  onCancel,
  setRefetchTrigger
}) => {
  // const {product} = use
  const [replyContent, setReplyContent] = useState(existingReply?.replyContent || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (replyContent.trim().length < 5) {
      setError('Reply content must be at least 5 characters.')
      return
    }

    setIsSubmitting(true)
    const body: ReplyForm = { reviewId, replyContent }

    try {
      if (existingReply) {
        console.log('id Reppy', existingReply.id)

        const res = await repliesApi.updateReply(existingReply.id, body)

        setRefetchTrigger((prev) => prev + 1)

        toast.success(res.data.message)
      } else {
        const res = await repliesApi.createReply(body)
        setRefetchTrigger((prev) => prev + 1)

        toast.success(res.data.message)
      }
      onReplySuccess()
      onCancel() // Close the form after success
    } catch (err) {
      console.error('Reply submission failed:', err)
      setError(`Failed to ${existingReply ? 'update' : 'submit'} reply.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>
      <h5 className='font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2'>
        {existingReply ? 'Edit Reply' : 'Reply to Review'}
      </h5>
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        rows={3}
        placeholder='Write your reply here...'
        className='w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white'
      />
      {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
      <div className='flex justify-end space-x-2 mt-2'>
        <button
          type='button'
          onClick={onCancel}
          className='px-3 py-1 text-sm border rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className={`px-3 py-1 text-sm rounded-md text-white ${
            isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : existingReply ? 'Update Reply' : 'Post Reply'}
        </button>
      </div>
    </form>
  )
}
