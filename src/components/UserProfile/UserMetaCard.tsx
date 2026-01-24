/* eslint-disable @typescript-eslint/no-explicit-any */
import { CameraIcon, Mail, Phone, Sparkles, X, Droplets, Sun, Wind, Activity } from 'lucide-react'
import { useState } from 'react'
import { User } from '../../types/user.type'
import { Role } from '../../constants/Roles'

// Khai báo interface trực tiếp hoặc import từ file type của bạn
export interface SkinProfile {
  id: string
  skinTypeId: string
  skinTypeName: string
  age: number
  gender: 'male' | 'female' | 'other'
  livingEnvironment: number
  climateRegion: number
  humidityLevel: number
  uvIndex: number
  pollutionLevel: number
  skinHistory: string
  dailyRoutine: string
  waterIntake: string
  stressLevel: string
  diet: string
  exerciseFrequency: string
  sleepHabit: string
  allergy: string
  sensitivities: string
}

interface UserMetaCardProps {
  user: User | null
  skinProfile?: SkinProfile | null
  isMyProfile: boolean
  isEditing: boolean
  onAvatarChange: (file: File) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function UserMetaCard({
  user,
  skinProfile,
  isMyProfile,
  isEditing,
  onAvatarChange,
  onInputChange
}: UserMetaCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isCustomer = user?.roleName === Role.CUSTOMER
  return (
    <div className='p-6 bg-white rounded-2xl shadow-sm dark:bg-gray-800/20 border border-gray-100 dark:border-gray-700'>
      <div className='flex flex-col sm:flex-row items-center gap-6'>
        {/* Avatar Section */}
        <div className='relative h-28 w-28 flex-shrink-0'>
          <div className='h-full w-full overflow-hidden rounded-full border-4 border-white dark:border-gray-700 shadow-md'>
            <img src={user?.avatarUrl || '/default-avatar.png'} alt='Profile' className='h-full w-full object-cover' />
          </div>
          {isMyProfile && (
            <label className='absolute bottom-1 right-1 p-2 bg-brand-500 text-white rounded-full cursor-pointer hover:bg-brand-600 shadow-lg transition-transform hover:scale-110'>
              <CameraIcon size={18} />
              <input
                type='file'
                className='hidden'
                accept='image/*'
                onChange={(e) => e.target.files && onAvatarChange(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {/* User Info Section */}
        <div className='flex-1 text-center sm:text-left'>
          <div className='mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h3 className='text-2xl font-bold text-gray-800 dark:text-white'>
                {user?.firstName} {user?.surName}
              </h3>
              <p className='text-sm font-semibold text-brand-500 uppercase tracking-widest'>
                {user?.roleName || 'Member'}
              </p>
            </div>

            {isCustomer && (
              <button
                onClick={() => setIsModalOpen(true)}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-brand-500 text-white rounded-xl hover:shadow-lg hover:opacity-90 transition-all text-sm font-bold'
              >
                <Sparkles size={16} />
                View Skin Profile
              </button>
            )}
          </div>

          <div className='flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3'>
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
              <Mail size={16} className='text-brand-500' />
              {isEditing ? (
                <input
                  name='emailAddress'
                  value={user?.emailAddress || ''}
                  onChange={onInputChange}
                  placeholder='Email'
                  className='text-sm border-b border-gray-300 dark:bg-transparent outline-none focus:border-brand-500'
                />
              ) : (
                <span className='text-sm font-medium'>{user?.emailAddress || 'No email provided'}</span>
              )}
            </div>
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
              <Phone size={16} className='text-brand-500' />
              {isEditing ? (
                <input
                  name='phoneNumber'
                  value={user?.phoneNumber || ''}
                  onChange={onInputChange}
                  placeholder='Phone'
                  className='text-sm border-b border-gray-300 dark:bg-transparent outline-none focus:border-brand-500'
                />
              ) : (
                <span className='text-sm font-medium'>{user?.phoneNumber || 'No phone provided'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skin Profile Modal */}
      {isModalOpen && isCustomer && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col'>
            {/* Modal Header */}
            <div className='p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center'>
              <div>
                <h2 className='text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2'>
                  <Sparkles className='text-brand-500' size={22} />
                  Skin Analysis Profile
                </h2>
                <p className='text-xs text-gray-500 mt-1'>Detailed skin condition and lifestyle factors</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors'
              >
                <X size={20} className='text-gray-500' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6 overflow-y-auto'>
              {skinProfile ? (
                <div className='space-y-8'>
                  {/* Basic Info Grid */}
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <DataCard label='Skin Type' value={skinProfile.skinTypeName} highlight />
                    <DataCard label='Age' value={skinProfile.age} />
                    <DataCard label='Gender' value={skinProfile.gender} capitalize />
                    <DataCard label='Stress Level' value={skinProfile.stressLevel} />
                  </div>

                  {/* Environment Section */}
                  <div>
                    <h4 className='text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
                      <Activity size={14} /> Environment & Metrics
                    </h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <MetricCard
                        icon={<Sun size={14} />}
                        label='UV Index'
                        value={skinProfile.uvIndex}
                        color='text-orange-500'
                      />
                      <MetricCard
                        icon={<Droplets size={14} />}
                        label='Humidity'
                        value={`${skinProfile.humidityLevel}%`}
                        color='text-blue-500'
                      />
                      <MetricCard
                        icon={<Wind size={14} />}
                        label='Pollution'
                        value={skinProfile.pollutionLevel}
                        color='text-gray-500'
                      />
                      <MetricCard
                        icon={<Activity size={14} />}
                        label='Environment'
                        value={skinProfile.livingEnvironment}
                        color='text-green-500'
                      />
                    </div>
                  </div>

                  {/* Lifestyle & History */}
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                      <TextSection title='Daily Routine' content={skinProfile.dailyRoutine} />
                      <TextSection title='Diet & Nutrition' content={skinProfile.diet} />
                      <TextSection title='Sleep Habits' content={skinProfile.sleepHabit} />
                    </div>
                    <div className='space-y-4'>
                      <TextSection title='Skin History' content={skinProfile.skinHistory} highlight />
                      <TextSection title='Allergies' content={skinProfile.allergy} />
                      <TextSection title='Sensitivities' content={skinProfile.sensitivities} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                  <Sparkles size={48} className='mb-4 opacity-20' />
                  <p>No skin profile data found for this user.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='p-4 border-t border-gray-100 dark:border-gray-800 text-center'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='px-6 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** * Sub-components for better organization
 */

function DataCard({
  label,
  value,
  highlight,
  capitalize
}: {
  label: string
  value: any
  highlight?: boolean
  capitalize?: boolean
}) {
  return (
    <div
      className={`p-3 rounded-2xl border ${highlight ? 'border-brand-200 bg-brand-50/50 dark:bg-brand-500/5' : 'border-gray-100 dark:border-gray-800'}`}
    >
      <p className='text-[10px] font-bold text-gray-400 uppercase mb-1'>{label}</p>
      <p
        className={`text-sm font-bold ${highlight ? 'text-brand-600' : 'text-gray-700 dark:text-gray-200'} ${capitalize ? 'capitalize' : ''}`}
      >
        {value || 'N/A'}
      </p>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: any
  color: string
}) {
  return (
    <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl'>
      <div className={`${color} p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm`}>{icon}</div>
      <div>
        <p className='text-[10px] font-bold text-gray-400 uppercase'>{label}</p>
        <p className='text-xs font-bold dark:text-gray-200'>{value}</p>
      </div>
    </div>
  )
}

function TextSection({ title, content, highlight }: { title: string; content: string; highlight?: boolean }) {
  return (
    <div
      className={`p-4 rounded-2xl ${highlight ? 'bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/30' : 'bg-gray-50 dark:bg-gray-800/30'}`}
    >
      <h5
        className={`text-[11px] font-black uppercase tracking-widest mb-2 ${highlight ? 'text-amber-600' : 'text-gray-500'}`}
      >
        {title}
      </h5>
      <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
        {content || 'No information provided.'}
      </p>
    </div>
  )
}
