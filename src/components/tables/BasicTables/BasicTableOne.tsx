// src/components/BasicTableOne.tsx

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table' // Thay đổi path tùy theo cấu trúc thư mục thực tế của bạn
import Badge from '../../ui/badge/Badge' // Thay đổi path
import ActionModal, { Button, Order } from '../../ActionModal'

// Dùng mock Button cho Action Cell

// ---

// src/data/tableData.ts

export const initialTableData: Order[] = [
  {
    id: 1,
    user: {
      image: '/images/user/user-17.jpg',
      name: 'Lindsey Curtis',
      role: 'Web Designer'
    },
    projectName: 'Agency Website',
    team: {
      images: ['/images/user/user-22.jpg', '/images/user/user-23.jpg', '/images/user/user-24.jpg']
    },
    budget: '3.9K',
    status: 'Active',
    isBanned: false
  },
  {
    id: 2,
    user: {
      image: '/images/user/user-18.jpg',
      name: 'Kaiya George',
      role: 'Project Manager'
    },
    projectName: 'Technology',
    team: {
      images: ['/images/user/user-25.jpg', '/images/user/user-26.jpg']
    },
    budget: '24.9K',
    status: 'Pending',
    isBanned: true,
    reason: 'Late delivery of first milestone.'
  },
  {
    id: 3,
    user: {
      image: '/images/user/user-17.jpg',
      name: 'Zain Geidt',
      role: 'Content Writing'
    },
    projectName: 'Blog Writing',
    team: {
      images: ['/images/user/user-27.jpg']
    },
    budget: '12.7K',
    status: 'Active',
    isBanned: false
  },
  {
    id: 4,
    user: {
      image: '/images/user/user-20.jpg',
      name: 'Abram Schleifer',
      role: 'Digital Marketer'
    },
    projectName: 'Social Media',
    team: {
      images: ['/images/user/user-28.jpg', '/images/user/user-29.jpg', '/images/user/user-30.jpg']
    },
    budget: '2.8K',
    status: 'Cancel',
    isBanned: false
  },
  {
    id: 5,
    user: {
      image: '/images/user/user-21.jpg',
      name: 'Carla George',
      role: 'Front-end Developer'
    },
    projectName: 'Website',
    team: {
      images: ['/images/user/user-31.jpg', '/images/user/user-32.jpg', '/images/user/user-33.jpg']
    },
    budget: '4.5K',
    status: 'Active',
    isBanned: false
  }
]

// Function to determine the badge color
const getStatusColor = (status: string, isBanned: boolean) => {
  if (isBanned) return 'error'
  switch (status) {
    case 'Active':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Cancel':
      return 'error'
    default:
      return 'info'
  }
}

export default function BasicTableOne() {
  const [tableData, setTableData] = useState<Order[]>(initialTableData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<Order | null>(null)

  // Mở modal và thiết lập dữ liệu cho order được chọn
  const handleActionClick = (order: Order) => {
    setModalData(order)
    setIsModalOpen(true)
  }

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalData(null)
  }

  // Logic xử lý Ban/Unban từ Modal
  const handleConfirmAction = (orderId: number, reason: string, isBanning: boolean) => {
    setTableData((prevData) =>
      prevData.map((order) => {
        if (order.id === orderId) {
          const newStatus = isBanning ? 'Banned' : order.status === 'Banned' ? 'Active' : order.status
          return {
            ...order,
            isBanned: isBanning,
            reason: isBanning ? reason : '', // Xóa lý do khi Unban
            status: newStatus
          }
        }
        return order
      })
    )
  }

  return (
    <>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05]'>
              <TableRow>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Team
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Budget
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Reason
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400'
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
              {tableData.map((order) => (
                <TableRow key={order.id} className={order.isBanned ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                  <TableCell className='px-5 py-4 sm:px-6 text-start'>
                    {/* User Info Block */}
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 overflow-hidden rounded-full'>
                        <img width={40} height={40} src={order.user.image} alt={order.user.name} />
                      </div>
                      <div>
                        <span className='block font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                          {order.user.name}
                        </span>
                        <span className='block text-gray-500 text-theme-xs dark:text-gray-400'>{order.user.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                    {order.projectName}
                  </TableCell>
                  <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                    {/* Team Avatars */}
                    <div className='flex -space-x-2'>
                      {order.team.images.map((teamImage, index) => (
                        <div
                          key={index}
                          className='w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900'
                        >
                          <img
                            width={24}
                            height={24}
                            src={teamImage}
                            alt={`Team member ${index + 1}`}
                            className='w-full size-6'
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-3 text-start'>
                    <Badge size='sm' color={getStatusColor(order.status, order.isBanned)}>
                      {order.isBanned ? 'Banned' : order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {order.budget}
                  </TableCell>
                  <TableCell className='px-4 py-3 text-start max-w-xs whitespace-normal text-gray-500 text-theme-sm dark:text-gray-400'>
                    {order.reason || (order.isBanned ? 'No reason provided' : '—')}
                  </TableCell>
                  <TableCell className='px-4 py-3 text-end'>
                    <Button onClick={() => handleActionClick(order)} color={order.isBanned ? 'success' : 'danger'}>
                      {order.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Render the Action Modal */}
      <ActionModal isOpen={isModalOpen} onClose={handleCloseModal} order={modalData} onConfirm={handleConfirmAction} />
    </>
  )
}
