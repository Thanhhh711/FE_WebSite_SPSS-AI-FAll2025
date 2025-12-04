/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/CombinedBarChart.tsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatVND } from '../../utils/validForm'

interface ChartData {
  name: string // Tên metric (ví dụ: 'Total Revenue')
  value: number // Giá trị hiện tại
  color: string // Màu sắc của cột
  isCurrency: boolean // Đánh dấu để biết có phải là tiền tệ không
}

interface CombinedBarChartProps {
  data: ChartData[]
  selectedMonth: number
  selectedYear: number
}

// Custom Tooltip để hiển thị định dạng tiền tệ
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    // Kiểm tra xem metric có phải là tiền tệ không
    const formattedValue = item.isCurrency ? formatVND(item.value) : item.value.toLocaleString('vi-VN') // Dùng toLocaleString cho số lượng

    return (
      <div className='p-2 bg-white border border-gray-300 rounded shadow-md dark:bg-gray-700 dark:border-gray-600'>
        <p className='font-semibold text-gray-800 dark:text-white'>{label}</p>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Giá trị: <span className='font-bold text-blue-600 dark:text-blue-400'>{formattedValue}</span>
        </p>
      </div>
    )
  }
  return null
}

const CombinedBarChart: React.FC<CombinedBarChartProps> = ({ data, selectedMonth, selectedYear }) => {
  const isRevenuePresent = data.some((d) => d.isCurrency)

  // Formatter cho trục X (Giá trị)
  const yAxisFormatter = (value: number) => {
    // Nếu có Doanh thu (tiền tệ), dùng định dạng tiền tệ rút gọn cho trục
    return isRevenuePresent ? formatVND(value) : value.toLocaleString('vi-VN')
  }

  return (
    <div className='h-96 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/80 shadow-md'>
      <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
        Tổng quan các chỉ số tháng {selectedMonth}/{selectedYear}
      </h3>
      <ResponsiveContainer width='100%' height='85%'>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout='vertical' // Biểu đồ cột ngang
        >
          {/* Lưới ngang (horizontal) không cần vì là biểu đồ cột ngang */}
          <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' horizontal={false} />

          {/* Trục X là Giá trị (Number), Trục Y là Tên Metric (Category) */}
          <XAxis
            type='number'
            stroke='#6b7280'
            tickFormatter={yAxisFormatter} // Định dạng trục X theo tiền tệ hoặc số lượng
          />
          <YAxis dataKey='name' type='category' stroke='#6b7280' width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Cột chính, sử dụng màu riêng cho từng Bar */}
          <Bar dataKey='value' name='Giá trị hiện tại' fill='#3b82f6' maxBarSize={30}>
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CombinedBarChart
