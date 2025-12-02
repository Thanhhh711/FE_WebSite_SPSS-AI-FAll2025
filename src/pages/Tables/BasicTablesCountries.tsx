import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableCountry from '../../components/tables/BasicTables/BasicTableCountry'

export default function BasicTablesCountries() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle=' Tables Countries' />
      <div className='space-y-6'>
        <ComponentCard title='Table Countries'>
          <BasicTableCountry />
        </ComponentCard>
      </div>
    </>
  )
}
