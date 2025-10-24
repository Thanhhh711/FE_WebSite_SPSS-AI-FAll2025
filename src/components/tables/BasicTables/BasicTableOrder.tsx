/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { CheckCircle, Clock, XCircle, Truck, ClipboardCheck } from 'lucide-react'
import { Role } from '../../../constants/Roles'

// ====================================================================
// --- MOCK UI COMPONENTS ---
// ====================================================================

/** @typedef {object} BadgeProps
 * @property {('success' | 'warning' | 'error' | 'default' | 'info')} color
 * @property {('sm' | 'md')} [size]
 * @property {React.ReactNode} children
 */

/** * Mock component cho Badge, bao gồm màu 'info' mới cho trạng thái Delivery
 * @param {BadgeProps} props
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Badge = ({ color, children }: any) => {
  let colorClasses = ''
  switch (color) {
    case 'success':
      colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      break
    case 'warning':
      colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      break
    case 'error':
      colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      break
    case 'info': // Màu mới cho trạng thái Delivery
      colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      break
    case 'default':
    default:
      colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300'
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {children}
    </span>
  )
}

/** @typedef {object} TableCellProps
 * @property {boolean} [isHeader]
 * @property {string} [className]
 * @property {React.ReactNode} children
 */

/** @param {TableCellProps} props */
const TableCell = ({ isHeader, className, children }: any) => {
  const baseClasses = 'text-gray-800 dark:text-white/90 text-sm table-cell align-middle'
  const headerClasses = isHeader
    ? 'text-gray-500 font-medium text-xs uppercase tracking-wider dark:text-gray-400'
    : 'text-gray-700 dark:text-gray-300 text-sm'
  const defaultPadding = 'px-5 py-3'

  return (
    <div className={`${defaultPadding} ${baseClasses} ${headerClasses} ${className || ''} text-start`}>{children}</div>
  )
}

// Mock Table Structure Components (Adjusted to use actual table display properties)
const Table = ({ children }: any) => <div className='table w-full border-collapse'>{children}</div>
const TableHeader = ({ children, className }: any) => (
  <div className={`table-header-group ${className || 'border-b border-gray-100 dark:border-white/[0.05]'}`}>
    {children}
  </div>
)
const TableBody = ({ children, className }: any) => (
  <div className={`table-row-group ${className || 'divide-y divide-gray-100 dark:divide-white/[0.05]'}`}>
    {children}
  </div>
)
const TableRow = ({ children }: any) => (
  <div className='table-row border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
    {children}
  </div>
)

// ====================================================================
// --- DỮ LIỆU VÀ GIAO DIỆN CHÍNH (MAIN LOGIC & DATA) ---
// ====================================================================

interface Order {
  id: number
  user: {
    image: string
    name: string
    role: string
  }
  projectName: string
  team: {
    images: string[]
  }
  status: string // Có thể là 'Active', 'Pending', 'Cancel', 'Delivery', 'Done'
  budget: string
}

// Define the initial table data
const initialTableData: Order[] = [
  {
    id: 1,
    user: {
      image: 'https://placehold.co/40x40/0E7490/FFFFFF?text=LC',
      name: 'Lindsey Curtis',
      role: 'Web Designer'
    },
    projectName: 'Agency Website',
    team: {
      images: [
        'https://placehold.co/24x24/1D4ED8/FFFFFF?text=A',
        'https://placehold.co/24x24/10B981/FFFFFF?text=B',
        'https://placehold.co/24x24/EF4444/FFFFFF?text=C'
      ]
    },
    budget: '3.9K',
    status: 'Active'
  },
  {
    id: 2,
    user: {
      image: 'https://placehold.co/40x40/2563EB/FFFFFF?text=KG',
      name: 'Kaiya George',
      role: 'Project Manager'
    },
    projectName: 'Technology',
    team: {
      images: ['https://placehold.co/24x24/F59E0B/FFFFFF?text=D', 'https://placehold.co/24x24/C026D3/FFFFFF?text=E']
    },
    budget: '24.9K',
    status: 'Pending'
  },
  {
    id: 3,
    user: {
      image: 'https://placehold.co/40x40/0E7490/FFFFFF?text=ZG',
      name: 'Zain Geidt',
      role: 'Content Writing'
    },
    projectName: 'Blog Writing',
    team: {
      images: ['https://placehold.co/24x24/059669/FFFFFF?text=F']
    },
    budget: '12.7K',
    status: 'Delivery' // Đơn hàng này đang được giao
  },
  {
    id: 4,
    user: {
      image: 'https://placehold.co/40x40/4F46E5/FFFFFF?text=AS',
      name: 'Abram Schleifer',
      role: 'Digital Marketer'
    },
    projectName: 'Social Media',
    team: {
      images: [
        'https://placehold.co/24x24/F97316/FFFFFF?text=G',
        'https://placehold.co/24x24/8B5CF6/FFFFFF?text=H',
        'https://placehold.co/24x24/EC4899/FFFFFF?text=I'
      ]
    },
    budget: '2.8K',
    status: 'Cancel'
  },
  {
    id: 5,
    user: {
      image: 'https://placehold.co/40x40/EAB308/FFFFFF?text=CG',
      name: 'Carla George',
      role: 'Front-end Developer'
    },
    projectName: 'Website',
    team: {
      images: [
        'https://placehold.co/24x24/F43F5E/FFFFFF?text=J',
        'https://placehold.co/24x24/6EE7B7/FFFFFF?text=K',
        'https://placehold.co/24x24/3B82F6/FFFFFF?text=L'
      ]
    },
    budget: '4.5K',
    status: 'Done' // Đơn hàng đã hoàn tất
  }
]

