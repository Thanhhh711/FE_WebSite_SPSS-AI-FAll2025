/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Loader2, Plus, Settings, CheckCircle2, Trash2, Save, Star, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { quizzApi, questionApi, optionApi, resultApi } from '../../api/quizz.api'
import { SkinTestDetail, QuizSetEditSkinTypeScore } from '../../types/quizz.type'
import { SkinType } from '../../types/skin.type'
import http from '../../utils/http'

interface Props {
  quizId: string
  onClose: () => void
}

const EditQuizForm = ({ quizId, onClose }: Props) => {
  const [skinTypes, setSkinTypes] = useState<SkinType[]>([])
  const [quizDetail, setQuizDetail] = useState<SkinTestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [showSkinSelector, setShowSkinSelector] = useState(false)

  const [basicInfo, setBasicInfo] = useState({ name: '', isDefault: false })

  const fetchData = async () => {
    try {
      const [resSkinTypes, resDetail] = await Promise.all([
        http.get<{ data: SkinType[] }>('skin-types'),
        quizzApi.getQuizzsById(quizId)
      ])
      setSkinTypes(resSkinTypes.data.data)
      const data = resDetail.data.data
      setQuizDetail(data)
      setBasicInfo({ name: data.name, isDefault: data.isDefault })
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [quizId])

  const sectionRanges = useMemo(() => {
    const ranges: Record<string, { min: number; max: number }> = {
      OD: { min: 0, max: 0 },
      SR: { min: 0, max: 0 },
      PN: { min: 0, max: 0 },
      WT: { min: 0, max: 0 }
    }
    quizDetail?.questions.forEach((q) => {
      const scores = q.quizOptions.map((o) => o.score)
      if (scores.length > 0) {
        ranges[q.section].min += Math.min(...scores)
        ranges[q.section].max += Math.max(...scores)
      }
    })
    return ranges
  }, [quizDetail])

  const configuredSkinResults = useMemo(() => {
    if (!quizDetail) return []
    return quizDetail.results.map((r) => ({
      ...r,
      typeName: skinTypes.find((t) => t.id === r.skinTypeId)?.name || 'Unknown'
    }))
  }, [quizDetail, skinTypes])

  const availableSkinTypesToAdd = useMemo(() => {
    const configuredIds = quizDetail?.results.map((r) => r.skinTypeId) || []
    return skinTypes.filter((type) => !configuredIds.includes(type.id))
  }, [quizDetail, skinTypes])

  // --- HANDLERS ---

  const handleUpdateBasic = async () => {
    setIsSavingAll(true)
    try {
      await quizzApi.editQuizzs(quizId, {
        name: basicInfo.name,
        isDefault: basicInfo.isDefault
      } as any)
      toast.success('Quiz updated successfully')
      fetchData()
    } catch (error) {
      toast.error('Update failed')
    } finally {
      setIsSavingAll(false)
    }
  }

  const handleEditResult = async (resultId: string, scores: QuizSetEditSkinTypeScore) => {
    const sections = ['od', 'sr', 'pn', 'wt']
    for (const s of sections) {
      const rangeStr = (scores as any)[`${s}Score`]
      const [minInput, maxInput] = rangeStr.split('-').map(Number)
      const limit = sectionRanges[s.toUpperCase()]

      if (isNaN(minInput) || isNaN(maxInput) || minInput < limit.min || maxInput > limit.max || minInput > maxInput) {
        toast.error(`Invalid range for ${s.toUpperCase()}. Allowed: ${limit.min}-${limit.max}`)
        return
      }
    }

    try {
      await resultApi.editResult(resultId, scores)
      toast.success('Mapping saved')
      fetchData()
    } catch (error) {
      toast.error('Save failed')
    }
  }

  const handleDeleteSkinConfig = async (id: string) => {
    if (!confirm('Remove this configuration?')) return
    try {
      await resultApi.deleteResult(id)
      toast.success('Removed')
      fetchData()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return
    try {
      await questionApi.deleteQuestion(id)
      fetchData()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const handleDeleteOption = async (id: string) => {
    try {
      await optionApi.deleteOption(id)
      fetchData()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const handleUpdateQuestion = async (id: string, value: string, section: string) => {
    try {
      await questionApi.editQuestion(id, { value, section })
      fetchData()
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const handleUpdateOption = async (id: string, value: string, score: number) => {
    try {
      await optionApi.editOption(id, { value, score })
      fetchData()
    } catch (error) {
      toast.error('Update failed')
    }
  }

  if (isLoading)
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='animate-spin text-indigo-500' size={40} />
      </div>
    )

  return (
    <div className='space-y-6 pb-24 dark:bg-slate-950 transition-colors'>
      {/* HEADER */}
      <div className='sticky top-4 z-40 flex items-center justify-between bg-white/80 dark:bg-gray-800/90 backdrop-blur-md p-5 rounded-3xl border dark:border-slate-700 shadow-xl'>
        <div className='flex items-center gap-4 flex-1'>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors dark:text-gray-300'
          >
            <ArrowLeft size={20} />
          </button>
          <div className='flex flex-col flex-1'>
            <input
              className='text-xl font-bold bg-transparent outline-none border-b border-transparent focus:border-indigo-500 w-full max-w-md dark:text-white'
              value={basicInfo.name}
              onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
              placeholder='Quiz Name...'
            />
            <label className='flex items-center gap-2 mt-1 cursor-pointer w-fit'>
              <input
                type='checkbox'
                checked={basicInfo.isDefault}
                onChange={(e) => setBasicInfo({ ...basicInfo, isDefault: e.target.checked })}
                className='w-4 h-4 accent-indigo-600'
              />
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1'>
                <Star size={12} className={basicInfo.isDefault ? 'fill-amber-400 text-amber-400' : ''} /> Default
              </span>
            </label>
          </div>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={handleUpdateBasic}
            disabled={isSavingAll}
            className='bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-emerald-700 shadow-md transition-all'
          >
            {isSavingAll ? <Loader2 className='animate-spin' size={18} /> : <Save size={18} />}{' '}
            <span className='hidden sm:inline'>Save Info</span>
          </button>
          <button
            onClick={() =>
              questionApi.createQuestion({ quizSetId: quizId, value: 'New Question', section: 'OD' }).then(fetchData)
            }
            className='bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-indigo-700'
          >
            <Plus size={18} /> <span className='hidden sm:inline'>Add Question</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* LEFT PANEL */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-white dark:bg-gray-800 p-5 rounded-3xl border dark:border-slate-700 shadow-sm'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold'>
                <Settings size={18} /> SCORE MAPPING
              </div>
              <div className='relative'>
                <button
                  onClick={() => setShowSkinSelector(!showSkinSelector)}
                  className='text-[10px] bg-slate-100 dark:bg-slate-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-black hover:text-indigo-600'
                >
                  + ADD SKIN
                </button>
                {showSkinSelector && (
                  <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto'>
                    {availableSkinTypesToAdd.map((t) => (
                      <button
                        key={t.id}
                        onClick={() =>
                          resultApi
                            .createResult({
                              quizSetId: quizId,
                              skinTypeId: t.id,
                              odScore: '0-0',
                              srScore: '0-0',
                              pnScore: '0-0',
                              wtScore: '0-0'
                            })
                            .then(() => {
                              fetchData()
                              setShowSkinSelector(false)
                            })
                        }
                        className='w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 dark:text-gray-200 rounded-xl transition-colors'
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar'>
              {configuredSkinResults.map((res) => (
                <div
                  key={res.id}
                  className='p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700 group/skin transition-colors'
                >
                  <div className='flex justify-between items-center mb-3'>
                    <span className='text-xs font-black text-slate-700 dark:text-gray-200 uppercase tracking-wider'>
                      {res.typeName}
                    </span>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => {
                          const container = document.getElementById(`config-${res.id}`)
                          const inputs = container?.querySelectorAll('input') as any
                          handleEditResult(res.id, {
                            skinTypeId: res.skinTypeId,
                            odScore: inputs[0].value,
                            srScore: inputs[1].value,
                            pnScore: inputs[2].value,
                            wtScore: inputs[3].value
                          })
                        }}
                        className='text-emerald-600 hover:scale-110 p-1'
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSkinConfig(res.id)}
                        className='text-slate-300 hover:text-red-500 p-1'
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div id={`config-${res.id}`} className='grid grid-cols-2 gap-3'>
                    {['OD', 'SR', 'PN', 'WT'].map((s) => (
                      <div key={s}>
                        <label className='flex justify-between text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter'>
                          {s}{' '}
                          <span className='text-indigo-500'>
                            ({sectionRanges[s].min}-{sectionRanges[s].max})
                          </span>
                        </label>
                        <input
                          defaultValue={(res as any)?.[`${s.toLowerCase()}Score`] || ''}
                          className='w-full text-xs p-2 rounded-xl border dark:bg-gray-800 dark:border-slate-700 dark:text-white outline-none focus:ring-1 ring-indigo-500'
                          placeholder='min-max'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: QUESTIONS */}
        <div className='lg:col-span-8 space-y-6'>
          {quizDetail?.questions.map((q, idx) => (
            <div
              key={q.id}
              className='bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm relative group transition-all hover:shadow-md'
            >
              {/* Nút xóa được đặt ở góc trên phải, z-index thấp hơn select để tránh click nhầm */}
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className='absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10'
              >
                <Trash2 size={18} />
              </button>

              <div className='flex gap-5'>
                <div className='w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center rounded-2xl font-bold flex-shrink-0'>
                  {idx + 1}
                </div>
                <div className='flex-1 space-y-5'>
                  {/* Container này dùng flex-col trên mobile và flex-row trên desktop để tránh đè nút xóa */}
                  <div className='flex flex-col sm:flex-row gap-4 sm:pr-8'>
                    <div className='flex-1 space-y-1'>
                      <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        Question Text
                      </label>
                      <input
                        className='w-full font-bold text-lg bg-transparent border-b-2 border-slate-50 dark:border-slate-700 focus:border-indigo-500 outline-none pb-1 dark:text-white transition-colors'
                        defaultValue={q.value}
                        onBlur={(e) => handleUpdateQuestion(q.id, e.target.value, q.section)}
                      />
                    </div>
                    <div className='w-full sm:w-48 space-y-1'>
                      <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Section</label>
                      <select
                        className='w-full text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-gray-300 outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-indigo-500'
                        defaultValue={q.section}
                        onChange={(e) => handleUpdateQuestion(q.id, q.value, e.target.value)}
                      >
                        <option value='OD'>Oily/Dry</option>
                        <option value='SR'>Sensitive/Resistant</option>
                        <option value='PN'>Pigmented/Non</option>
                        <option value='WT'>Wrinkled/Tight</option>
                      </select>
                    </div>
                  </div>

                  <div className='space-y-3 pt-4 border-t dark:border-slate-700'>
                    <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                      Answer Options
                    </label>
                    <div className='grid grid-cols-1 gap-2'>
                      {q.quizOptions.map((opt) => (
                        <div key={opt.id} className='flex gap-3 items-center group/opt'>
                          <input
                            className='flex-1 text-sm p-3 bg-slate-50 dark:bg-slate-900 dark:text-gray-300 rounded-2xl outline-none border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-200 transition-all'
                            defaultValue={opt.value}
                            onBlur={(e) => handleUpdateOption(opt.id, e.target.value, opt.score)}
                          />
                          <div className='flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 rounded-2xl border dark:border-slate-700'>
                            <span className='text-[9px] font-black text-slate-400'>SCORE</span>
                            <input
                              type='number'
                              className='w-8 text-center text-sm font-bold bg-transparent py-3 outline-none dark:text-white'
                              defaultValue={opt.score}
                              onBlur={(e) => handleUpdateOption(opt.id, opt.value, Number(e.target.value))}
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteOption(opt.id)}
                            className='p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-colors'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        optionApi.createOption({ questionId: q.id, value: 'New Option', score: 0 }).then(fetchData)
                      }
                      className='text-xs text-indigo-500 font-bold flex items-center gap-2 mt-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 w-fit px-4 py-2 rounded-xl transition-all'
                    >
                      <Plus size={14} /> Add Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditQuizForm
