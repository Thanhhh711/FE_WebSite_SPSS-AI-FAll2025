/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import countriesApi from '../../../api/country.api'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'

import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import { Country, CountryForm } from '../../../types/contries.type'
import CountryModal from '../../CountryModal/CountryModal'

const ITEMS_PER_PAGE = 10

export default function BasicTableCountries() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ (R) ---
  const {
    data: countriesResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getCountries,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  const allCountries = countriesResponse?.data.data || []

  const filteredAndPaginatedCountries = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allCountries.filter(
      (country: Country) =>
        country.countryName.toLowerCase().includes(lowercasedSearchTerm) ||
        country.countryCode.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allCountries, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---
  const { mutate: saveCountry } = useMutation({
    mutationFn: (data: CountryForm & { id?: number }) => {
      if (data.id) {
        return countriesApi.updateCountry(data.id, data)
      }
      return countriesApi.createCountry(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Country saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      refetch()
      setIsCountryModalOpen(false)
      setSelectedCountry(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving country.')
    }
  })

  const { mutate: deleteCountry, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => countriesApi.deleteCountry(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Country deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      refetch()
      setSelectedCountry(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting country.')
    }
  })

  // --- EVENT HANDLERS ---
  const handleOpenDetailModal = (country: Country, mode: 'view' | 'edit') => {
    setSelectedCountry(country)
    setIsViewMode(mode === 'view')
    setIsCountryModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedCountry(null)
    setIsViewMode(false)
    setIsCountryModalOpen(true)
  }

  const handleDeleteClick = (country: Country) => {
    setSelectedCountry(country)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCountry?.id) {
      deleteCountry(selectedCountry.id)
      setIsConfirmOpen(false)
    }
  }

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Countries...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading country list.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        <input
          type='text'
          placeholder='Search by Name or Code...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add New Country
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-center'>
                  Code
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-center'>
                  Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-center'>
                  Brands Count
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-center'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedCountries.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No countries found.' : 'No countries have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedCountries.data.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className='px-4 py-3 text-center truncate max-w-[100px]  '>
                      {country.countryCode}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-center font-medium truncate max-w-[200px]'>
                      {country.countryName}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-center'>{country.brands?.length || 0}</TableCell>
                    <TableCell className='px-4 py-3 text-center'>
                      <div className='flex justify-center gap-2'>
                        <button
                          onClick={() => handleOpenDetailModal(country, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleOpenDetailModal(country, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Country'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteClick(country)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Country'
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredAndPaginatedCountries.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedCountries.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {isCountryModalOpen && (
        <CountryModal
          isOpen={isCountryModalOpen}
          onClose={() => setIsCountryModalOpen(false)}
          country={selectedCountry}
          onSave={saveCountry}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Country Deletion'
        message={`Are you sure you want to delete the country "${selectedCountry?.countryName}"? This action cannot be undone.`}
      />
    </>
  )
}
