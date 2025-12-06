// MedicalReportList.tsx

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { reportApi } from '../../api/report.api'
import MedicalReportDetail from '../../components/report/MedicalReportDetail'
import { Report, ReportStatus } from '../../types/report.type'

// Helper function to format date
const formatDateToDDMMYYYY = (date: string): string => new Date(date).toLocaleDateString('en-GB')

// Bảng màu trạng thái đã được thêm hỗ trợ Dark Mode (dark:bg-XXX dark:text-YYY)
const REPORT_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  // Gray for Draft
  [ReportStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  // Yellow for In Progress
  [ReportStatus.InProgress]: {
    text: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  // Green for Completed
  [ReportStatus.Completed]: {
    text: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  // Indigo for Sent
  [ReportStatus.Sent]: {
    text: 'Sent to Customer',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
  },
  // Orange for Needs Review
  [ReportStatus.NeedsReview]: {
    text: 'Needs Review',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  },
  // Blue for Approved
  [ReportStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
}

const ReportCard = ({ report, onDetailView }: { report: Report; onDetailView: (reportId: string) => void }) => {
  const statusInfo = REPORT_STATUS_MAP[report.status] || REPORT_STATUS_MAP[0]

  return (
    <div
      // Card Container: nền trắng, border gray-200 -> dark:bg-gray-800, dark:border-gray-700
      className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-pointer bg-white dark:bg-gray-800'
      onClick={() => onDetailView(report.id)}
    >
      <div className='flex justify-between items-start'>
        <h3
          // Title: text-gray-900 -> dark:text-white
          className='text-lg font-semibold text-gray-900 dark:text-white line-clamp-1'
        >
          {report.diagnosis || 'No Diagnosis'}
        </h3>
        {/* Status Badge: sử dụng lớp màu đã được cập nhật */}
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
      </div>

      <p
        // Summary: text-gray-600 -> dark:text-gray-300
        className='text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2'
      >
        {report.summary || 'N/A'}
      </p>

      <div
        // Footer Text: text-gray-500 -> dark:text-gray-400
        className='mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'
      >
        <span className='font-medium'>Report Date: {formatDateToDDMMYYYY(report.reportDate)}</span>
        <span>Next Follow-Up: {report.nextFollowUpDate ? formatDateToDDMMYYYY(report.nextFollowUpDate) : 'N/A'}</span>
      </div>
    </div>
  )
}

export default function MedicalReportList() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const { id: customerId } = useParams<{ id: string }>()

  const {
    data: reportsResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicalReports', customerId],
    queryFn: () => reportApi.getSessionsByCustomerId(customerId as string),
    enabled: !!customerId
  })

  const reportsList: Report[] =
    reportsResponse?.data.data && Array.isArray(reportsResponse.data.data) ? reportsResponse.data.data : []

  const handleDetailView = (reportId: string) => {
    setSelectedReportId(reportId)
    setIsDetailModalOpen(true)
  }

  // Loading state: text-gray-500 -> dark:text-gray-400
  if (isLoading) {
    return <div className='p-6 text-center text-gray-500 dark:text-gray-400'>Loading medical reports...</div>
  }

  // Error state: text-red-500 -> dark:text-red-400
  if (error) {
    return (
      <div className='p-6 text-center text-red-500 dark:text-red-400'>
        Failed to load reports: {(error as Error).message}
      </div>
    )
  }

  return (
    <div
      // Main container: bg-white -> dark:bg-gray-900 (giả định đây là thành phần chính trong bố cục tổng thể)
      className='p-6 bg-white dark:bg-gray-900 rounded-lg shadow'
    >
      {/* Reports List */}
      <div className='space-y-4'>
        {reportsList.length > 0 ? (
          reportsList.map((report) => <ReportCard key={report.id} report={report} onDetailView={handleDetailView} />)
        ) : (
          <div
            // Empty State: border-gray-300, text-gray-500 -> dark:border-gray-700, dark:text-gray-400
            className='text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400'
          >
            <p>This patient currently has no medical reports.</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal (Giả định MedicalReportDetail đã hỗ trợ Dark Mode) */}
      {isDetailModalOpen && (
        <MedicalReportDetail
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          reportId={selectedReportId}
        />
      )}
    </div>
  )
}