// Hàm lấy màu sắc và biểu tượng cho Badge trạng thái
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'Active':
      return { label: 'Active', color: 'success', icon: CheckCircle }
    case 'Pending':
      return { label: 'Pending', color: 'warning', icon: Clock }
    case 'Cancel':
      return { label: 'Cancel', color: 'error', icon: XCircle }
    case 'Delivery':
      return { label: 'Delivery', color: 'info', icon: Truck }
    case 'Done':
      return { label: 'Done', color: 'success', icon: ClipboardCheck }
    default:
      return { label: 'Unknown', color: 'default', icon: Clock }
  }
}

// Thêm vai trò người dùng
const USER_ROLES = [Role.PRODUCT_STAFF, 'Viewer', Role.ADMIN]

export default function BasicTableOrder() {
  const [orders, setOrders] = useState<Order[]>(initialTableData)
  // Mô phỏng vai trò người dùng hiện tại. Mặc định là 'Product' để thấy nút.
  const [currentUserRole, setCurrentUserRole] = useState<'Product' | 'Viewer' | 'Admin'>('Product')

  // Hàm cập nhật trạng thái đơn hàng
  const updateOrderStatus = (id: number, newStatus: string) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
  }

  const getActionButton = (order: Order) => {
    // Chỉ hiển thị nút hành động nếu người dùng có vai trò là 'Product'
    if (currentUserRole !== 'Product') {
      return <span className='text-gray-400 dark:text-gray-600 text-sm italic'>Chỉ Product</span>
    }

    switch (order.status) {
      case 'Active':
      case 'Pending':
        return (
          <button
            className='flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 transition-colors'
            onClick={() => updateOrderStatus(order.id, 'Delivery')}
          >
            <Truck className='w-4 h-4' /> Giao hàng
          </button>
        )
      case 'Delivery':
        return (
          <button
            className='flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-500 transition-colors'
            onClick={() => updateOrderStatus(order.id, 'Done')}
          >
            <ClipboardCheck className='w-4 h-4' /> Hoàn tất
          </button>
        )
      case 'Done':
      case 'Cancel':
      default:
        return <span className='text-gray-400 dark:text-gray-600 text-sm italic'>Hoàn thành</span>
    }
  }

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/[0.05] dark:bg-gray-800/80 backdrop-blur-sm'>
      <div className='p-5 border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Danh Sách Đơn Hàng / Dự Án</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Quản lý trạng thái đơn hàng trong thời gian thực.</p>
        </div>

        {/* Dropdown để mô phỏng thay đổi vai trò người dùng */}
        <div className='flex items-center gap-2'>
          <label htmlFor='userRole' className='text-sm font-medium text-gray-600 dark:text-gray-300'>
            Vai trò:
          </label>
          <select
            id='userRole'
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value as 'Product' | 'Viewer' | 'Admin')}
            className='px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500'
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto'>
        <Table>
          {/* Table Header */}
          <TableHeader className='border-b border-gray-100 dark:border-white/[0.05]'>
            <TableRow>
              <TableCell isHeader className='w-3/12'>
                User
              </TableCell>
              <TableCell isHeader className='w-3/12'>
                Project Name
              </TableCell>
              <TableCell isHeader className='w-2/12'>
                Team
              </TableCell>
              <TableCell isHeader className='w-2/12'>
                Status
              </TableCell>
              <TableCell isHeader className='w-1/12'>
                Budget
              </TableCell>
              <TableCell isHeader className='w-1/12 text-end'>
                Action
              </TableCell>{' '}
              {/* Cột mới */}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status)

              return (
                <TableRow key={order.id}>
                  {/* User */}
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 overflow-hidden rounded-full'>
                        {/* Thay thế image path bằng placeholder URL */}
                        <img
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                          className='object-cover w-full h-full'
                        />
                      </div>
                      <div>
                        <span className='block font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                          {order.user.name}
                        </span>
                        <span className='block text-gray-500 text-xs dark:text-gray-400'>{order.user.role}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Project Name */}
                  <TableCell className='text-gray-600 dark:text-gray-300 font-medium'>{order.projectName}</TableCell>

                  {/* Team */}
                  <TableCell>
                    <div className='flex -space-x-2'>
                      {order.team.images.map((teamImage, index) => (
                        <div
                          key={index}
                          className='w-7 h-7 overflow-hidden border-2 border-white rounded-full dark:border-gray-800 shadow-sm'
                        >
                          {/* Thay thế image path bằng placeholder URL */}
                          <img
                            width={28}
                            height={28}
                            src={teamImage}
                            alt={`Team member ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge color={statusDisplay.color}>
                      <statusDisplay.icon className='w-3 h-3 mr-1' />
                      {statusDisplay.label}
                    </Badge>
                  </TableCell>

                  {/* Budget */}
                  <TableCell className='text-gray-800 dark:text-white font-semibold'>${order.budget}</TableCell>

                  {/* Action (Hành Động) */}
                  <TableCell className='text-end pr-6'>{getActionButton(order)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
