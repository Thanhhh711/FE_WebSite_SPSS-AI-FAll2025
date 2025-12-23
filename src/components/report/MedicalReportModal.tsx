// MedicalReportModal.tsx

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
// Assumed imports: types, API, and Modal UI component
import { reportApi } from '../../api/report.api'
import { MedicalReportForm, ReportStatus } from '../../types/report.type'
import { uploadFile } from '../../utils/supabaseStorage'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { appointmentApi } from '../../api/appointment.api'
import { Activity, Calendar, ClipboardList, Clock, FileText, ImageIcon, Plus, X } from 'lucide-react'

// ----------------------------------------------------------------------
// ✅ SUPABASE UPLOAD UTILITIES (Giả định import từ file khác, ví dụ: '../../utils/supabaseUtils')
// Tôi đưa vào đây để mã được hoàn chỉnh.

// Cần đảm bảo file có import: import { supabase } from './supabaseClient'
// Giả định supabase đã được import hoặc định nghĩa ở file utils.
// export interface UploadResult {
//   publicUrl: string
//   path: string
// }
// export async function uploadFile(bucket: string, file: File, folder?: string): Promise<UploadResult> {
//   try {
//     const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`

//     const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
//     if (error) throw error

//     // Lấy publicUrl
//     const publicUrl = supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl

//     return { publicUrl, path: data.path }
//   } catch (err) {
//     console.error('Upload file failed:', err)
//     throw err
//   }
// }
// ----------------------------------------------------------------------

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0]

interface MedicalReportModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  appoimentId: string
}

const initialFormState: MedicalReportForm = {
  customerId: '',
  reportDate: formatDateToYYYYMMDD(new Date()),
  summary: '',
  diagnosis: '',
  observations: '',
  vitals: '',
  recommendation: '',
  nextFollowUpDate: '',
  followUpInstructions: '',
  status: ReportStatus.Draft,
  appointmentId: '',
  imageUrls: []
}

const baseInputClass =
  'w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500'

