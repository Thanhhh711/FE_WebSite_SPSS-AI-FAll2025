/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Plus, Globe, Building2, Edit3, Trash2, Eye, Info, FilterX } from 'lucide-react'

import brandApi from '../../../api/brand.api'
import countriesApi from '../../../api/country.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Brand, BrandForm } from '../../../types/brands.type'
import BrandModal from '../../BrandModal/BrandModal'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import { Country } from '../../../types/contries.type'

const ITEMS_PER_PAGE = 8

export default function BasicTableBrands() {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- FETCH DATA ---
  const { data: brandsResponse, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands()
  })

  const { data: countriesResponse } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getCountries()
  })

  const allBrands = brandsResponse?.data?.data || []
  const allCountries = countriesResponse?.data?.data || []

  console.log('countriesResponse', allCountries)
  // --- LOGIC LỌC DỮ LIỆU (SEARCH + COUNTRY FILTER) ---
  const filteredBrands = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return allBrands.filter((brand: Brand) => {
      const matchesSearch = brand.name.toLowerCase().includes(term)
      const matchesCountry = selectedCountry === 'all' || brand.countryId === Number(selectedCountry)
      return matchesSearch && matchesCountry
    })
  }, [allBrands, searchTerm, selectedCountry])

  // --- LOGIC PHÂN TRANG ---
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredBrands.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredBrands, currentPage])

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE)

  // --- MUTATIONS (SAVE & DELETE) ---
  const saveBrandMutation = useMutation({
    mutationFn: (data: BrandForm & { id?: string }) => {
      return data.id ? brandApi.updateBrand(data.id, data) : brandApi.createBrand(data)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast.success(vars.id ? 'Updated Brand successfully!' : 'Created Brand successfully!')
      setIsBrandModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Operation failed!')
    }
  })

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast.success('Brand removed successfully!')
      setIsConfirmOpen(false)
    },
    onError: () => toast.error('Could not delete brand. It might be linked to products.')
  })

  // --- HANDLERS ---
  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCountry('all')
    setCurrentPage(1)
  }

  return (
    <div className='p-4 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500'>
      {/* STATS HEADER */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-white/[0.03] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] flex items-center gap-6 shadow-sm'>
          <div className='p-4 bg-brand-50 text-brand-600 rounded-3xl'>
            <Building2 size={28} />
          </div>
          <div>
            <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Total Brand Partners</p>
            <h3 className='text-3xl font-black dark:text-white'>{allBrands.length}</h3>
          </div>
        </div>
        <div className='bg-white dark:bg-white/[0.03] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] flex items-center gap-6 shadow-sm'>
          <div className='p-4 bg-emerald-50 text-emerald-600 rounded-3xl'>
            <Globe size={28} />
          </div>
          <div>
            <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Origin Countries</p>
            <h3 className='text-3xl font-black dark:text-white'>{allCountries.length}</h3>
          </div>
        </div>
      </div>

      {/* TOOLBAR: SEARCH + FILTER + ADD */}
      <div className='flex flex-col xl:flex-row justify-between items-center gap-4 bg-white dark:bg-white/[0.02] p-4 rounded-[2rem] border border-gray-100 dark:border-white/[0.05]'>
        <div className='flex flex-col sm:flex-row w-full xl:w-auto gap-4 flex-1'>
          {/* Search Box */}
          <div className='relative flex-1 max-w-md group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by brand name...'
              className='w-full pl-12 pr-4 py-3 dark:text-white bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 font-bold text-sm transition-all'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Country Filter */}
          <div className='relative w-full sm:w-64 group'>
            <Globe
              className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500'
              size={18}
            />
            <select
              className='w-full pl-12 pr-10 py-3 dark:text-white bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 font-bold text-sm appearance-none cursor-pointer'
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value='all'>All Countries</option>
              {allCountries.map((c: Country) => (
                <option key={c.id} value={c.id}>
                  {c.countryName}
                </option>
              ))}
            </select>
            <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                <path d='m6 9 6 6 6-6' />
              </svg>
            </div>
          </div>

          {/* Reset Button */}
          {(searchTerm || selectedCountry !== 'all') && (
            <button
              onClick={handleResetFilters}
              className='flex items-center gap-2 px-4 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-tighter'
            >
              <FilterX size={16} /> Clear
            </button>
          )}
        </div>

        {profile?.role === Role.STORE_STAFF && (
          <button
            onClick={() => {
              setSelectedBrand(null)
              setIsViewMode(false)
              setIsBrandModalOpen(true)
            }}
            className='w-full xl:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-95 transition-all'
          >
            <Plus size={20} /> Add Brand Partner
          </button>
        )}
      </div>

      {/* MAIN TABLE */}
      <div className='bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm'>
        <div className='overflow-x-auto overflow-y-hidden'>
          <Table>
            <TableHeader className='bg-gray-50/50 dark:bg-white/[0.01]'>
              <TableRow>
                <TableCell
                  isHeader
                  className='py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400'
                >
                  Brand Information
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center'
                >
                  Origin
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right'
                >
                  Control
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isBrandsLoading ? (
                <TableRow>
                  <TableCell className='py-20 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest'>
                    Synchronizing Data...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell className='py-24 text-center'>
                    <div className='bg-gray-50 dark:bg-white/[0.02] w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-300'>
                      <Info size={40} />
                    </div>
                    <p className='text-sm font-black text-gray-400 uppercase tracking-widest'>
                      No records match your filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((brand: Brand) => (
                  <TableRow
                    key={brand.id}
                    className='group hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-all border-b border-gray-50 dark:border-white/[0.02]'
                  >
                    <TableCell className='py-5 px-8'>
                      <div className='flex items-center gap-4'>
                        {brand.imageUrl ? (
                          <div className='w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.1] shadow-sm'>
                            <img src={brand.imageUrl} alt={brand.name} className='w-full h-full object-cover' />
                          </div>
                        ) : (
                          <div className='w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-2xl flex items-center justify-center font-black text-xs uppercase'>
                            {brand.name.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className='font-black text-gray-900 dark:text-white leading-tight'>{brand.name}</p>
                          <p className='text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tighter line-clamp-1'>
                            {brand.title}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className='px-4 text-center'>
                      <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.05]'>
                        <span className='text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter'>
                          {allCountries.find((c) => c.id === brand.countryId)?.countryName || `ID: ${brand.countryId}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='px-8 text-right'>
                      <div className='flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all'>
                        <button
                          onClick={() => {
                            setSelectedBrand(brand)
                            setIsViewMode(true)
                            setIsBrandModalOpen(true)
                          }}
                          className='p-2.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-colors'
                        >
                          <Eye size={18} />
                        </button>
                        {profile?.role === Role.STORE_STAFF && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBrand(brand)
                                setIsViewMode(false)
                                setIsBrandModalOpen(true)
                              }}
                              className='p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors'
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBrand(brand)
                                setIsConfirmOpen(true)
                              }}
                              className='p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors'
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

        {/* PAGINATION FOOTER */}
        <div className='p-6 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]'>
            Showing Page {currentPage} of {totalPages || 1}
          </p>
          <div className='flex gap-2'>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className='px-6 py-2.5 text-[10px] font-black bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-30 shadow-sm hover:bg-gray-50 active:scale-95 transition-all uppercase'
            >
              Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className='px-6 py-2.5 text-[10px] font-black bg-brand-600 text-white rounded-xl disabled:opacity-30 shadow-lg shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all uppercase'
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM INFO */}
      <div className='flex justify-center items-center gap-3 opacity-30 py-4'>
        <div className='h-[1px] w-12 bg-gray-400'></div>
        <p className='text-[9px] font-black uppercase tracking-[0.4em] text-gray-500'>Global Brand Registry System</p>
        <div className='h-[1px] w-12 bg-gray-400'></div>
      </div>

      {/* MODALS */}
      {isBrandModalOpen && (
        <BrandModal
          countries={allCountries}
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          brand={selectedBrand}
          onSave={(data: any) => saveBrandMutation.mutate(data)}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => selectedBrand && deleteBrandMutation.mutate(selectedBrand.id)}
        title='Archive Brand'
        message={`Are you sure you want to archive "${selectedBrand?.name}"? This action may affect related products.`}
      />
    </div>
  )
}
