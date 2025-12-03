// components/dashboard/RevenueChart.tsx

import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Dữ liệu mẫu (Mock data) cho biểu đồ
interface MonthlyRevenue {
  month: string
  revenue: number
}

interface RevenueChartProps {
  data: MonthlyRevenue[]
  isLoading: boolean
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  // Chuẩn bị dữ liệu cho Chart.js
  const chartData: ChartData<'line'> = {
    labels: data.map((item) => item.month), // Ví dụ: ['Jan', 'Feb', 'Mar', ...]
    datasets: [
      {
        label: 'Tổng Doanh Thu (USD)',
        data: data.map((item) => item.revenue),
        borderColor: 'rgba(99, 102, 241, 1)', // Màu Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3, // Độ cong của đường
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  // Tùy chọn cấu hình biểu đồ
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af' // Màu chữ legend
        }
      },
      title: {
        display: false,
        text: 'Doanh thu theo tháng'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // Màu nền tooltip
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)' // Màu lưới x
        },
        ticks: {
          color: '#9ca3af' // Màu chữ trục x
        }
      },
      y: {
        min: 0,
        grid: {
          color: 'rgba(55, 65, 81, 0.3)' // Màu lưới y
        },
        ticks: {
          color: '#9ca3af', // Màu chữ trục y
          callback: function (value: string | number) {
            return '$' + new Intl.NumberFormat('en-US').format(value as number)
          }
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className='h-full flex items-center justify-center text-gray-500 dark:text-gray-300'>
        Đang tải biểu đồ...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='h-full flex items-center justify-center text-gray-500 dark:text-gray-300'>
        Không có dữ liệu doanh thu để hiển thị.
      </div>
    )
  }

  return (
    <div className='w-full h-full'>
      <Line data={chartData} options={options} />
    </div>
  )
}

export default RevenueChart
