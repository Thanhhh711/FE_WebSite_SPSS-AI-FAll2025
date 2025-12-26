import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableHoliday from '../../components/tables/BasicTables/BasicTableHoliday'

export default function BasicTablesHoliday() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle=' Tables Holiday' />
      <div className='space-y-6'>
        <ComponentCard title='Table Holiday'>
          <BasicTableHoliday />
        </ComponentCard>
      </div>
    </>
  )
}
