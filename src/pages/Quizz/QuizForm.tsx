/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, ArrowLeft, Save, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CreateSkinTestRequest, ResultConfig } from '../../types/quizz.type'
import { SkinType } from '../../types/skin.type'
import http from '../../utils/http'
import quizzApi from '../../api/quizz.api'

// Assuming your API path for skin types
const SKIN_TYPES_URL = 'skin-types'

const QuizForm = ({ initialData, onClose }: { initialData?: any; onClose: () => void }) => {
  const [skinTypes, setSkinTypes] = useState<SkinType[]>([])
  const [formData, setFormData] = useState<CreateSkinTestRequest>(
    initialData || {
      name: '',
      isDefault: false,
      questions: [],
      resultConfigs: []
    }
  )

  // Fetch Skin Types from API to generate Result Configurations
  useEffect(() => {
    const fetchSkinTypes = async () => {
      try {
        const res = await http.get<{ data: SkinType[] }>(SKIN_TYPES_URL)
        const types = res.data.data
        setSkinTypes(types)

        // If creating new, pre-populate resultConfigs based on fetched Skin Types
        if (!initialData) {
          const initialConfigs: ResultConfig[] = types.map((type) => ({
            skinTypeId: type.id,
            odScore: '',
            srScore: '',
            pnScore: '',
            wtScore: ''
          }))
          setFormData((prev) => ({ ...prev, resultConfigs: initialConfigs }))
        }
      } catch (error) {
        console.error('Failed to fetch skin types', error)
      }
    }
    fetchSkinTypes()
  }, [initialData])

  const handleSave = async () => {
    if (!formData.name.trim()) return alert('Please enter a quiz name')
    try {
      if (initialData) {
        await quizzApi.editQuizzs(initialData.id, formData)
      } else {
        await quizzApi.createQuizzs(formData)
      }
      alert('Saved successfully!')
      onClose()
    } catch (error) {
      alert('Error saving data')
    }
  }

  // --- Question Management Logic ---
  const addQuestion = () => {
    const newQuestion = { value: '', section: 'OD', options: [{ value: '', score: 0 }] }
    setFormData({ ...formData, questions: [...formData.questions, newQuestion] })
  }

  const removeQuestion = (index: number) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) })
  }

  const addOption = (qIndex: number) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[qIndex].options.push({ value: '', score: 0 })
    setFormData({ ...formData, questions: updatedQuestions })
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20'>
      {/* Sticky Top Bar */}
      <div className='sticky top-4 z-10 flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg'>
        <button onClick={onClose} className='p-2.5 hover:bg-slate-100 rounded-xl transition-colors'>
          <ArrowLeft size={20} />
        </button>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className='flex-1 text-xl font-bold bg-transparent outline-none placeholder:text-slate-300'
          placeholder='Quiz Campaign Name...'
        />
        <button
          onClick={handleSave}
          className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md transition-all'
        >
          <Save size={18} /> Save Quiz
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: Settings & Result Mapping */}
        <div className='lg:col-span-1 space-y-6'>
          {/* General Config */}
          <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-2 text-indigo-600 mb-6 font-bold uppercase text-[11px] tracking-widest'>
              <Settings size={16} /> General Settings
            </div>
            <label className='relative flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors'>
              <input
                type='checkbox'
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className='mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'
              />
              <div className='text-sm'>
                <p className='font-bold text-slate-700'>Set as Default</p>
                <p className='text-slate-500 text-xs'>This quiz will be prioritized for new users.</p>
              </div>
            </label>
          </div>

          {/* Skin Type Result Configs */}
          <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-2 text-indigo-600 mb-6 font-bold uppercase text-[11px] tracking-widest'>
              <Activity size={16} /> Skin Type Result Mapping
            </div>
            <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
              {formData.resultConfigs.map((config, idx) => {
                const typeInfo = skinTypes.find((t) => t.id === config.skinTypeId)
                return (
                  <div key={config.skinTypeId} className='p-4 rounded-xl border border-slate-100 bg-slate-50/30'>
                    <p className='font-bold text-slate-800 text-sm mb-3 flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full bg-indigo-400'></span>
                      {typeInfo?.name || 'Unknown Type'}
                    </p>
                    <div className='grid grid-cols-2 gap-2'>
                      {['odScore', 'srScore', 'pnScore', 'wtScore'].map((scoreField) => (
                        <div key={scoreField}>
                          <label className='text-[10px] font-bold text-slate-400 uppercase ml-1'>
                            {scoreField.replace('Score', '')}
                          </label>
                          <input
                            type='text'
                            placeholder='Range...'
                            className='w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400'
                            value={(config as any)[scoreField]}
                            onChange={(e) => {
                              const newConfigs = [...formData.resultConfigs]
                              ;(newConfigs[idx] as any)[scoreField] = e.target.value
                              setFormData({ ...formData, resultConfigs: newConfigs })
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
              Questionnaire Content
              <span className='bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full'>
                {formData.questions.length}
              </span>
            </h2>
            <button
              onClick={addQuestion}
              className='text-sm bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm'
            >
              + Add Question
            </button>
          </div>

          {formData.questions.map((q, qIndex) => (
            <div key={qIndex} className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
              <div className='p-5'>
                <div className='flex gap-4 mb-6'>
                  <span className='flex-shrink-0 bg-slate-800 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm'>
                    {qIndex + 1}
                  </span>
                  <div className='flex-1 space-y-3'>
                    <input
                      className='w-full text-lg border-b border-slate-100 focus:border-indigo-500 outline-none font-semibold py-1'
                      placeholder='Enter question text...'
                      value={q.value}
                      onChange={(e) => {
                        const newQuestions = [...formData.questions]
                        newQuestions[qIndex].value = e.target.value
                        setFormData({ ...formData, questions: newQuestions })
                      }}
                    />
                    <select
                      value={q.section}
                      className='bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none'
                      onChange={(e) => {
                        const newQuestions = [...formData.questions]
                        newQuestions[qIndex].section = e.target.value
                        setFormData({ ...formData, questions: newQuestions })
                      }}
                    >
                      <option value='OD'>CATEGORY: Oily vs Dry (OD)</option>
                      <option value='SR'>CATEGORY: Sensitive vs Resistant (SR)</option>
                      <option value='PN'>CATEGORY: Pigmented vs Non (PN)</option>
                      <option value='WT'>CATEGORY: Wrinkled vs Tight (WT)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className='text-slate-300 hover:text-red-500 p-1 self-start'
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className='ml-12 space-y-3'>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className='flex gap-3 items-center'>
                      <input
                        placeholder='Answer option...'
                        className='flex-1 text-sm bg-slate-50/50 border-slate-200 border rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 ring-indigo-500/10 outline-none transition-all'
                        value={opt.value}
                        onChange={(e) => {
                          const newQuestions = [...formData.questions]
                          newQuestions[qIndex].options[oIndex].value = e.target.value
                          setFormData({ ...formData, questions: newQuestions })
                        }}
                      />
                      <div className='flex items-center gap-2 bg-slate-50 rounded-xl px-3 border border-slate-200'>
                        <span className='text-[10px] font-bold text-slate-400'>SCORE</span>
                        <input
                          type='number'
                          className='w-12 bg-transparent text-sm font-bold py-2 outline-none text-center'
                          value={opt.score}
                          onChange={(e) => {
                            const newQuestions = [...formData.questions]
                            newQuestions[qIndex].options[oIndex].score = Number(e.target.value)
                            setFormData({ ...formData, questions: newQuestions })
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(qIndex)}
                    className='text-xs font-bold text-indigo-500 hover:underline ml-1'
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuizForm
