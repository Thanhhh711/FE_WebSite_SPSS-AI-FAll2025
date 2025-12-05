// MedicalReportList.tsx

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { reportApi } from '../../api/report.api'
import MedicalReportDetail from '../../components/report/MedicalReportDetail'
import { Report, ReportStatus } from '../../types/report.type'

// Helper function to format date
const formatDateToDDMMYYYY = (date: string): string => new Date(date).toLocaleDateString('en-GB')

const REPORT_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [ReportStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700' },
  [ReportStatus.InProgress]: { text: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  [ReportStatus.Completed]: { text: 'Completed', color: 'bg-green-100 text-green-700' },
  [ReportStatus.Sent]: { text: 'Sent to Customer', color: 'bg-indigo-100 text-indigo-700' },
  [ReportStatus.NeedsReview]: { text: 'Needs Review', color: 'bg-orange-100 text-orange-700' },
  [ReportStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700' }
}

const ReportCard = ({ report, onDetailView }: { report: Report; onDetailView: (reportId: string) => void }) => {
  const statusInfo = REPORT_STATUS_MAP[report.status] || REPORT_STATUS_MAP[0]

  return (
    <div
      className='p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-pointer'
      onClick={() => onDetailView(report.id)}
    >
      <div className='flex justify-between items-start'>
        <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>{report.diagnosis || 'No Diagnosis'}</h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
      </div>

      <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{report.summary || 'N/A'}</p>

      <div className='mt-3 flex items-center justify-between text-sm text-gray-500'>
        <span className='font-medium'>Report Date: {formatDateToDDMMYYYY(report.reportDate)}</span>
        <span>Next Follow-Up: {report.nextFollowUpDate ? formatDateToDDMMYYYY(report.nextFollowUpDate) : 'N/A'}</span>
      </div>
    </div>
  )
}

export default function MedicalReportList() {
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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

  // const { data: appoimentsData } = useQuery({
  //   queryKey: ['appoiment', customerId],
  //   queryFn: () => appointmentApi.getAppoinments(),
  //   enabled: !!customerId
  // })

  const reportsList: Report[] =
    reportsResponse?.data.data && Array.isArray(reportsResponse.data.data) ? reportsResponse.data.data : []

  // const appoimentList: Appointment[] =
  //   appoimentsData?.data.data && Array.isArray(appoimentsData.data.data) ? appoimentsData.data.data : []
  // const handleOpenCreate = () => setIsCreateModalOpen(true)

  const handleDetailView = (reportId: string) => {
    setSelectedReportId(reportId)
    setIsDetailModalOpen(true)
  }

  if (isLoading) {
    return <div className='p-6 text-center text-gray-500'>Loading medical reports...</div>
  }

  if (error) {
    return <div className='p-6 text-center text-red-500'>Failed to load reports: {(error as Error).message}</div>
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow'>
      {/* Reports List */}
      <div className='space-y-4'>
        {reportsList.length > 0 ? (
          reportsList.map((report) => <ReportCard key={report.id} report={report} onDetailView={handleDetailView} />)
        ) : (
          <div className='text-center p-12 border border-dashed border-gray-300 rounded-lg text-gray-500'>
            <p>This patient currently has no medical reports.</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {/* <MedicalReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        customerId={customerId as string}
        appoimentsData={appoimentList}
      /> */}

      {/* Report Detail Modal */}
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