export default function MedicalReportModal({ isOpen, onClose, customerId, appoimentId }: MedicalReportModalProps) {
  console.log('customerId', customerId)

  const [form, setForm] = useState<MedicalReportForm>({
    ...initialFormState,
    customerId
  })

  console.log('appoimentsData', appoimentId)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...initialFormState,
        customerId,
        reportDate: formatDateToYYYYMMDD(new Date())
      })
      setSelectedFiles([]) // Reset files on open
    }
  }, [isOpen, customerId])

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false) // ✅ State mới cho trạng thái upload

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  // Handle input changes, parse status to number
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value, 10) : value
    }))
  }

  const createReportMutation = useMutation({
    mutationFn: (body: MedicalReportForm) => reportApi.createReport(body),
    onSuccess: () => {
      toast.success('Medical report created successfully!')
      queryClient.invalidateQueries({ queryKey: ['medicalReports', customerId] })
      onClose()
    },
    onError: (error) => {
      toast.error('Failed to create medical report. Please try again.')
      console.error(error)
    }
  })

  const { data: appoimentsData } = useQuery({
    queryKey: ['appoiment'],
    queryFn: () => appointmentApi.getAppoinmentsById(appoimentId as string)
  })

  const appoiment = appoimentsData?.data.data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.diagnosis || !form.summary || !form.reportDate) {
      toast.error('Please fill in the required fields (Diagnosis, Summary, Report Date).')
      return
    }

    // Ngăn chặn submit khi đang xử lý (tạo report hoặc upload)
    if (createReportMutation.isPending || isUploading) return

    let uploadedImageUrls = [...form.imageUrls] // Bắt đầu với các URL hiện có (nếu là Edit)

    try {
      // 1. UPLOAD FILES IF ANY
      if (selectedFiles.length > 0) {
        setIsUploading(true)

        const bucket = 'reports'
        // Map selected files to promises of uploadFile calls
        // Sử dụng hàm mockUploadFile cho mục đích demo. Bạn cần thay bằng hàm uploadFile thực tế.
        const uploadPromises = selectedFiles.map((file) => uploadFile(bucket, file, customerId))

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises)

        // Collect public URLs
        const newUrls = results.map((result) => result.publicUrl)

        console.log('urrl img', newUrls)

        uploadedImageUrls = [...uploadedImageUrls, ...newUrls]

        // Clear selected files state after successful upload
        setSelectedFiles([])
        setIsUploading(false)
        toast.info(`${newUrls.length} images uploaded successfully.`)
      }
    } catch (error) {
      setIsUploading(false)
      toast.error('Failed to upload one or more images.')
      console.error('Image Upload Error:', error)
      return // Dừng submission nếu upload thất bại
    }

    // 2. CREATE REPORT with updated image URLs
    const finalForm = {
      ...form,
      customerId: customerId,
      appointmentId: appoimentId,
      imageUrls: uploadedImageUrls // Sử dụng danh sách URL đã cập nhật
    }

    console.log('finalForm', finalForm)

    createReportMutation.mutate(finalForm, {
      onSuccess: (data) => {
        toast.success(data.data.message)
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  // Hiển thị trạng thái Loading tổng thể
  const isProcessing = createReportMutation.isPending || isUploading
  const textareaClass = `${baseInputClass} resize-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] transition-all`
  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title='Create New Medical Report'>
      <form
        onSubmit={handleSubmit}
        className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
      >
        <div className='max-h-[85vh] overflow-y-auto custom-scrollbar'>
          {/* HEADER SECTION */}
          <div className='bg-slate-50 border-b border-gray-100 p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-indigo-100 text-indigo-600 rounded-lg'>
                <FileText size={24} />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-800'>Clinical Medical Report</h3>
                <p className='text-sm text-gray-500 font-medium'>Documenting patient diagnosis and treatment plan</p>
              </div>
            </div>
          </div>

          <div className='p-8 space-y-10'>
            {/* SECTION 1: APPOINTMENT & STATUS */}
            <section className='space-y-6'>
              <div className='flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2'>
                <Calendar size={18} />
                <h4 className='font-bold uppercase text-[11px] tracking-widest'>Appointment Details</h4>
              </div>

              <div className='space-y-5'>
                <div className='w-full'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Related Appointment</label>
                  <select
                    name='appointmentId'
                    value={appoimentId}
                    className={`${baseInputClass} bg-indigo-50/30 border-indigo-100 w-full cursor-not-allowed`}
                    disabled
                  >
                    {appoiment && (
                      <option value={appoiment.id}>
                        {appoiment.service?.name} — {new Date(appoiment.startDateTime).toLocaleString('vi-VN')}
                      </option>
                    )}
                  </select>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='block text-sm font-semibold text-gray-700'>Report Date</label>
                    <input
                      type='date'
                      name='reportDate'
                      value={form.reportDate}
                      onChange={handleChange}
                      className={baseInputClass}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='block text-sm font-semibold text-gray-700'>Report Status</label>
                    <select
                      name='status'
                      value={form.status.toString()}
                      onChange={handleChange}
                      className={baseInputClass}
                    >
                      <option value={ReportStatus.Draft}>Draft</option>
                      <option value={ReportStatus.Completed}>Completed</option>
                      <option value={ReportStatus.Approved}>Approved</option>
                      <option value={ReportStatus.InProgress}>InProgress</option>
                      <option value={ReportStatus.NeedsReview}>NeedsReview</option>
                      <option value={ReportStatus.Sent}>Sent</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: MEDICAL DIAGNOSIS - Diagnosis 1 vòng (Full Width) */}
            <section className='space-y-6'>
              <div className='flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2'>
                <Activity size={18} />
                <h4 className='font-bold uppercase text-[11px] tracking-widest'>Medical Diagnosis</h4>
              </div>

              <div className='w-full'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>
                  Diagnosis <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='diagnosis'
                  rows={2}
                  value={form.diagnosis}
                  onChange={handleChange}
                  placeholder='Enter primary clinical diagnosis...'
                  className={`${textareaClass} min-h-[80px] font-medium w-full`}
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='md:col-span-1'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Vitals</label>
                  <textarea
                    name='vitals'
                    rows={3}
                    value={form.vitals}
                    onChange={handleChange}
                    placeholder='BP, HR, Temp...'
                    className={`${textareaClass} min-h-[100px]`}
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Executive Summary</label>
                  <textarea
                    name='summary'
                    rows={3}
                    value={form.summary}
                    onChange={handleChange}
                    placeholder='Brief summary of visit outcome...'
                    className={`${textareaClass} min-h-[100px]`}
                    required
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: EVALUATION */}
            <section className='space-y-4'>
              <div className='flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2'>
                <ClipboardList size={18} />
                <h4 className='font-bold uppercase text-[11px] tracking-widest'>Evaluation</h4>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Detailed Observations</label>
                  <textarea
                    name='observations'
                    value={form.observations}
                    onChange={handleChange}
                    className={`${textareaClass} min-h-[150px]`}
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Recommendations</label>
                  <textarea
                    name='recommendation'
                    value={form.recommendation}
                    onChange={handleChange}
                    className={`${textareaClass} min-h-[150px] bg-indigo-50/10 border-indigo-100`}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: IMAGING - Multi upload preview */}
            <section className='space-y-4'>
              <div className='flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2'>
                <ImageIcon size={18} />
                <h4 className='font-bold uppercase text-[11px] tracking-widest'>Medical Imaging</h4>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                <label className='aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group'>
                  <Plus size={24} className='text-indigo-600 group-hover:scale-110 transition-transform' />
                  <span className='text-[10px] font-bold text-gray-400 mt-2 uppercase'>Add Media</span>
                  <input type='file' multiple onChange={handleFileChange} accept='image/*' className='hidden' />
                </label>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className='relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm'
                  >
                    <img src={URL.createObjectURL(file)} alt='preview' className='w-full h-full object-cover' />
                    <button
                      type='button'
                      onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                      className='absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50'
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 5: FOLLOW-UP PLAN - Fix: Date 1 hàng, Instructions 1 hàng */}
            <section className='bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-6'>
              <div className='flex items-center gap-2 text-gray-700 pb-2 border-b border-gray-200'>
                <Clock size={18} />
                <h4 className='font-bold uppercase text-[11px] tracking-widest'>Follow-Up Plan</h4>
              </div>

              <div className='space-y-5'>
                {/* Hàng 1: Follow-Up Date */}
                <div className='w-full md:w-1/3'>
                  {' '}
                  {/* Giới hạn độ rộng date cho đẹp, hoặc dùng w-full nếu muốn dài hết */}
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Follow-Up Date</label>
                  <input
                    type='date'
                    name='nextFollowUpDate'
                    value={form.nextFollowUpDate}
                    onChange={handleChange}
                    className={baseInputClass}
                  />
                </div>

                {/* Hàng 2: Instructions nằm dưới */}
                <div className='w-full'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Instructions</label>
                  <textarea
                    name='followUpInstructions'
                    rows={2}
                    value={form.followUpInstructions}
                    onChange={handleChange}
                    placeholder='E.g. Take medication daily, avoid direct sunlight...'
                    className={`${textareaClass} min-h-[60px] w-full`}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className='sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-6 flex items-center justify-end gap-4 z-20'>
            <button
              onClick={onClose}
              type='button'
              className='text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-10 py-3 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-lg active:scale-95 transition-all disabled:bg-gray-300'
              disabled={isProcessing}
            >
              {isUploading ? 'Uploading...' : 'Create Report'}
            </button>
          </div>
        </div>
      </form>
    </ModalRegistration>
  )
}
