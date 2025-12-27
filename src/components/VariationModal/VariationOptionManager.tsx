// file: VariationOptionManager.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import variationApi from '../../api/variation.api'
import { VariationOptionForm, VarionOptionInResponse } from '../../types/variation.type'

interface VariationOptionManagerProps {
  variationId: string
  initialOptions: VarionOptionInResponse[]
  isViewMode: boolean
  refetch: () => void
}

const baseInputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

export default function VariationOptionManager({
  variationId,
  initialOptions,
  isViewMode,
  refetch
}: VariationOptionManagerProps) {
  const queryClient = useQueryClient()
  const [options, setOptions] = useState<VarionOptionInResponse[]>(initialOptions)
  const [newOptionValue, setNewOptionValue] = useState('')

  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const invalidateParentQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['variations'] })
    queryClient.invalidateQueries({ queryKey: ['variation', variationId] })
  }, [queryClient, variationId])

  // --- MUTATIONS for Options ---
  const { mutate: createOption } = useMutation({
    mutationFn: (body: VariationOptionForm) => variationApi.createVariationOption(body),
    onSuccess: () => {
      toast.success('Option added successfully!')
      setNewOptionValue('')
      invalidateParentQuery()
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.data?.message || 'Error creating option.')
    }
  })

  const { mutate: deleteOption } = useMutation({
    mutationFn: (optionId: string) => variationApi.deleteVariationOption(optionId),
    onSuccess: (_res, optionId) => {
      toast.success('Option deleted successfully!')
      setOptions((prev) => prev.filter((opt) => opt.id !== optionId))
      refetch()
      invalidateParentQuery()
    },
    onError: (error: any) => {
      toast.error(error.data?.message || 'Error deleting option.')
    }
  })

  const handleAddOption = () => {
    const trimmedValue = newOptionValue.trim()
    if (!trimmedValue) {
      toast.error('Option value cannot be empty.')
      return
    }
    if (options.some((opt) => opt.value.toLowerCase() === trimmedValue.toLowerCase())) {
      toast.error('Option value already exists.')
      return
    }

    createOption({
      value: trimmedValue,
      variationId: variationId
    })
  }

  return (
    <div className='mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
      <h4 className='text-sm font-semibold text-gray-800 dark:text-white mb-3'>
        {isViewMode ? `Options (${options?.length ?? 0})` : 'Manage Options'}
      </h4>

      {!isViewMode && (
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            placeholder='Enter new option value (e.g., Red, XL)'
            value={newOptionValue}
            onChange={(e) => setNewOptionValue(e.target.value)}
            className={baseInputClass}
          />
          <button
            onClick={handleAddOption}
            className='bg-brand-500 text-white rounded-lg px-3 py-2 text-sm flex items-center justify-center hover:bg-brand-600 transition-colors w-10 h-10 flex-shrink-0'
            title='Add Option'
          >
            <span className='text-xl font-bold leading-none'>+</span>
          </button>
        </div>
      )}

      <div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1'>
        {(options?.length ?? 0) === 0 ? (
          <p className='text-sm text-gray-500 italic'>No options defined yet.</p>
        ) : (
          options.map((option) => (
            <div
              key={option.id}
              className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1 text-xs font-medium text-gray-800 dark:text-gray-200'
            >
              {option.value}
              {!isViewMode && (
                <button
                  onClick={() => deleteOption(option.id)}
                  className='ml-1 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center'
                  title='Remove Option'
                >
                  {/* Biểu tượng Close (×) */}
                  <span className='text-sm font-semibold leading-none'>&times;</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
