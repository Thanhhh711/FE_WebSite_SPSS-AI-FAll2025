import { useState, useEffect } from 'react'
import { User, SystermUserForm } from '../../types/user.type'
import Label from '../form/Label'

interface Props {
  user: User | null
  isEditing: boolean
  onSave: (data: Partial<SystermUserForm>) => void
  onCancel: () => void
}

export default function UserAddressCard({ user, isEditing, onSave, onCancel }: Props) {
  const defaultAddress = user?.addresses.find((addr) => addr.isDefault)

  // State cục bộ để quản lý việc nhập liệu (Vì địa chỉ thường là chuỗi dài hoặc các trường lẻ)
  const [addressData, setAddressData] = useState({
    city: '',
    postCode: '',
    fullAddress: ''
  })

  useEffect(() => {
    if (defaultAddress) {
      setAddressData({
        city: defaultAddress.city || '',
        postCode: defaultAddress.postCode || '',
        fullAddress: `${defaultAddress.streetNumber ?? ''} ${defaultAddress.addressLine1 ?? ''}`.trim()
      })
    }
  }, [user, isEditing])

  if (!user) return null

  return (
    <div className='p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-800/10'>
      <div className='flex justify-between items-center mb-6'>
        <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>Address Information</h4>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7'>
        {/* City/State */}
        <div>
          <Label>City / State</Label>
          {isEditing ? (
            <input
              className='w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900 focus:ring-1 focus:ring-brand-500 outline-none'
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
            />
          ) : (
            <p className='mt-1 text-sm font-medium text-gray-800 dark:text-white/90'>{defaultAddress?.city || 'N/A'}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <Label>Postal Code</Label>
          {isEditing ? (
            <input
              className='w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900 focus:ring-1 focus:ring-brand-500 outline-none'
              value={addressData.postCode}
              onChange={(e) => setAddressData({ ...addressData, postCode: e.target.value })}
            />
          ) : (
            <p className='mt-1 text-sm font-medium text-gray-800 dark:text-white/90'>
              {defaultAddress?.postCode || 'N/A'}
            </p>
          )}
        </div>

        {/* Full Address Detail */}
        <div className='lg:col-span-2'>
          <Label>Street Address</Label>
          {isEditing ? (
            <input
              className='w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900 focus:ring-1 focus:ring-brand-500 outline-none'
              value={addressData.fullAddress}
              onChange={(e) => setAddressData({ ...addressData, fullAddress: e.target.value })}
              placeholder='e.g. 123 Main St, Ward 4...'
            />
          ) : (
            <p className='mt-1 text-sm font-medium text-gray-800 dark:text-white/90'>
              {defaultAddress
                ? `${defaultAddress.streetNumber ?? ''} ${defaultAddress.addressLine1 ?? ''}, ${defaultAddress.city ?? ''}`.trim()
                : 'No default address'}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons inside Address Card if you want to save independently, 
          or it will be saved via the main Save button in UserProfiles */}
      {isEditing && (
        <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800'>
          <button onClick={onCancel} className='text-sm text-gray-500 font-bold px-4 py-2'>
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                // Map lại các trường địa chỉ vào clinic hoặc một trường text nếu API của bạn không có body riêng cho Address
                clinic: addressData.fullAddress // Ví dụ: tạm lưu địa chỉ vào clinic nếu profile bác sĩ
              })
            }
            className='px-6 py-2 bg-brand-500 text-white rounded-lg font-bold shadow-md hover:bg-brand-600'
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  )
}
