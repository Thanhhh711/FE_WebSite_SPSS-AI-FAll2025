import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableProduct from '../../components/tables/BasicTables/BasicTableProduct'

export default function BasicTablesProduct() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Basic Tables Product' />
      <div className='space-y-6'>
        <ComponentCard title='Basic Table 3'>
          <BasicTableProduct />
        </ComponentCard>
      </div>
    </>
  )
}
