/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

// Assume these UI components are imported correctly
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

// Assume API client and types
import { templateApi } from '../../../api/template.api' // 🚨 Ensure this path is correct
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleTemplate, TemplateForm } from '../../../types/templete.type'
import TemplateModal from '../../TemplateModal/TemplateModal'

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 10

// --- MAIN COMPONENT ---

export default function BasicTableTemplate() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ (R) ---
  const {
    data: allTemplates = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await templateApi.getTemplates()
      return res.data.data
    },
    staleTime: 1000 * 60 * 5
  })

  // --- FILTERING AND PAGINATION ---
  const filteredAndPaginatedTemplates = useMemo(() => {
    // Filter by name or description
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allTemplates.filter(
      (template: ScheduleTemplate) =>
        template.name.toLowerCase().includes(lowercasedSearchTerm) ||
        template.description.toLowerCase().includes(lowercasedSearchTerm)
    )

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allTemplates, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---

  // Mutation for Create and Update
  const { mutate: saveTemplate } = useMutation({
    mutationFn: (data: TemplateForm & { id?: string }) => {
      if (data.id) {
        // Update
        return templateApi.updateTemplate(data.id, data)
      }
      // Create
      return templateApi.createTemplate(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Template saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // Reset state and close modal after successful save
      setIsTemplateModalOpen(false)
      setSelectedTemplate(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving template.')
    }
  })

  // Mutation for Delete
  const { mutate: deleteTemplate } = useMutation({
    mutationFn: (id: string) => templateApi.deleteTemplate(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Template deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting template.')
    }
  })

  // --- EVENT HANDLERS ---

  const handleOpenDetailModal = (template: ScheduleTemplate, mode: 'view' | 'edit') => {
    setSelectedTemplate(template)
    setIsViewMode(mode === 'view')
    setIsTemplateModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null) // Reset to open Create mode
    setIsViewMode(false)
    setIsTemplateModalOpen(true)
  }

  const handleDeleteClick = (template: ScheduleTemplate) => {
    setSelectedTemplate(template)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedTemplate?.id) {
      deleteTemplate(selectedTemplate.id)
      setIsConfirmOpen(false)
      setSelectedTemplate(null)
    }
  }

  // --- RENDERING ---

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Template list...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading template list.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Template Name or Description...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset page on search
          }}
          className='dark:text-white w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Create Button */}
        {profile?.role === Role.ADMIN && (
          <button
            onClick={handleCreateNew}
            className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
          >
            Add New Template
          </button>
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total: **{filteredAndPaginatedTemplates.totalItems}**
          </span>
        </div>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Description
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Created Time
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredAndPaginatedTemplates.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No matching templates found.' : 'No templates have been registered.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedTemplates.data.map((template) => (
                  <TableRow key={template.id} className='dark:text-gray-300'>
                    <TableCell className='px-5 py-4 font-medium truncate max-w-[150px]'>{template.name}</TableCell>
                    <TableCell className='px-4 py-3 text-start truncate max-w-[300px]'>
                      {template.description || 'N/A'}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-start'>
                      {new Date(template.createdTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* View/Edit Buttons */}
                        <button
                          onClick={() => handleOpenDetailModal(template, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>

                        {profile?.role === Role.ADMIN && (
                          <>
                            <button
                              onClick={() => handleOpenDetailModal(template, 'edit')}
                              className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                              title='Edit Template'
                            >
                              Edit
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(template)}
                              className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                              title='Delete Template'
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndPaginatedTemplates.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedTemplates.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- TEMPLATE DETAIL MODAL --- */}
      {isTemplateModalOpen && ( // Using conditional rendering to ensure form resets
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          template={selectedTemplate}
          onSave={saveTemplate}
          isViewMode={isViewMode}
        />
      )}

      {/* --- CONFIRM DELETION MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Template Deletion'
        message={`Are you sure you want to delete template "${selectedTemplate?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
