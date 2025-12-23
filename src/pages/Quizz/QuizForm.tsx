/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, ArrowLeft, Loader2, Plus, Save, Settings, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { CreateSkinTestRequest, ResultConfig } from '../../types/quizz.type'
import { SkinType } from '../../types/skin.type'
import http from '../../utils/http'
import { quizzApi } from '../../api/quizz.api'

const SKIN_TYPES_URL = 'skin-types'

const QuizForm = ({ onClose }: { onClose: () => void }) => {
  const [skinTypes, setSkinTypes] = useState<SkinType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateSkinTestRequest>({
    name: '',
    isDefault: false,
    questions: [],
    resultConfigs: []
  })

  // 1. Tính toán cận trên và cận dưới dựa trên tổng điểm các câu hỏi hiện có
  const sectionRanges = useMemo(() => {
    const ranges: Record<string, { min: number; max: number }> = {
      OD: { min: 0, max: 0 },
      SR: { min: 0, max: 0 },
      PN: { min: 0, max: 0 },
      WT: { min: 0, max: 0 }
    }

    formData.questions.forEach((q) => {
      if (q.options.length > 0) {
        const scores = q.options.map((o) => Number(o.score) || 0)
        ranges[q.section].min += Math.min(...scores)
        ranges[q.section].max += Math.max(...scores)
      }
    })
    return ranges
  }, [formData.questions])

  // 2. Hàm validate logic điểm số
  const validateAllConfigs = (configs: ResultConfig[]) => {
    const newErrors: Record<string, string> = {}
    configs.forEach((config, idx) => {
      const sections: (keyof typeof sectionRanges)[] = ['OD', 'SR', 'PN', 'WT']
      sections.forEach((s) => {
        const fieldKey = `${s.toLowerCase()}Score` as keyof ResultConfig
        const val = config[fieldKey] as string
        const errorKey = `${idx}-${fieldKey}`
        if (!val) return

        const parts = val.split('-')
        const minVal = parseInt(parts[0])
        const maxVal = parseInt(parts[1])

        if (parts.length !== 2 || isNaN(minVal) || isNaN(maxVal)) {
          newErrors[errorKey] = 'Format: min-max'
        } else if (minVal < sectionRanges[s].min || maxVal > sectionRanges[s].max) {
          newErrors[errorKey] = `Out of range!`
        }
      })
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Khởi tạo dữ liệu Skin Types
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        const resSkinTypes = await http.get<{ data: SkinType[] }>(SKIN_TYPES_URL)
        const types = resSkinTypes.data.data
        setSkinTypes(types)

        // Khởi tạo config trống cho mỗi loại da
        setFormData((prev) => ({
          ...prev,
          resultConfigs: types.map((t) => ({
            skinTypeId: t.id,
            odScore: '',
            srScore: '',
            pnScore: '',
            wtScore: ''
          }))
        }))
      } catch (error) {
        console.error('Error fetching skin types', error)
        toast.error('Could not load skin types')
      } finally {
        setIsLoading(false)
      }
    }
    initData()
  }, [])

  // --- XỬ LÝ STATE ---
  const updateQuestionField = (qIdx: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => (idx === qIdx ? { ...q, [field]: value } : q))
    }))
  }

  const updateOptionField = (qIdx: number, oIdx: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => {
        if (idx === qIdx) {
          const newOptions = q.options.map((opt, optIdx) => (optIdx === oIdx ? { ...opt, [field]: value } : opt))
          return { ...q, options: newOptions }
        }
        return q
      })
    }))
  }

  const addOption = (qIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === qIdx ? { ...q, options: [...q.options, { value: '', score: 0 }] } : q
      )
    }))
  }

  const removeOption = (qIdx: number, oIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === qIdx ? { ...q, options: q.options.filter((_, i) => i !== oIdx) } : q
      )
    }))
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { value: '', section: 'OD', options: [{ value: '', score: 0 }] }]
    }))
  }

  const removeQuestion = (qIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIdx)
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error('Please enter a quiz name')
    if (formData.questions.length === 0) return toast.error('Please add at least one question')
    if (!validateAllConfigs(formData.resultConfigs)) return

    try {
      const data = await quizzApi.createQuizzs(formData as CreateSkinTestRequest)
      toast.success(data?.data.message || 'Create quiz successfully')
      onClose()
    } catch (error) {
      toast.error('Error saving quiz data')
    }
  }

  if (isLoading)
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='animate-spin text-indigo-500' size={40} />
      </div>
    )

  return (
    <div className='space-y-6 pb-20 dark:bg-slate-950 transition-colors'>
      {/* Header */}
      <div className='sticky top-4 z-20 flex flex-wrap items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border dark:border-slate-800 shadow-lg'>
        <button
          onClick={onClose}
          className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl dark:text-slate-300 transition-colors'
        >
          <ArrowLeft size={20} />
        </button>
        <input
          className='flex-1 min-w-[200px] bg-transparent text-xl font-bold outline-none dark:text-white placeholder:text-slate-400'
          placeholder='Enter New Quiz Name...'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className='flex items-center gap-4'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className='w-4 h-4 accent-indigo-600'
            />
            <span className='text-sm font-bold text-slate-600 dark:text-slate-400'>Default</span>
          </label>
          <button
            onClick={handleSave}
            className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all'
          >
            <Save size={18} /> <span>Create Quiz</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Score Config Panel */}
        <div className='lg:col-span-4 space-y-6 order-2 lg:order-1'>
          <div className='bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm'>
            <div className='flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2'>
              <Settings size={18} /> <span>SCORE CONFIG</span>
            </div>

            {/* Thông báo tổng quan về cận điểm */}
            {/* <p className='text-[11px] text-slate-500 mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800'>
              💡 Scores are based on your questions. Enter ranges like <b>10-20</b>.
            </p> */}

            <div className='space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar'>
              {formData.resultConfigs.map((config, idx) => (
                <div
                  key={config.skinTypeId}
                  className='p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700'
                >
                  <p className='text-[10px] font-black text-indigo-500 mb-3 uppercase tracking-widest'>
                    {skinTypes.find((t) => t.id === config.skinTypeId)?.name}
                  </p>
                  <div className='grid grid-cols-2 gap-3'>
                    {['odScore', 'srScore', 'pnScore', 'wtScore'].map((field) => {
                      const sectionKey = field.replace('Score', '').toUpperCase()
                      const range = sectionRanges[sectionKey]
                      return (
                        <div key={field}>
                          <label className='flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase'>
                            <span>{sectionKey}</span>
                            <span className='text-indigo-400'>
                              ({range.min}-{range.max})
                            </span>
                          </label>
                          <input
                            placeholder={`${range.min}-${range.max}`}
                            className={`w-full text-xs p-2.5 rounded-xl border outline-none dark:bg-slate-900 dark:text-slate-100 ${errors[`${idx}-${field}`] ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 ring-indigo-500/20'}`}
                            value={(config as any)[field]}
                            onChange={(e) => {
                              const nc = [...formData.resultConfigs]
                              nc[idx] = { ...nc[idx], [field]: e.target.value }
                              setFormData({ ...formData, resultConfigs: nc })
                              validateAllConfigs(nc)
                            }}
                          />
                          {errors[`${idx}-${field}`] && (
                            <p className='text-[8px] text-red-500 mt-1 font-bold'>{errors[`${idx}-${field}`]}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Editor */}
        <div className='lg:col-span-8 space-y-6 order-1 lg:order-2 '>
          <div className='flex justify-between items-center bg-white p-5 rounded-2xl border dark:bg-slate-900/80 dark:text-gray-300 border-slate-200 shadow-sm'>
            <div className='flex items-center gap-2 font-bold'>
              <Activity size={20} className='text-indigo-500' /> Questionnaire Content
            </div>
            <button
              onClick={addQuestion}
              className='bg-indigo-50 text-indigo-600 font-bold px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-100'
            >
              <Plus size={18} /> Add Question
            </button>
          </div>

          <div className='space-y-6'>
            {formData.questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className='group bg-white p-6 rounded-3xl border dark:bg-slate-900/80 dark:text-gray-300 border-slate-200 relative hover:shadow-md transition-all'
              >
                <button
                  onClick={() => removeQuestion(qIdx)}
                  className='absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Trash2 size={18} />
                </button>

                <div className='flex gap-5'>
                  <div className='flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold'>
                    {qIdx + 1}
                  </div>
                  <div className='flex-1 space-y-5'>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        Question Text
                      </label>
                      <input
                        className='w-full text-lg font-bold border-b-2 border-slate-100 focus:border-indigo-500 outline-none pb-2 transition-all bg-transparent'
                        placeholder='Type your question...'
                        value={q.value}
                        onChange={(e) => updateQuestionField(qIdx, 'value', e.target.value)}
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <label className='text-[10px] font-bold text-slate-400 uppercase'>Section Category</label>
                      <select
                        className='block text-xs font-bold p-2.5 dark:bg-slate-800 dark:text-gray-300 rounded-xl bg-slate-100 border-none outline-none'
                        value={q.section}
                        onChange={(e) => updateQuestionField(qIdx, 'section', e.target.value)}
                      >
                        <option value='OD'>Oily vs Dry (OD)</option>
                        <option value='SR'>Sensitive vs Resistant (SR)</option>
                        <option value='PN'>Pigmented vs Non-Pigmented (PN)</option>
                        <option value='WT'>Wrinkled vs Tight (WT)</option>
                      </select>
                    </div>

                    <div className='space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800'>
                      <label className='text-[10px] font-bold text-slate-400 uppercase'>Answer Options</label>
                      <div className='grid grid-cols-1 gap-3'>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className='flex gap-3 items-center'>
                            <input
                              className='flex-1 text-sm p-3 bg-slate-50 dark:bg-slate-800 dark:text-gray-300 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-200 outline-none'
                              placeholder='Option text...'
                              value={opt.value}
                              onChange={(e) => updateOptionField(qIdx, oIdx, 'value', e.target.value)}
                            />
                            <div className='flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 rounded-2xl border dark:border-slate-700'>
                              <span className='text-[9px] font-black text-slate-400'>SCORE</span>
                              <input
                                type='number'
                                className='w-12 bg-transparent font-bold text-sm py-3 outline-none text-center dark:text-white'
                                value={opt.score}
                                onChange={(e) => updateOptionField(qIdx, oIdx, 'score', Number(e.target.value))}
                              />
                            </div>
                            <button
                              onClick={() => removeOption(qIdx, oIdx)}
                              className='p-2 text-slate-300 hover:text-red-500 transition-colors'
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type='button'
                        onClick={() => addOption(qIdx)}
                        className='inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 mt-2 transition-colors'
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
    </div>
  )
}

export default QuizForm
