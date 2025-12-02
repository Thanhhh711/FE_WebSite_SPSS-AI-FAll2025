import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableSlot from '../../components/tables/BasicTables/BasicTableSlot'

export default function BasicTablesSlot() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Table Slot' />
      <div className='space-y-6'>
        <ComponentCard title='Table Slot'>
          <BasicTableSlot />
        </ComponentCard>
      </div>
    </>
  )
}
