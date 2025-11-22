// MedicalReportDetail.tsx

import { useQuery } from '@tanstack/react-query'
// Assumed imports: types, API, and helpers
import { reportApi } from '../../api/report.api'
import { Report, ReportStatus } from '../../types/report.type'
import { formatDateToDDMMYYYY } from '../../utils/utils.type'
// Assumed Modal component exists
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import { Modal } from '../ui/modal'
import { appointmentApi } from '../../api/appointment.api'

interface MedicalReportDetailProps {
  isOpen: boolean
  onClose: () => void // Close the modal
  reportId: string | null // ID of the report to view
}

const REPORT_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [ReportStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700' },
  [ReportStatus.InProgress]: { text: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  [ReportStatus.Completed]: { text: 'Completed', color: 'bg-green-100 text-green-700' },
  [ReportStatus.Sent]: { text: 'Sent to Customer', color: 'bg-indigo-100 text-indigo-700' },
  [ReportStatus.NeedsReview]: { text: 'Needs Review', color: 'bg-orange-100 text-orange-700' },
  [ReportStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700' }
}

// Component to display a label-value pair
const DetailItem = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className='flex flex-col'>
    <span className='text-xs font-medium text-gray-500 uppercase'>{label}</span>
    <span className='font-semibold text-gray-800 break-words'>{value || 'N/A'}</span>
  </div>
)

export default function MedicalReportDetail({ isOpen, onClose, reportId }: MedicalReportDetailProps) {
  // Fetch report details
  const {
    data: reportResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicalReportDetail', reportId],
    queryFn: () => reportApi.getSessionsById(reportId!),
    enabled: !!reportId && isOpen
  })

  const { data: appoimentsData } = useQuery({
    queryKey: ['appoiment'],
    queryFn: () => appointmentApi.getAppoinmentsById(reportResponse?.data.data.appointmentId as string)
  })

  console.log('reportResponse', reportResponse)

  const report: Report | undefined = reportResponse?.data.data
  const statusInfo = REPORT_STATUS_MAP[report?.status ?? 0] || REPORT_STATUS_MAP[0]
  const email = <StaffEmailLookup staffId={report ? report.staffId : ''} />
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='p-6 space-y-6'>
        {/* Header & Status */}
        <div className='flex items-start border-b border-gray-200 pt-4'>
          <h2 className='text-2xl font-bold text-gray-900'>{report.diagnosis || 'Medical Report'}</h2>
          <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* General Info Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <DetailItem label='Report Date' value={formatDateToDDMMYYYY(report.reportDate)} />
          <DetailItem
            label='Follow-Up'
            value={report.nextFollowUpDate ? formatDateToDDMMYYYY(report.nextFollowUpDate) : 'N/A'}
          />
          <DetailItem label='Appointment ID' value={appoimentsData?.data.data.service.name as string} />
          <div className='flex flex-col'>
            <span className='text-xs font-medium text-gray-500 uppercase'>Staff Email</span>
            <span className='font-semibold text-gray-800 break-words'>{email || 'N/A'}</span>
          </div>
        </div>

        {/* Vitals & Summary */}
        <div className='space-y-4'>
          <DetailItem label='Vitals' value={report.vitals} />

          <div>
            <span className='text-xs font-medium text-gray-500 uppercase block mb-1'>Summary</span>
            <p className='font-normal text-gray-800 whitespace-pre-wrap border p-3 rounded-lg bg-gray-50'>
              {report.summary}
            </p>
          </div>
        </div>

        {/* Observations & Recommendation */}
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <span className='text-xs font-medium text-gray-500 uppercase block mb-1'>Detailed Observations</span>
            <p className='font-normal text-gray-800 whitespace-pre-wrap border p-3 rounded-lg'>
              {report.observations || 'No detailed observations.'}
            </p>
          </div>
          <div>
            <span className='text-xs font-medium text-gray-500 uppercase block mb-1'>Recommendations / Next Steps</span>
            <p className='font-normal text-gray-800 whitespace-pre-wrap border p-3 rounded-lg'>
              {report.recommendation || 'No recommendations.'}
            </p>
          </div>
        </div>

        {/* Image Placeholders */}
        {report.reportImages && report.reportImages.length > 0 && (
          <div>
            <span className='text-xs font-medium text-gray-500 uppercase block mb-2'>Attached Images</span>
            <div className='grid grid-cols-3 gap-3'>
              {report.reportImages.map((img, index) => (
                <div key={index} className='aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden'>
                  <img
                    src={img.imageUrl as string}
                    alt={`Report image ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='flex justify-end p-4 border-t border-gray-200'>
        <button
          onClick={onClose}
          type='button'
          className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
