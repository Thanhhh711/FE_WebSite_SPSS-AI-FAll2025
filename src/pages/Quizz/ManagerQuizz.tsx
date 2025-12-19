/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Edit3, Layout, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import quizzApi from '../../api/quizz.api'
import { SkinTest } from '../../types/quizz.type'
import QuizForm from './QuizForm'

export const SkinTestManager = () => {
  const [quizzes, setQuizzes] = useState<SkinTest[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<SkinTest | null>(null)
  const [loading, setLoading] = useState(false)

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài test này?')) {
      await quizzApi.deleteQuizzs(id)
      fetchQuizzes()
    }
  }

  return (
    <div className='min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Section */}
        <header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight text-slate-900'>Skin Test Management</h1>
            <p className='text-slate-500 mt-1'>Thiết lập và tùy chỉnh các bài khảo sát loại da Baumann.</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => {
                setIsFormOpen(true)
                setEditingQuiz(null)
              }}
              className='inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95'
            >
              <Plus size={20} /> Tạo bài test mới
            </button>
          )}
        </header>

        {isFormOpen ? (
          <QuizForm
            initialData={editingQuiz}
            onClose={() => {
              setIsFormOpen(false)
              fetchQuizzes()
            }}
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {loading ? (
              <div className='col-span-full py-20 text-center text-slate-400'>Đang tải dữ liệu...</div>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className='group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300'
                >
                  <div className='flex justify-between items-start mb-6'>
                    <div className='p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform'>
                      <Layout size={24} />
                    </div>
                    {quiz.isDefault && (
                      <span className='bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-100'>
                        Mặc định
                      </span>
                    )}
                  </div>

                  <h3 className='font-bold text-slate-800 text-xl mb-2 line-clamp-1'>{quiz.name}</h3>
                  <p className='text-slate-400 text-sm mb-6'>
                    Cập nhật: {new Date(quiz.createdTime).toLocaleDateString('vi-VN')}
                  </p>

                  <div className='flex justify-between items-center pt-5 border-t border-slate-50'>
                    <span className='px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600'>
                      {quiz.questions.length} câu hỏi
                    </span>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz)
                          setIsFormOpen(true)
                        }}
                        className='p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors'
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
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
    </div>
  )
}
