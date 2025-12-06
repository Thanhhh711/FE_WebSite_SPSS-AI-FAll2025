import { useState } from 'react'
import ComponentCard from '../../components/common/ComponentCard'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import BasicTableProduct from '../../components/tables/BasicTables/BasicTableProduct'
import ProductReviewsModal from '../../components/ProductModal/ProductReviewsModal'

export default function BasicTablesProduct() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductItemId, setSelectedProductItemId] = useState<string | null>(null)
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null)

  const openReviewsModal = (productItemId: string, productName: string) => {
    setSelectedProductItemId(productItemId)
    setSelectedProductName(productName)
    setIsModalOpen(true)
  }

  const closeReviewsModal = () => {
    setIsModalOpen(false)
    setSelectedProductItemId(null)
  }

  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Basic Tables Product' />
      <div className='space-y-6'>
        <ComponentCard title='Basic Table Product'>
          <BasicTableProduct onViewReviews={openReviewsModal} />
        </ComponentCard>
      </div>

      {isModalOpen && selectedProductItemId && (
        <ProductReviewsModal
          productName={selectedProductName as string}
          productItemId={selectedProductItemId}
          onClose={closeReviewsModal}
        />
      )}
    </>
  )
}
