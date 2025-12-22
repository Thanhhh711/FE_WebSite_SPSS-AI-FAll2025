/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from '@tanstack/react-query'
import { Edit3, Flag, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import countriesApi from '../../../api/country.api'
import { Country, CountryForm } from '../../../types/contries.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import CountryModal from '../../CountryModal/CountryModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableCountries() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const {
    data: countriesResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getCountries,
    staleTime: 1000 * 60 * 5
  })

  const allCountries = countriesResponse?.data.data || []
  const filteredAndPaginatedCountries = useMemo(() => {
    const filtered = allCountries.filter(
      (c: Country) =>
        c.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return { totalItems: filtered.length, data: filtered.slice(start, start + ITEMS_PER_PAGE) }
  }, [allCountries, searchTerm, currentPage])

  const { mutate: saveCountry } = useMutation({
    mutationFn: (data: CountryForm & { id?: number }) =>
      data.id ? countriesApi.updateCountry(data.id, data) : countriesApi.createCountry(data),
    onSuccess: (data) => {
      toast.success(data.data.message)

      refetch()
      setIsCountryModalOpen(false)
    }
  })

  const { mutate: deleteCountry } = useMutation({
    mutationFn: (id: number) => countriesApi.deleteCountry(id),
    onSuccess: (data) => {
      toast.success(data.data.message)

      refetch()
      setIsConfirmOpen(false)
    }
  })

  const handleConfirmDelete = () => {
    if (selectedCountry?.id) deleteCountry(selectedCountry.id)
  }

  if (isLoading)
    return <div className='p-20 text-center font-black text-blue-500 animate-pulse'>GLOBAL REGISTRY LOADING...</div>

  return (
    <div className='p-4 md:p-8 space-y-6 bg-slate-50/50 dark:bg-transparent min-h-screen'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600'>
            <Globe size={30} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Country Registry</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Active Regions: {filteredAndPaginatedCountries.totalItems}
            </p>
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              type='text'
              placeholder='Code or name...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none text-sm font-bold w-full sm:w-64'
            />
          </div>
          <button
            onClick={() => {
              setSelectedCountry(null)
              setIsViewMode(false)
              setIsCountryModalOpen(true)
            }}
            className='bg-slate-900 dark:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all'
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <Table>
          <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
            <TableRow className='border-none'>
              <TableCell
                isHeader
                className='px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Region Code
              </TableCell>
              <TableCell
                isHeader
                className='px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Country Name
              </TableCell>
              <TableCell
                isHeader
                className='px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Brands
              </TableCell>
              <TableCell
                isHeader
                className='px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndPaginatedCountries.data.map((country) => (
              <TableRow
                key={country.id}
                className='group hover:bg-blue-50/30 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
              >
                <TableCell className='px-8 py-7 text-center'>
                  <span className='px-4 py-2 bg-slate-100 dark:bg-gray-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase border dark:border-gray-700'>
                    {country.countryCode}
                  </span>
                </TableCell>
                <TableCell className='px-6 py-7 text-center'>
                  <div className='font-black text-slate-800 dark:text-white text-base flex items-center justify-center gap-2'>
                    <Flag size={14} className='text-blue-500' /> {country.countryName}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-7 text-center'>
                  <span className='px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-[10px] font-black'>
                    {country.brands?.length || 0} PARTNERS
                  </span>
                </TableCell>
                <TableCell className='px-8 py-7 text-right'>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => {
                        setSelectedCountry(country)
                        setIsViewMode(false)
                        setIsCountryModalOpen(true)
                      }}
                      className='p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-800 border border-slate-100'
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCountry(country)
                        setIsConfirmOpen(true)
                      }}
                      className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-800 border border-slate-100'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='p-10 flex justify-center'>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAndPaginatedCountries.totalItems / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
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
        title='Delete Region'
        message={`Permanent delete "${selectedCountry?.countryName}"?`}
      />
    </div>
  )
}
