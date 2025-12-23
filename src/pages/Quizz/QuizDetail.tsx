/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, ArrowLeft, ChevronRight, ClipboardList, Clock, Loader2, Target, Hash } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SkinTestDetail } from '../../types/quizz.type'
import { quizzApi } from '../../api/quizz.api'

const QuizDetail = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const [quiz, setQuiz] = useState<SkinTestDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await quizzApi.getQuizzsById(id)
        setQuiz(res.data.data)
      } catch (error) {
        console.error('Error fetching details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-24 gap-4 dark:bg-slate-950 min-h-[400px]'>
        <Loader2 className='w-12 h-12 text-indigo-500 animate-spin' />
        <p className='text-slate-500 dark:text-slate-400 font-medium animate-pulse'>Loading test details...</p>
      </div>
    )
  }

  if (!quiz) return <div className='text-center py-20 text-slate-500 dark:text-slate-400'>Quiz data not found.</div>

  return (
    <div className='max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20'>
      {/* Top Navigation & Quick Info */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onClose}
            className='p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 shadow-sm'
          >
            <ArrowLeft size={20} className='text-slate-600 dark:text-slate-300' />
          </button>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-black text-slate-900 dark:text-white'>{quiz.name}</h2>
              {quiz.isDefault && (
                <span className='bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 uppercase'>
                  Default
                </span>
              )}
            </div>
            <div className='flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs mt-1'>
              <span className='flex items-center gap-1'>
                <Clock size={14} /> {new Date(quiz.createdTime).toLocaleDateString()}
              </span>
              <span className='w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full'></span>
              <span className='flex items-center gap-1'>
                <Hash size={12} /> {quiz.id}
              </span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800'>
            <p className='text-[10px] font-bold text-indigo-400 uppercase tracking-tighter'>Total Questions</p>
            <p className='text-lg font-black text-indigo-600 dark:text-indigo-400'>{quiz.questions.length}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left: Questions List */}
        <div className='lg:col-span-7 space-y-6'>
          <div className='flex items-center gap-2 px-2'>
            <ClipboardList className='text-indigo-500' size={22} />
            <h3 className='font-bold text-lg text-slate-800 dark:text-slate-200'>Survey Content</h3>
          </div>

          <div className='space-y-4'>
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className='group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-800 transition-all'
              >
                <div className='p-6'>
                  <div className='flex gap-4 mb-6'>
                    <span className='flex-shrink-0 w-10 h-10 bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center rounded-xl font-bold shadow-lg shadow-indigo-500/10'>
                      {idx + 1}
                    </span>
                    <div className='flex-1'>
                      <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold mb-2 uppercase tracking-wider'>
                        <Target size={12} /> Section: {q.section}
                      </div>
                      <p className='text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug'>{q.value}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 ml-0 md:ml-14'>
                    {q.quizOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className='flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors'
                      >
                        <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>{opt.value}</span>
                        <span className='flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700'>
                          +{opt.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results Config */}
        <div className='lg:col-span-5 space-y-6'>
          <div className='flex items-center gap-2 px-2'>
            <Activity className='text-indigo-500' size={22} />
            <h3 className='font-bold text-lg text-slate-800 dark:text-slate-200'>Score Configuration</h3>
          </div>

          <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors'>
            <div className='p-3 space-y-2 max-h-[800px] overflow-y-auto custom-scrollbar'>
              {quiz.results.map((result) => (
                <div
                  key={result.id}
                  className='p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <span className='font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight'>
                      {result.skinTypeName}
                    </span>
                    <ChevronRight
                      size={14}
                      className='text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <ScoreBadge label='OD' value={result.odScore} color='blue' />
                    <ScoreBadge label='SR' value={result.srScore} color='rose' />
                    <ScoreBadge label='PN' value={result.pnScore} color='amber' />
                    <ScoreBadge label='WT' value={result.wtScore} color='emerald' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ScoreBadge = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const colors: any = {
    blue: 'text-blue-600 dark:text-blue-400',
    rose: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  }

  return (
    <div className='flex flex-col bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors'>
      <span className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter'>
        {label} Range
      </span>
      <span className={`text-xs font-bold ${colors[color] || 'text-slate-700 dark:text-slate-300'}`}>
        {value || 'N/A'}
      </span>
    </div>
  )
}

export default QuizDetail
