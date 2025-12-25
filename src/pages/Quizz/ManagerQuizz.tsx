/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BookOpen, Edit3, HelpCircle, Layout, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SkinTest } from '../../types/quizz.type'
import QuizForm from './QuizForm'
import QuizDetail from './QuizDetail'
import { quizzApi } from '../../api/quizz.api'
import EditQuizForm from './EditQuizForm'
import ConfirmModal from '../../components/CalendarModelDetail/ConfirmModal'

export const SkinTestManager = () => {
  const [quizzes, setQuizzes] = useState<SkinTest[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<SkinTest | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)
  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const res = await quizzApi.getQuizzs()
      setQuizzes(res.data.data)
    } catch (error) {
      console.error('Lỗi tải danh sách:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  // Hàm mở Modal xác nhận
  const openConfirmDelete = (id: string) => {
    setQuizToDelete(id)
    setIsConfirmOpen(true)
  }

  // Hàm thực hiện xóa sau khi đã xác nhận
  const handleConfirmDelete = async () => {
    if (!quizToDelete) return

    try {
      await quizzApi.deleteQuizzs(quizToDelete)
      fetchQuizzes() // Tải lại danh sách
      setIsConfirmOpen(false)
      setQuizToDelete(null)
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
    }
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] dark:bg-gray-800 p-4 md:p-8 font-sans text-slate-900'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Section */}
        <header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-300'>
              Skin Test Management
            </h1>
            <p className='text-slate-500 mt-1'>Set up and customize Baumann skin type surveys.</p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setIsGuideOpen(true)}
              className='inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm'
            >
              <HelpCircle size={20} className='text-indigo-500' /> Guide
            </button>
            {!isFormOpen && !editingQuiz && (
              <button
                onClick={() => {
                  setIsFormOpen(true)
                  setEditingQuiz(null)
                }}
                className='inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95'
              >
                <Plus size={20} /> Create New Test
              </button>
            )}
          </div>
        </header>

        {/* Guide Modal */}
        {isGuideOpen && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
            <div className='bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200'>
              <div className='flex justify-between items-center mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-indigo-100 text-indigo-600 rounded-lg'>
                    <BookOpen size={24} />
                  </div>
                  <h2 className='text-2xl font-bold'>System Guide</h2>
                </div>
                <button onClick={() => setIsGuideOpen(false)} className='text-slate-400 hover:text-slate-600 p-2'>
                  <X size={20} />
                </button>
              </div>

              <div className='space-y-6'>
                <GuideStep number='1' title='Create Survey' desc="Click 'Create New Test' and enter a name." />
                <GuideStep
                  number='2'
                  title='Configure Questions'
                  desc='Add questions and assign them to categories: OD, SR, PN, or WT.'
                />
                <GuideStep
                  number='3'
                  title='Result Mapping'
                  desc='Define score ranges for each of the 16 skin types.'
                />
              </div>

              <button
                onClick={() => setIsGuideOpen(false)}
                className='w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors'
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        )}

        {/* Main Content Areas */}
        {viewingId ? (
          <QuizDetail id={viewingId} onClose={() => setViewingId(null)} />
        ) : editingQuiz ? (
          /* FORM EDIT RIÊNG BIỆT */
          <EditQuizForm
            quizId={editingQuiz.id}
            onClose={() => {
              setEditingQuiz(null)
              fetchQuizzes()
            }}
          />
        ) : isFormOpen ? (
          <QuizForm
            onClose={() => {
              setIsFormOpen(false)
              fetchQuizzes()
            }}
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {loading ? (
              <div className='col-span-full py-20 text-center text-slate-400 flex flex-col items-center gap-3'>
                <Loader2 className='animate-spin text-indigo-500' size={32} />
                Loading data...
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className='group bg-white rounded-2xl border dark:bg-gray-800 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300'
                >
                  <div className='flex justify-between items-start mb-6'>
                    <div className='p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform'>
                      <Layout size={24} />
                    </div>
                    {quiz.isDefault && (
                      <span className='bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-100'>
                        Default
                      </span>
                    )}
                  </div>

                  <h3 className='font-bold text-slate-800 text-xl mb-2 line-clamp-1 dark:text-gray-300'>{quiz.name}</h3>
                  <p className='text-slate-400 text-sm mb-6'>
                    Updated: {new Date(quiz.createdTime).toLocaleDateString('en-US')}
                  </p>

                  <div className='flex justify-between items-center pt-5 border-t border-slate-50 dark:border-slate-700'>
                    <span className='px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400'>
                      {quiz.totalQuestions} questions
                    </span>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => setViewingId(quiz.id)}
                        className='p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors'
                      >
                        <Layout size={18} />
                      </button>
                      <button
                        onClick={() => setEditingQuiz(quiz)}
                        className='p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors'
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => openConfirmDelete(quiz.id)} // Gọi hàm mở Modal thay vì handleDelete cũ
                        className='p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setQuizToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title='Delete Quiz'
        message='Are you sure you want to delete this quiz? This action cannot be undone.'
      />
    </div>
  )
}
const GuideStep = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className='flex gap-4'>
    <div className='flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100'>
      {number}
    </div>
    <div>
      <h4 className='font-bold text-slate-800'>{title}</h4>
      <p className='text-slate-500 text-sm leading-relaxed'>{desc}</p>
    </div>
  </div>
)
