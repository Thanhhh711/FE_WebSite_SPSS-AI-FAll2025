// MedicalReportList.tsx

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Report, ReportStatus } from '../../types/report.type'
import { reportApi } from '../../api/report.api'
import MedicalReportModal from '../../components/report/MedicalReportModal'
import MedicalReportDetail from '../../components/report/MedicalReportDetail'
import { useParams } from 'react-router'
import { appointmentApi } from '../../api/appointment.api'
import { Appointment } from '../../types/appoinment.type'

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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

  const { data: appoimentsData } = useQuery({
    queryKey: ['appoiment', customerId],
    queryFn: () => appointmentApi.getAppoinments()
  })

  console.log('appoimentsData', appoimentsData)

  const reportsList: Report[] =
    reportsResponse?.data.data && Array.isArray(reportsResponse.data.data) ? reportsResponse.data.data : []

  const handleOpenCreate = () => setIsCreateModalOpen(true)

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
      {/* Header & Create Button */}
      <div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
        <h2 className='text-xl font-bold text-gray-800'>Medical Records & Reports</h2>
        <button
          onClick={handleOpenCreate}
          className='flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4 mr-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
          </svg>
          Create New Report
        </button>
      </div>

      {/* Reports List */}
      <div className='space-y-4'>
        {reportsList.length > 0 ? (
          reportsList.map((report) => <ReportCard key={report.id} report={report} onDetailView={handleDetailView} />)
        ) : (
          <div className='text-center p-12 border border-dashed border-gray-300 rounded-lg text-gray-500'>
            <p>This patient currently has no medical reports.</p>
            <button onClick={handleOpenCreate} className='mt-3 text-indigo-600 font-medium hover:text-indigo-700'>
              Start by creating the first report
            </button>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      <MedicalReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        customerId={customerId as string}
        appoimentsData={appoimentsData?.data.data as Appointment[]}
      />

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
