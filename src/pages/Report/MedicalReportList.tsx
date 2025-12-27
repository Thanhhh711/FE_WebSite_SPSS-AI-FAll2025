import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { reportApi } from '../../api/report.api'
import MedicalReportModal from '../../components/report/MedicalReportModal'
import { Report, ReportStatus } from '../../types/report.type'
import { FileSearch } from 'lucide-react'

const formatDateToDDMMYYYY = (date: string): string => new Date(date).toLocaleDateString('en-GB')

const REPORT_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [ReportStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  [ReportStatus.InProgress]: {
    text: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  [ReportStatus.Completed]: {
    text: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  [ReportStatus.Sent]: { text: 'Sent', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
  [ReportStatus.NeedsReview]: {
    text: 'Needs Review',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  },
  [ReportStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
}

const ReportCard = ({ report, onEdit }: { report: Report; onEdit: (r: Report) => void }) => {
  const statusInfo = REPORT_STATUS_MAP[report.status] || REPORT_STATUS_MAP[0]
  return (
    <div
      className='p-4 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white dark:bg-gray-800 transition-all'
      onClick={() => onEdit(report)}
    >
      <div className='flex justify-between'>
        <h3 className='font-semibold dark:text-white'>{report.diagnosis || 'No Diagnosis'}</h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
      </div>
      <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{report.summary}</p>
      <div className='mt-3 text-xs text-gray-400 flex justify-between'>
        <span>Date: {formatDateToDDMMYYYY(report.reportDate)}</span>
      </div>
    </div>
  )
}

export default function MedicalReportList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedApptId, setSelectedApptId] = useState<string>('')
  const { id: customerId } = useParams<{ id: string }>()

  const { data: reportsResponse, isLoading } = useQuery({
    queryKey: ['medicalReports', customerId],
    queryFn: () => reportApi.getSessionsByCustomerId(customerId as string),
    enabled: !!customerId
  })

  const reports = reportsResponse?.data.data

  const handleEdit = (report: Report) => {
    setSelectedReportId(report.id)
    setSelectedApptId(report.appointmentId)
    setIsModalOpen(true)
  }

  if (isLoading) return <div className='p-6 text-center'>Loading...</div>

  return (
    <div className='p-6 bg-white dark:bg-gray-900 rounded-lg shadow'>
      <div className='space-y-4'>
        {/* KIỂM TRA NẾU CÓ DỮ LIỆU THÌ MỚI MAP, KHÔNG THÌ HIỆN THÔNG BÁO */}
        {reports && reports.length > 0 ? (
          reports.map((report: Report) => <ReportCard key={report.id} report={report} onEdit={handleEdit} />)
        ) : (
          <div className='flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl'>
            <div className='p-4 bg-gray-50 rounded-full mb-4'>
              <FileSearch size={48} className='text-gray-300' />
            </div>
            <h3 className='text-lg font-semibold text-gray-700'>No Medical Reports Found</h3>
            <p className='text-sm text-gray-500 text-center max-w-[300px] mt-1'>
              There are no medical records for this customer yet. New reports will appear here once created.
            </p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <MedicalReportModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedReportId(null)
          }}
          customerId={customerId as string}
          appoimentId={selectedApptId}
          reportId={selectedReportId}
        />
      )}
    </div>
  )
}
