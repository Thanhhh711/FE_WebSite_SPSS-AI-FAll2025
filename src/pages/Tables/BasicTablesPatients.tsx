import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'
import BasicTablePatients from '../../components/tables/BasicTables/BasicTablePatients'

export default function BasicTablesPatients() {
  return (
    <>
      <PageMeta
        title='React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Basic Tables Patients' />
      <div className='space-y-6'>
        <ComponentCard title='Basic Table 4'>
          <BasicTablePatients />
        </ComponentCard>
      </div>
    </>
  )
}
