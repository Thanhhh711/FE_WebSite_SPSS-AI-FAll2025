// MedicalReportDetail.tsx

import { useQuery } from '@tanstack/react-query'
// Assumed imports: types, API, and helpers
import { reportApi } from '../../api/report.api'
import { Appointment, Report, ReportStatus } from '../../types/report.type'
import { formatDateToDDMMYYYY } from '../../utils/validForm'
// Assumed Modal component exists
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import ModalRegistration from '../RegistrationModal/ModalRegistration'

interface MedicalReportDetailProps {
  isOpen: boolean
  onClose: () => void
  reportId: string | null
}

const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date
    .toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(',', ' ') // Loại bỏ dấu phẩy giữa ngày và giờ
}

const REPORT_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [ReportStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700 border border-gray-300' },
  [ReportStatus.InProgress]: { text: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  [ReportStatus.Completed]: { text: 'Completed', color: 'bg-green-100 text-green-700 border border-green-300' },
  [ReportStatus.Sent]: { text: 'Sent to Customer', color: 'bg-indigo-100 text-indigo-700 border border-indigo-300' },
  [ReportStatus.NeedsReview]: { text: 'Needs Review', color: 'bg-orange-100 text-orange-700 border border-orange-300' },
  [ReportStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700 border border-blue-300' }
}

import { ReactNode } from 'react'

const DetailItem = ({ label, value, className = '' }: { label: string; value: ReactNode; className?: string }) => (
  <div className={`flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg ${className}`}>
    <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>{label}</span>
    <span className='mt-1 font-semibold text-gray-900 dark:text-white break-words text-sm'>{value || 'N/A'}</span>
  </div>
)
export default function MedicalReportDetail({ isOpen, onClose, reportId }: MedicalReportDetailProps) {
  // Giữ lại logic fetch data
  const {
    data: reportResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicalReportDetail', reportId],
    queryFn: () => reportApi.getSessionsById(reportId!),
    enabled: !!reportId && isOpen
  })

  const report: Report | undefined = reportResponse?.data.data
  const appointmentData: Appointment | undefined = report?.appointment

  const statusInfo = REPORT_STATUS_MAP[report?.status ?? 0] || REPORT_STATUS_MAP[0]
  const staffEmailElement = <StaffEmailLookup staffId={report?.staffId || ''} />

  // const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  // const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // // Hàm mở Modal khi click vào một ảnh bất kỳ
  // const handleOpenPhoto = (index: number) => {
  //   setCurrentPhotoIndex(index)
  //   setIsPhotoModalOpen(true)
  // }

  // // Hàm chuyển sang ảnh trước đó
  // const handlePrevPhoto = () => {
  //   setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : prev))
  // }

  // // Hàm chuyển sang ảnh tiếp theo
  // const handleNextPhoto = () => {
  //   setCurrentPhotoIndex((prev) => (prev < (report.reportImages?.length || 0) - 1 ? prev + 1 : prev))
  // }

  // // Lấy URL của ảnh hiện tại dựa trên Index
  // const currentPhotoUrl = report.reportImages?.[currentPhotoIndex]?.imageUrl || ''

  if (isLoading) {
    return (
      <ModalRegistration isOpen={isOpen} onClose={onClose} title='Loading Report...'>
        <div className='p-8 text-center'>Loading detailed report data...</div>
      </ModalRegistration>
    )
  }

  if (error || !report) {
    return (
      <ModalRegistration isOpen={isOpen} onClose={onClose} title='Error'>
        <div className='p-8 text-center text-red-500'>Report not found or error: {(error as Error)?.message}</div>
      </ModalRegistration>
    )
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title='Medical Report Details'>
      <div className='flex flex-col h-full max-h-[90vh]'>
        {/* HEADER & TOP INFO */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-extrabold text-gray-900 dark:text-white'>
              {report.diagnosis || 'Medical Report'}
            </h2>
            <span className={`px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Staff and Date Info */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <DetailItem
              label='Staff'
              value={staffEmailElement ? staffEmailElement : ''}
              className='bg-gray-50 dark:bg-gray-800'
            />
            <DetailItem
              label='Report Date'
              value={formatDateToDDMMYYYY(report.reportDate)}
              className='bg-gray-50 dark:bg-gray-800'
            />
          </div>
        </div>

        {/* BODY - SCROLLABLE CONTENT */}
        <div className='p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow'>
          {/* 1. APPOINTMENT DETAILS (NEW PROMINENT SECTION) */}
          <div className='p-5 border border-indigo-300 rounded-xl dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'>
            <h3 className='flex items-center text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-4'>
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                ></path>
              </svg>
              Appointment Details
            </h3>

            {appointmentData ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                <DetailItem
                  label='Service'
                  value={appointmentData.service?.name || 'N/A'}
                  className='bg-white dark:bg-gray-800 shadow-sm'
                />
                <DetailItem
                  label='Start Time'
                  value={formatDateTime(appointmentData.startDateTime)}
                  className='bg-white dark:bg-gray-800 shadow-sm'
                />
                <DetailItem
                  label='End Time'
                  value={formatDateTime(appointmentData.endDateTime)}
                  className='bg-white dark:bg-gray-800 shadow-sm'
                />
              </div>
            ) : (
              <p className='text-sm text-indigo-600 dark:text-indigo-400'>No appointment linked to this report.</p>
            )}
          </div>

          {/* 2. GENERAL INFO (Vitals, Follow-up) */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <DetailItem label='Vitals' value={report.vitals} className='bg-gray-50 dark:bg-gray-800' />
            <DetailItem
              label='Next Follow-Up Date'
              value={report.nextFollowUpDate ? formatDateToDDMMYYYY(report.nextFollowUpDate) : 'N/A'}
              className='bg-gray-50 dark:bg-gray-800'
            />
          </div>

          {/* 3. REPORT CONTENT: SUMMARY & DETAILS */}
          <div className='space-y-4'>
            {/* Summary */}
            <div>
              <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1'>
                Report Summary
              </span>
              <div className='font-normal text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm'>
                {report.summary}
              </div>
            </div>

            {/* Observations & Recommendation */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1'>
                  Detailed Observations
                </span>
                <div className='font-normal text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm'>
                  {report.observations || 'No detailed observations.'}
                </div>
              </div>
              <div>
                <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1'>
                  Recommendations / Next Steps
                </span>
                <div className='font-normal text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm'>
                  {report.recommendation || 'No recommendations.'}
                </div>
              </div>
            </div>

            {/* Follow-up Instructions */}
            {report.followUpInstructions && (
              <div>
                <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1'>
                  Follow-Up Instructions
                </span>
                <div className='font-normal text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm'>
                  {report.followUpInstructions}
                </div>
              </div>
            )}
          </div>

          {/* 4. ATTACHED IMAGES */}
          {report.reportImages && report.reportImages.length > 0 && (
            <div>
              <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-2'>
                Attached Images ({report.reportImages.length})
              </span>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                {report.reportImages.map((img, index) => (
                  <div
                    key={index}
                    className='relative w-full pb-[75%] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group shadow-md'
                    // onClick={() => handleViewImage(img.imageUrl)} // Thêm hàm xử lý khi nhấp vào ảnh
                  >
                    <img
                      src={img.imageUrl as string}
                      alt={`Report image ${index + 1}`}
                      className='absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105'
                    />
                    {/* Overlay view icon */}
                    <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        ></path>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        ></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className='flex justify-end p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
          <button
            onClick={onClose}
            type='button'
            className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Close
          </button>
        </div>
      </div>
    </ModalRegistration>
  )
}
