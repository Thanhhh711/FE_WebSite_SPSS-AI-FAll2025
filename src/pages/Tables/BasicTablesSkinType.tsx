import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableSkinType from '../../components/tables/BasicTables/BasicTableSkinType'

export default function BasicTablesSkinType() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Table SkinType' />
      <div className='space-y-6'>
        <ComponentCard title='Table Skin Type'>
          <BasicTableSkinType />
        </ComponentCard>
      </div>
    </>
  )
}
