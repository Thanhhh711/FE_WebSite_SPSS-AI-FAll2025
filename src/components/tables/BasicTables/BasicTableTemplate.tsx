/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Edit3, Trash2, Eye, Search, Plus, Clock, Hash } from 'lucide-react'

import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

import { templateApi } from '../../../api/template.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleTemplate, TemplateForm } from '../../../types/templete.type'
import TemplateModal from '../../TemplateModal/TemplateModal'
import { slotApi } from '../../../api/slot.api'
import { SuccessResponse } from '../../../utils/utils.type'
import { Slot } from '../../../types/registration.type'

const ITEMS_PER_PAGE = 10

export default function BasicTableTemplate() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- QUERIES ---
  const {
    data: templatesRes,
    isLoading,
    refetch
  } = useQuery<SuccessResponse<ScheduleTemplate[]>>({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates().then((res) => res.data)
  })

  const { data: slotsRes } = useQuery<SuccessResponse<Slot[]>>({
    queryKey: ['slots'],
    queryFn: () => slotApi.getSlots().then((res) => res.data)
  })

  const templates = templatesRes?.data ?? []
  const slots = slotsRes?.data ?? []

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: (body: TemplateForm) => templateApi.createTemplate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setIsTemplateModalOpen(false)
    }
  })

  // Hàm helper để tìm thông tin slot nhanh
  const getSlotInfo = (slotId: string) => {
    return slots.find((s) => s.id === slotId)
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: TemplateForm }) => templateApi.updateTemplate(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setIsTemplateModalOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateApi.deleteTemplate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setIsConfirmOpen(false)
      toast.success(data.data.message)
    }
  })

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setSelectedTemplate(null)
    setIsViewMode(false)
    setIsTemplateModalOpen(true)
  }

  const handleOpenEdit = (template: ScheduleTemplate) => {
    setSelectedTemplate(template)
    setIsViewMode(false)
    setIsTemplateModalOpen(true)
  }

  const handleOpenView = (template: ScheduleTemplate) => {
    setSelectedTemplate(template)
    setIsViewMode(true)
    setIsTemplateModalOpen(true)
  }

  const handleDeleteClick = (template: ScheduleTemplate) => {
    setSelectedTemplate(template)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedTemplate) deleteMutation.mutate(selectedTemplate.id)
  }

  const saveTemplate = (data: TemplateForm & { id?: string }) => {
    const { id, ...body } = data
    if (id) {
      updateMutation.mutate({ id, body })
    } else {
      createMutation.mutate(body)
    }
  }

  // --- FILTER & PAGINATION ---
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [templates, searchTerm])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTemplates, currentPage])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-10'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
        <span className='ml-3 text-slate-500'>Đang tải danh sách...</span>
      </div>
    )
  }

  // 2. Kiểm tra nếu templates thực sự trống hoặc null sau khi đã load xong
  if (!templates || templates.length === 0) {
    return (
      <div className='text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200'>
        <p className='text-slate-400'>Không tìm thấy dữ liệu bài test nào.</p>
        <button onClick={() => refetch?.()} className='mt-4 text-indigo-600 font-bold hover:underline'>
          Thử tải lại
        </button>
      </div>
    )
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-xl overflow-hidden'>
        {/* Header Actions */}
        <div className='p-6 border-b border-gray-50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input
              type='text'
              placeholder='Search templates...'
              className='w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {profile?.role === Role.ADMIN && (
            <button
              onClick={handleOpenCreate}
              className='flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20'
            >
              <Plus size={18} /> Create Template
            </button>
          )}
        </div>

        {/* Table Content */}
        <div className='overflow-x-auto'>
          <Table className='w-full table-fixed'>
            {' '}
            {/* Thêm table-fixed để ép các cột tuân thủ độ rộng */}
            <TableHeader>
              <TableRow className='bg-gray-50/50 dark:bg-white/[0.02]'>
                {/* Thiết lập % độ rộng cho từng cột */}
                <TableCell isHeader className='w-[25%] px-5 py-4'>
                  Template Name
                </TableCell>
                <TableCell isHeader className='w-[25%] px-5 py-4'>
                  Slot & Timing
                </TableCell>
                <TableCell isHeader className='w-[30%] px-5 py-4'>
                  Description
                </TableCell>
                <TableCell isHeader className='w-[20%] px-5 py-4 text-right'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className='text-center py-10 text-gray-400'>Loading templates...</TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell className='text-center p y-10 text-gray-400'>No templates found.</TableCell>
                </TableRow>
              ) : (
                paginatedData.map((template) => (
                  <TableRow
                    key={template.id}
                    className='hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800'
                  >
                    {/* Cột 1: Tên */}
                    <TableCell className='px-5 py-4 w-[25%]'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-gray-800 dark:text-gray-200 truncate'>{template.name}</span>
                        <span className='text-[10px] text-gray-400 font-mono uppercase tracking-tighter'>
                          ID: {template.id.slice(0, 8)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cột 2: Slot & Timing */}
                    <TableCell className='px-5 py-4 w-[25%]'>
                      <div className='flex flex-col items-start gap-2'>
                        <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm'>
                          <Hash size={12} className='opacity-70' />
                          <span className='text-xs font-bold whitespace-nowrap'>
                            {(() => {
                              const slotDetail = getSlotInfo(template.slotId)
                              return slotDetail
                                ? `${slotDetail.slotMinutes}m / ${slotDetail.breakMinutes}m break`
                                : 'Loading...'
                            })()}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 ml-1'>
                          <Clock size={14} className='text-gray-400' />
                          <span className='whitespace-nowrap'>
                            {template.startTime.slice(0, 5)} - {template.endTime.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 3: Mô tả */}
                    <TableCell className='px-5 py-4 w-[30%] text-sm text-gray-500 dark:text-gray-400'>
                      <p className='truncate max-w-full'>
                        {template.description || <span className='italic opacity-50 text-xs'>No description</span>}
                      </p>
                    </TableCell>

                    {/* Cột 4: Hành động */}
                    <TableCell className='px-5 py-4 w-[20%] text-right'>
                      <div className='flex justify-end gap-1'>
                        <button
                          onClick={() => handleOpenView(template)}
                          className='p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all'
                        >
                          <Eye size={18} />
                        </button>
                        {profile?.role === Role.ADMIN && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(template)}
                              className='p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all'
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(template)}
                              className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all'
                            >
                              <Trash2 size={18} />
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
        {filteredTemplates.length > ITEMS_PER_PAGE && (
          <div className='p-6 border-t border-gray-50 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {isTemplateModalOpen && (
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          template={selectedTemplate}
          onSave={saveTemplate}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Template'
        message={`Are you sure you want to delete "${selectedTemplate?.name}"?`}
      />
    </>
  )
}
