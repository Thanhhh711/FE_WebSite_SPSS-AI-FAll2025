/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { User, SystermUserForm, SpecialtyType } from '../../types/user.type'
import { UploadCloud, X, Check } from 'lucide-react'
import Label from '../form/Label'
import userApi from '../../api/user.api'

interface Props {
  user: User | null
  isEditing: boolean
  isMyProfile: boolean
  isAdmin: boolean
  isBAViewingExpert: boolean
  onSave: (data: Partial<SystermUserForm>) => void
  onCancel: () => void
  onCertificateChange: (file: File) => void
}

const specialtyLabels: Record<SpecialtyType, string> = {
  [SpecialtyType.GeneralDermatology]: 'General Dermatology',
  [SpecialtyType.CosmeticDermatology]: 'Cosmetic Dermatology',
  [SpecialtyType.DermatologicSurgery]: 'Dermatologic Surgery',
  [SpecialtyType.PediatricDermatology]: 'Pediatric Dermatology',
  [SpecialtyType.LaserTreatment]: 'High-Tech Laser Therapy',
  [SpecialtyType.InjectablesSpecialist]: 'Injectables Specialist (Botox/Filler)',
  [SpecialtyType.SkinRehabilitation]: 'Skin Rehabilitation & Recovery',
  [SpecialtyType.DermatoOncology]: 'Dermato-Oncology',
  [SpecialtyType.HairAndScalpCare]: 'Hair & Scalp Care',
  [SpecialtyType.AllergyAndImmunology]: 'Dermatologic Allergy & Immunology'
}

