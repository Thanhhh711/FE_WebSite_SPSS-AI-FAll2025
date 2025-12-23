import { useState, useEffect } from 'react'
import { User, SystermUserForm } from '../../types/user.type'
import Label from '../form/Label'

interface Props {
  user: User | null
  isEditing: boolean
  isMyProfile: boolean
  isAdmin: boolean
  onSave: (data: Partial<SystermUserForm>) => void
  onCancel: () => void
}

export default function UserAddressCard({ user, isEditing, isMyProfile, isAdmin, onSave, onCancel }: Props) {
  const defaultAddress = user?.addresses.find((addr) => addr.isDefault)
  const [addressData, setAddressData] = useState({ city: '', postCode: '', fullAddress: '' })

  useEffect(() => {
    if (defaultAddress) {
      setAddressData({
        city: defaultAddress.city || '',
        postCode: defaultAddress.postCode || '',
        fullAddress: `${defaultAddress.streetNumber ?? ''} ${defaultAddress.addressLine1 ?? ''}`.trim()
      })
    }
  }, [user, isEditing])

  // Visible to Admin or Owner only
  if (!user || (!isMyProfile && !isAdmin)) return null

  return (
    <div className='p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-800/10'>
      <h4 className='text-lg font-semibold mb-6 text-gray-800 dark:text-white'>Address Information</h4>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <Label>City / State</Label>
          {isEditing ? (
            <input
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
            />
          ) : (
            <p className='text-sm font-medium'>{defaultAddress?.city || 'N/A'}</p>
          )}
        </div>
        <div className='md:col-span-2'>
          <Label>Street Address</Label>
          {isEditing ? (
            <input
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
              value={addressData.fullAddress}
              onChange={(e) => setAddressData({ ...addressData, fullAddress: e.target.value })}
            />
          ) : (
            <p className='text-sm font-medium'>{addressData.fullAddress || 'N/A'}</p>
          )}
        </div>
      </div>
      {isEditing && (
        <div className='flex justify-end gap-3 mt-6 pt-4 border-t'>
          <button onClick={onCancel} className='text-sm text-gray-500 px-4 py-2 hover:font-bold'>
            Cancel
          </button>
          <button
            onClick={() => onSave({ clinic: addressData.fullAddress })}
            className='px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600'
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  )
}
