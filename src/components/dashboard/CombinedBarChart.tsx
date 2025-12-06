/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatVND } from '../../utils/validForm'

interface ChartData {
  name: string
  value: number
  color: string
  isCurrency: boolean
}

interface CombinedBarChartProps {
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

const CombinedBarChart: React.FC<CombinedBarChartProps> = ({ data, selectedMonth, selectedYear }) => {
  const isRevenuePresent = data.some((d) => d.isCurrency)

  const yAxisFormatter = (value: number) => {
    return isRevenuePresent ? formatVND(value) : value.toLocaleString('vi-VN')
  }

  return (
    <div className='h-96 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/80 shadow-md'>
      <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
        Overview of metrics for {selectedMonth}/{selectedYear}
      </h3>
      <ResponsiveContainer width='100%' height='85%'>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout='vertical'>
          <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' horizontal={false} />
          <XAxis type='number' stroke='#6b7280' tickFormatter={yAxisFormatter} />
          <YAxis dataKey='name' type='category' stroke='#6b7280' width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar dataKey='value' name='Current value' fill='#3b82f6' maxBarSize={30}></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CombinedBarChart
