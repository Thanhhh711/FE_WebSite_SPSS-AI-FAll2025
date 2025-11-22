import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import WorkSchedulesManagement from '../../components/tables/BasicTables/BasicTableSchedule'

export default function BasicTablesRoom() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Table Schedule' />
      <div className='space-y-6'>
        <ComponentCard title='Table Schedule'>
          <WorkSchedulesManagement />
        </ComponentCard>
      </div>
    </>
  )
}
