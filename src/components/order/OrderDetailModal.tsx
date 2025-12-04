import { Badge, Info, MapPin, ShoppingCart, User, XCircle } from 'lucide-react'
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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100'>
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
            <Info className='w-6 h-6 text-blue-500' />
            Order Details #
          </h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors'
          >
            <XCircle className='w-7 h-7' />
          </button>
        </div>

        {/* General Info & Customer */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          {/* Column 1: Order Info */}
          <div className='border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'>
            <h4 className='font-semibold text-lg mb-3 dark:text-white flex items-center gap-2'>
              <ShoppingCart className='w-5 h-5 text-indigo-500' />
              General Information
            </h4>
            <div className='space-y-1.5'>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium dark:text-white'>Status:</span>{' '}
                <Badge color={getStatusDisplay(order.status).color}>{getStatusDisplay(order.status).label}</Badge>
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium dark:text-white'>Created Date:</span>{' '}
                {formatDateToDDMMYYYY(order.createdTime)}
              </p>
              <p className='pt-2'>
                <span className='font-medium text-gray-700 dark:text-white block'>Total Amount:</span>{' '}
                <span className='text-2xl font-extrabold text-green-600 dark:text-green-400'>
                  {formatVND(order.orderTotal)} VNĐ
                </span>
              </p>
            </div>
          </div>

          {/* Column 2: Customer Info */}
          <div className='border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'>
            <h4 className='font-semibold text-lg mb-3 dark:text-white flex items-center gap-2'>
              <User className='w-5 h-5 text-indigo-500' />
              Customer Information
            </h4>
            <div className='space-y-1.5 '>
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
          <div className='border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'>
            <h4 className='font-semibold text-lg mb-3 dark:text-white flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-indigo-500' />
              Shipping Address
            </h4>
            <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
              {order.user.addresses[0]?.customerName || order.user.userName}
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>{getFullAddress(order.user.addresses)}</p>
          </div>
        </div>

        {/* Product List */}
        <div className='mb-6'>
          <h4 className='font-semibold text-xl mb-3 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
            Ordered Products ({order.orderDetails.length})
          </h4>
          <div className='space-y-3'>
            {order.orderDetails.map((detail, index) => (
              <div
                key={index}
                className='flex items-center p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'
              >
                <img
                  src={detail.thumbnailUrl || 'https://placehold.co/50x50/FACC15/FFFFFF?text=P'}
                  alt={detail.productName}
                  className='w-12 h-12 object-cover rounded mr-4 border dark:border-gray-700'
                />

                <div className='flex-grow'>
                  <p className='font-medium text-gray-900 dark:text-white'>{detail.productName}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>{detail.brandName}</p>
                </div>

                <div className='text-sm text-gray-600 dark:text-gray-300 w-1/6 text-center'>
                  Qty: <span className='font-semibold'>{detail.quantity}</span>
                </div>

                <div className='text-sm text-gray-600 dark:text-gray-300 w-1/6 text-right'>
                  Unit Price: <span className='font-medium'>{formatVND(detail.price)} VNĐ</span>
                </div>

                <div className='font-bold text-gray-800 dark:text-white w-1/6 text-right'>
                  Total: {formatVND(detail.price * detail.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status History */}
        <div>
          <h4 className='font-semibold text-xl mb-3 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
            Status History ({order.statusChanges.length})
          </h4>
          <div className='space-y-3'>
            {order.statusChanges
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((change, index) => {
                const display = getStatusDisplay(change.status)
                return (
                  <div
                    key={index}
                    className='flex justify-between items-center p-3 rounded-lg border-l-4 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-700/50'
                  >
                    <div className='flex items-center'>
                      <display.icon className='w-4 h-4 mr-3 text-blue-600 dark:text-blue-400' />
                      <span className='font-medium dark:text-white'>{display.label}</span>
                    </div>

                    <span className='text-sm text-gray-600 dark:text-gray-400'>
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
            className='px-6 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
