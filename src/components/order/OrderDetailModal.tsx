import { Badge, Info, MapPin, ShoppingCart, User, XCircle, DollarSign, Clock, Package } from 'lucide-react'
import { OrderResponse } from '../../types/order.type'
import { getFullAddress, getStatusDisplay } from '../../utils/oder.utils'
import { formatDateToDDMMYYYY, formatVND } from '../../utils/validForm'

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderResponse | null
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null

  // Class cơ bản cho các khối thông tin
  const infoBlockClass =
    'rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition duration-300 hover:shadow-lg'
  // Class cho tiêu đề khối
  const blockTitleClass =
    'font-bold text-xl mb-4 dark:text-white flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-800 pb-2'

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl 
                   transform transition-all duration-500 ease-out 
                   ring-2 ring-indigo-500/10'
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6'>
          <h3 className='text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3'>
            <Info className='w-8 h-8 text-indigo-600' />
            Order Details <span className='text-indigo-600 dark:text-indigo-400'>#{order.id}</span>
          </h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <XCircle className='w-8 h-8' />
          </button>
        </div>

        {/* General Info & Customer - Tăng kích thước max-w lên max-w-6xl */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {/* Column 1: Order Info */}
          <div className={`${infoBlockClass}`}>
            <h4 className={`${blockTitleClass}`}>
              <ShoppingCart className='w-6 h-6' />
              General Information
            </h4>
            <div className='space-y-4'>
              <p className='text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center'>
                <span className='font-medium dark:text-white flex items-center gap-1'>
                  <Clock className='w-4 h-4' /> Created Date:
                </span>{' '}
                <span className='font-semibold text-gray-800 dark:text-gray-200'>
                  {formatDateToDDMMYYYY(order.createdTime)}
                </span>
              </p>

              <p className='text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center'>
                <span className='font-medium dark:text-white flex items-center gap-1'>
                  <Package className='w-4 h-4' /> Status:
                </span>{' '}
                <Badge color={getStatusDisplay(order.status).color}>{getStatusDisplay(order.status).label}</Badge>
              </p>

              <div className='pt-3 border-t border-dashed border-gray-300 dark:border-gray-600'>
                <span className='font-bold text-gray-700 dark:text-white block mb-1'>Total Amount:</span>
                <span className='text-3xl font-extrabold text-green-600 dark:text-green-400 tracking-tight'>
                  {formatVND(order.orderTotal)} <span className='text-xl'>VNĐ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Info */}
          <div className={`${infoBlockClass}`}>
            <h4 className={`${blockTitleClass}`}>
              <User className='w-6 h-6' />
              Customer Information
            </h4>
            <div className='space-y-3'>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium dark:text-white'>Name:</span> {order.user.userName}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium dark:text-white'>Email:</span> {order.user.emailAddress}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium dark:text-white'>Phone:</span> {order.user.phoneNumber}
              </p>
            </div>
          </div>

          {/* Column 3: Shipping Address */}
          <div className={`${infoBlockClass}`}>
            <h4 className={`${blockTitleClass}`}>
              <MapPin className='w-6 h-6' />
              Shipping Address
            </h4>
            <p className='text-base text-gray-700 dark:text-gray-200 font-semibold mb-1'>
              {order.user.addresses[0]?.customerName || order.user.userName}
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
              {getFullAddress(order.user.addresses)}
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className='mb-8 border border-gray-200 dark:border-gray-700 rounded-xl p-5'>
          <h4 className='font-bold text-2xl mb-4 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2'>
            <DollarSign className='w-6 h-6 text-green-600' />
            Ordered Products ({order.orderDetails.length})
          </h4>
          <div className='space-y-3'>
            {order.orderDetails.map((detail, index) => (
              <div
                key={index}
                className='flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm'
              >
                <img
                  src={detail.thumbnailUrl || 'https://placehold.co/60x60/FACC15/FFFFFF?text=P'}
                  alt={detail.productName}
                  className='w-16 h-16 object-cover rounded-lg mr-5 border border-gray-200 dark:border-gray-700'
                />

                <div className='flex-grow'>
                  <p className='font-semibold text-lg text-gray-900 dark:text-white'>{detail.productName}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Brand: {detail.brandName}</p>
                </div>

                <div className='text-sm text-gray-600 dark:text-gray-300 w-1/6 text-center'>
                  <span className='block text-xs text-gray-500 dark:text-gray-400'>Quantity</span>
                  <span className='font-extrabold text-base text-indigo-600 dark:text-indigo-400'>
                    {detail.quantity}
                  </span>
                </div>

                <div className='text-sm text-gray-600 dark:text-gray-300 w-1/6 text-right'>
                  <span className='block text-xs text-gray-500 dark:text-gray-400'>Unit Price</span>
                  <span className='font-semibold'>{formatVND(detail.price)} VNĐ</span>
                </div>

                <div className='font-bold text-lg text-gray-900 dark:text-white w-1/6 text-right'>
                  <span className='block text-xs text-gray-500 dark:text-gray-400'>Total</span>
                  {formatVND(detail.price * detail.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status History */}
        <div className='mb-8 border border-gray-200 dark:border-gray-700 rounded-xl p-5'>
          <h4 className='font-bold text-2xl mb-4 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2'>
            <Clock className='w-6 h-6 text-blue-600' />
            Status History ({order.statusChanges.length})
          </h4>
          <div className='space-y-4'>
            {order.statusChanges
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((change, index) => {
                const display = getStatusDisplay(change.status)
                const isLatest = index === 0
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-lg border-l-4 ${isLatest ? 'border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}
                  >
                    <div className='flex items-center'>
                      <display.icon
                        className={`w-5 h-5 mr-4 ${isLatest ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}
                      />
                      <span
                        className={`font-semibold ${isLatest ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {display.label}
                      </span>
                    </div>

                    <span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
                      {formatDateToDDMMYYYY(change.date)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Close Button */}
        <div className='flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='px-8 py-2.5 text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
