// MedicalReportModal.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
// Assumed imports: types, API, and Modal UI component
import { reportApi } from '../../api/report.api'
import { MedicalReportForm, ReportStatus } from '../../types/report.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { Appointment } from '../../types/appoinment.type'
import { uploadFile } from '../../utils/supabaseStorage'

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
  appoimentsData: Appointment[]
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

// ----------------------------------------------------------------------
// // GIẢ ĐỊNH HÀM UPLOAD (THAY THẾ BẰNG HÀM THỰC TẾ CỦA BẠN)
// // Hàm này là Mock, bạn cần thay bằng hàm uploadFile thực tế và import supabase
// const mockUploadFile = async (
//   bucket: string,
//   file: File,
//   folder?: string
// ): Promise<{ publicUrl: string; path: string }> => {
//   // Simulate API call delay and success
//   console.log(`Simulating upload for file: ${file.name} to bucket: ${bucket}`)
//   await new Promise((resolve) => setTimeout(resolve, 500))
//   // Return a mock URL
//   return {
//     publicUrl: `https://mock-cdn.com/${folder}/${file.name.replace(/\s/g, '-')}`,
//     path: `${folder}/${file.name}`
//   }
// }
// ----------------------------------------------------------------------

export default function MedicalReportModal({ isOpen, onClose, customerId, appoimentsData }: MedicalReportModalProps) {
  const [form, setForm] = useState<MedicalReportForm>({
    ...initialFormState,
    customerId
  })
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

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title='Create New Medical Report'>
      <form onSubmit={handleSubmit}>
        <div className='max-h-[70vh] overflow-y-auto'>
          <div className='space-y-4 p-6'>
            {/* Row 1: Report Date & Status */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Report Date</label>
                <input
                  type='date'
                  name='reportDate'
                  value={form.reportDate}
                  onChange={handleChange}
                  className={baseInputClass}
                  required
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Report Status</label>
                <select name='status' value={form.status.toString()} onChange={handleChange} className={baseInputClass}>
                  <option value={ReportStatus.Draft}>Draft</option>
                  <option value={ReportStatus.InProgress}>In Progress</option>
                  <option value={ReportStatus.Completed}>Completed</option>
                  <option value={ReportStatus.Sent}>Sent to Customer</option>
                  <option value={ReportStatus.NeedsReview}>Needs Review</option>
                  <option value={ReportStatus.Approved}>Approved</option>
                </select>
              </div>
            </div>

            {/* Diagnosis & Vitals */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Diagnosis</label>
                <input
                  type='text'
                  name='diagnosis'
                  value={form.diagnosis}
                  onChange={handleChange}
                  placeholder='Primary diagnosis'
                  className={baseInputClass}
                  required
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Vitals</label>
                <input
                  type='text'
                  name='vitals'
                  value={form.vitals}
                  onChange={handleChange}
                  placeholder='Example: BP 120/80, HR 75'
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Report Summary</label>
              <textarea
                name='summary'
                rows={3}
                value={form.summary}
                onChange={handleChange}
                placeholder='Brief summary of the patient status and visit outcome.'
                className={`${baseInputClass} resize-none`}
                required
              />
            </div>

            {/* Observations & Recommendation */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Detailed Observations</label>
                <textarea
                  name='observations'
                  rows={4}
                  value={form.observations}
                  onChange={handleChange}
                  placeholder='Detailed notes about clinical observations.'
                  className={`${baseInputClass} resize-none`}
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Recommendation / Next Steps</label>
                <textarea
                  name='recommendation'
                  rows={4}
                  value={form.recommendation}
                  onChange={handleChange}
                  placeholder='Recommended treatment or next interventions.'
                  className={`${baseInputClass} resize-none`}
                />
              </div>
            </div>

            {/* ------------------ ✅ ATTACHED IMAGES (INPUT FILE) ------------------ */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Attached Images</label>
              <div className='flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition relative'>
                <input
                  type='file'
                  name='imageFiles'
                  multiple // Cho phép chọn nhiều file
                  onChange={handleFileChange}
                  accept='image/*' // Chỉ chấp nhận định dạng ảnh
                  className='absolute w-full h-full opacity-0 cursor-pointer'
                />
                <p className='text-sm text-gray-500'>
                  Drag & drop files here, or <span className='font-medium text-indigo-600'>click to browse</span>.
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>Supports JPEG, PNG, GIF, max 5MB per file.</p>
              </div>
            </div>

            {/* ✅ PREVIEW CÁC FILES ĐÃ CHỌN */}
            {selectedFiles.length > 0 && (
              <div className='mt-3'>
                <h5 className='mb-2 text-sm font-medium text-gray-700'>Files to Upload ({selectedFiles.length}):</h5>
                <ul className='grid grid-cols-2 gap-3 text-xs text-gray-600'>
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className='p-2 bg-gray-50 border border-gray-200 rounded-lg truncate flex items-center justify-between'
                    >
                      <span>{file.name}</span>
                      <span className='ml-2 text-gray-500'>({Math.round(file.size / 1024)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Row: Follow-up Date, Instructions & Appointment ID */}
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Follow-Up Date</label>
                <input
                  type='date'
                  name='nextFollowUpDate'
                  value={form.nextFollowUpDate}
                  onChange={handleChange}
                  className={baseInputClass}
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Follow-Up Instructions</label>
                <input
                  type='text'
                  name='followUpInstructions'
                  value={form.followUpInstructions}
                  onChange={handleChange}
                  placeholder='Detailed instructions.'
                  className={baseInputClass}
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700'>Appointment</label>
                <select
                  name='appointmentId'
                  value={form.appointmentId}
                  onChange={handleChange}
                  className={baseInputClass}
                >
                  <option value=''>Select an appointment (optional)</option>
                  {appoimentsData.map((appt) => (
                    <option key={appt.id} value={appt.id}>
                      {appt.service?.name || 'Unnamed Service'} — {new Date(appt.startDateTime).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className='flex items-center gap-3 p-4 border-t border-gray-100 justify-end'>
            <button
              onClick={onClose}
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50'
              disabled={isProcessing} // Disabled khi đang tạo report HOẶC đang upload ảnh
            >
              {isUploading
                ? 'Uploading Images...'
                : createReportMutation.isPending
                  ? 'Creating Report...'
                  : 'Create Report'}
            </button>
          </div>
        </div>
      </form>
    </ModalRegistration>
  )
}
