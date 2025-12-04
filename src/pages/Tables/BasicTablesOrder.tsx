import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableOrder from '../../components/tables/BasicTables/BasicTableOrder'

export default function BasicTablesOrder() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Basic Tables Order' />
      <div className='space-y-6'>
        <ComponentCard title='Basic Table Order'>
          <BasicTableOrder />
        </ComponentCard>
      </div>
    </>
  )
}
