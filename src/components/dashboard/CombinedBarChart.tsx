/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatVND } from '../../utils/validForm'

interface ChartData {
  name: string
  value: number
  color: string
  isCurrency: boolean
}

interface CombinedBarChartProps {
  title: string // Thêm dòng này để truyền tiêu đề
  data: ChartData[]
  selectedMonth: number
  selectedYear: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    const formattedValue = item.isCurrency ? formatVND(item.value) : item.value.toLocaleString('vi-VN')

    return (
      <div className='p-2 bg-white border border-gray-300 rounded shadow-md dark:bg-gray-700 dark:border-gray-600'>
        <p className='font-semibold text-gray-800 dark:text-white'>{label}</p>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Value: <span className='font-bold text-blue-600 dark:text-blue-400'>{formattedValue}</span>
        </p>
      </div>
    )
  }
  return null
}

const CombinedBarChart: React.FC<CombinedBarChartProps> = ({ title, data, selectedMonth, selectedYear }) => {
  const isRevenuePresent = data.some((d) => d.isCurrency)

  // Hàm để định dạng con số hiển thị dưới trục X
  const xAxisFormatter = (value: number) => {
    if (isRevenuePresent) {
      // Nếu là tiền tệ, hiển thị rút gọn (ví dụ 1.000.000 -> 1M) hoặc giữ nguyên formatVND
      return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString('vi-VN')
    }
    return value.toLocaleString('vi-VN') // Số lượng bình thường
  }

  return (
    <div className='h-96 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/80 shadow-md'>
      <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
        {title} for {selectedMonth}/{selectedYear}
      </h3>
      <ResponsiveContainer width='100%' height='85%'>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }} layout='vertical'>
          <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' horizontal={false} />

          {/* BỎ 'hide' VÀ THÊM CẤU HÌNH Ở ĐÂY */}
          <XAxis
            type='number'
            tickFormatter={xAxisFormatter}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            stroke='#e0e0e0'
          />

          <YAxis dataKey='name' type='category' tick={{ fill: '#6b7280', fontSize: 12 }} width={120} />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

          <Bar dataKey='value' radius={[0, 4, 4, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
export default CombinedBarChart