export default function UserInfoCard({
  user,
  isEditing,
  isMyProfile,
  isAdmin,
  isBAViewingExpert,
  onSave,
  onCancel,
  onCertificateChange
}: Props) {
  const [formData, setFormData] = useState<Partial<SystermUserForm>>({})
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  console.log('isAdmin', isAdmin)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        surName: user.surName || '',
        phoneNumber: user.phoneNumber || '',
        emailAddress: user.emailAddress || '',
        clinic: (user as any)?.clinic || '',
        education: (user as any)?.education || '',
        yearsExperience: (user as any)?.yearsExperience || 0,
        specialties: Array.isArray(user.specialties) ? user.specialties : []
      })
    }
  }, [user, isEditing])

  const handleToggleExpertStatus = async (currentStatus: boolean) => {
    if (!user?.userId) return

    const newStatus = !currentStatus

    // Xác nhận nhanh với Admin (Tùy chọn)
    if (
      !window.confirm(`Are you sure you want to ${newStatus ? 'ACTIVATE' : 'DEACTIVATE'} Expert status for this user?`)
    ) {
      return
    }

    setIsUpdatingStatus(true)
    try {
      // Body truyền về định dạng JSON string hoặc object tùy theo cấu hình http của bạn
      // Ở đây body là { isExpert: newStatus }
      const body = JSON.stringify({ isExpert: newStatus })

      await userApi.editStatusExpert(user.userId, body)

      // Thông báo thành công (Bạn có thể dùng toast.success)
      alert('User status updated successfully!')

      // Cập nhật lại formData nếu đang trong mode Edit để đồng bộ
      setFormData((prev) => ({ ...prev, isExpert: newStatus }))
    } catch (error) {
      console.error('Update Expert Status Error:', error)
      alert('Failed to update expert status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (!user) return <div className='p-6 text-gray-500'>Loading...</div>

  return (
    <div className='p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800/10 dark:text-white'>
      {/* SECTION: Personal Information */}
      <h4 className='text-lg font-bold mb-6 text-gray-800 dark:text-white'>Personal Information</h4>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6  '>
        {/* Surname */}
        <div>
          <Label>Surname</Label>
          {isEditing ? (
            <input
              name='surName'
              value={formData.surName}
              onChange={(e) => setFormData({ ...formData, surName: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.surName || 'N/A'}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <Label>First Name</Label>
          {isEditing ? (
            <input
              name='firstName'
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.firstName || 'N/A'}</p>
          )}
        </div>

        {/* Date of Birth */}
        {/* <div>
          <Label>Date of Birth</Label>
          {isEditing ? (
            <input
              type='date'
              name='doB'
              value={formData.doB ?? ''}
              onChange={(e) => setFormData({ ...formData, doB: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.doB ? new Date(user.doB).toLocaleDateString() : 'N/A'}</p>
          )}
        </div> */}
      </div>

      {/* SECTION: Professional Expertise (Chỉ hiện cho Expert/Admin/BA) */}
      {/* SECTION: Professional Expertise (Chỉ hiện cho Expert/Admin/BA) */}
      {(isAdmin || isBAViewingExpert || (isMyProfile && user.isExpert)) && (
        <div className='mt-8 pt-8 border-t border-gray-100 dark:border-gray-800'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <h4 className='text-lg font-semibold text-brand-500'>Professional Expertise</h4>
              {/* Thông báo nhỏ dành riêng cho Admin */}
              {isAdmin && (
                <p className='text-xs text-amber-600 mt-1 italic font-medium'>
                  * Only Beauty Experts are allowed to fill in this information.
                </p>
              )}
            </div>

            <div className='flex flex-col items-end gap-3'>
              {/* TRƯỜNG ISEXPERT: Chỉ Admin mới có quyền điều chỉnh khi đang Edit */}
              <div className='flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
                <span className='text-[10px] font-bold text-gray-500 uppercase tracking-wider dark:text-white'>
                  Expert Status
                </span>

                {isAdmin ? (
                  <div className='flex items-center gap-2'>
                    {/* Hiện loader nhỏ khi đang xử lý API */}
                    {isUpdatingStatus && (
                      <div className='w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin'></div>
                    )}

                    <label
                      className={`relative inline-flex items-center ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        // Ưu tiên lấy từ formData nếu đang edit, nếu không lấy từ user gốc
                        checked={isEditing ? (formData.isExpert ?? user.isExpert) : user.isExpert}
                        disabled={isUpdatingStatus}
                        onChange={() =>
                          handleToggleExpertStatus(isEditing ? (formData.isExpert ?? user.isExpert) : user.isExpert)
                        }
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>
                ) : (
                  /* Nếu không phải Admin thì chỉ hiện Badge trạng thái */
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      user.isExpert ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isExpert ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                )}
              </div>

              {/* Nút Cập nhật bằng cấp: Ẩn nếu là Admin vì Admin không tự sửa bằng của mình ở đây */}
              {isMyProfile && isEditing && !isAdmin && (
                <label className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100'>
                  <UploadCloud size={14} /> UPDATE CERTIFICATE
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={(e) => e.target.files && onCertificateChange(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Cột trái: Kinh nghiệm & Học vấn */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Years of Experience</Label>
                  {isEditing ? (
                    <input
                      type='number'
                      disabled={isAdmin}
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                      className={`w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500 transition-all ${
                        isAdmin ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-gray-200' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className='font-medium mt-1'>{user.yearsExperience ?? 0} years</p>
                  )}
                </div>
                <div>
                  <Label>Clinic / Workplace</Label>
                  {isEditing ? (
                    <input
                      disabled={isAdmin}
                      value={formData.clinic}
                      onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                      className={`w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500 transition-all ${
                        isAdmin ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-gray-200' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className='font-medium mt-1'>{(user as any)?.clinic || 'Not Specified'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Education</Label>
                {isEditing ? (
                  <input
                    disabled={isAdmin}
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className={`w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500 transition-all ${
                      isAdmin ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-gray-200' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className='font-medium mt-1'>{(user as any)?.education || 'Not Specified'}</p>
                )}
              </div>

              <div>
                <Label>Training & Courses</Label>
                {isEditing ? (
                  <textarea
                    disabled={isAdmin}
                    value={formData.training}
                    onChange={(e) => setFormData({ ...formData, training: e.target.value })}
                    className={`w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500 min-h-[100px] transition-all ${
                      isAdmin ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-gray-200' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className='font-medium text-sm text-gray-600 mt-1 leading-relaxed'>
                    {user.training || 'No training records'}
                  </p>
                )}
              </div>
            </div>

            {/* Cột phải: Chuyên môn & Bằng cấp */}
            <div className='space-y-4'>
              <div>
                <Label>Specialties</Label>
                {isEditing ? (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border rounded-xl bg-gray-50 dark:bg-gray-900 ${
                      isAdmin ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'border-gray-200'
                    }`}
                  >
                    {Object.entries(specialtyLabels).map(([value, label]) => {
                      const specialtyId = Number(value)
                      const isChecked = formData.specialties?.includes(specialtyId)

                      return (
                        <label key={value} className='flex items-center gap-2 cursor-pointer group'>
                          <input
                            type='checkbox'
                            className='w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 transition-all'
                            checked={isChecked}
                            disabled={isAdmin}
                            onChange={(e) => {
                              const currentSpecs = Array.isArray(formData.specialties) ? formData.specialties : []
                              if (e.target.checked) {
                                // Thêm ID enum vào mảng
                                setFormData({ ...formData, specialties: [...currentSpecs, specialtyId] })
                              } else {
                                // Xóa ID enum khỏi mảng
                                setFormData({
                                  ...formData,
                                  specialties: currentSpecs.filter((id) => id !== specialtyId)
                                })
                              }
                            }}
                          />
                          <span className='text-xs text-gray-700 dark:text-gray-300 group-hover:text-brand-500 transition-colors'>
                            {label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  /* CHẾ ĐỘ VIEW: Map từ ID enum sang Label để hiển thị Badge */
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {user.specialties && user.specialties.length > 0 ? (
                      user.specialties.map((sId: number) => (
                        <span
                          key={sId}
                          className='px-2.5 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-md uppercase border border-brand-100 shadow-sm'
                        >
                          {specialtyLabels[sId as SpecialtyType] || `Specialty ${sId}`}
                        </span>
                      ))
                    ) : (
                      <span className='text-sm italic text-gray-400'>No specialties listed</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Verified Certificate</Label>
                <div className='mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 dark:bg-gray-900 relative group transition-all hover:border-brand-200'>
                  {user.certificate ? (
                    <img
                      src={user.certificate}
                      alt='Certificate'
                      className='w-full h-auto object-contain max-h-[320px] mx-auto'
                    />
                  ) : (
                    <div className='p-12 text-center text-gray-400 italic text-sm'>No certificate provided</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Action Buttons (Chỉ hiện khi đang Edit) */}
      {isEditing && (
        <div className='flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100'>
          <button
            onClick={onCancel}
            className='flex items-center gap-1 px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-50'
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className='flex items-center gap-1 px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600'
          >
            <Check size={16} /> Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
