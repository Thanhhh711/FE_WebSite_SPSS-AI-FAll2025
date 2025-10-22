import { useNavigate } from 'react-router'
import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableProduct from '../../components/tables/BasicTables/BasicTableProduct'
import { AppPath } from '../../constants/Paths'

const AddProductButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition'
  >
    <span className='mr-1 text-lg'>+</span>
    Add Product
  </button>
)

export default function BasicTablesProduct() {
  const navigate = useNavigate()

  const handleAddClick = () => {
    // Logic của nút, ví dụ: mở modal hoặc chuyển hướng trang
    navigate(AppPath.FORM_ELEMENTS)
    // setIsAddProductModalOpen(true); // Kích hoạt Modal sau này
  }
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Basic Tables Product' />
      <div className='space-y-6'>
        <ComponentCard title='Basic Table 3' actionButton={<AddProductButton onClick={handleAddClick} />}>
          <BasicTableProduct />
        </ComponentCard>
      </div>
    </>
  )
}
