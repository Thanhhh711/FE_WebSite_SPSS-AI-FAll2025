import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableVariations from '../../components/tables/BasicTables/BasicTableVaration'

export default function BasicTablesVariation() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle=' Tables variation' />
      <div className='space-y-6'>
        <ComponentCard title='Table variation'>
          <BasicTableVariations />
        </ComponentCard>
      </div>
    </>
  )
}
