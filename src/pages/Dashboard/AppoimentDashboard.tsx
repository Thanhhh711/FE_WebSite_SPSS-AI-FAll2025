/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import moment, { Moment } from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppointmentDashboard } from '../../types/appoinment.type'

import { appointmentApi } from '../../api/appointment.api'
import userApi from '../../api/user.api'
import { User } from '../../types/user.type'
import { formatDateToDDMMYYYY, formatVND } from '../../utils/validForm'

// Định nghĩa lại ChartDataItem interface
interface ChartDataItem {
  date: string
  count: number
}

const useGlobalThemeDetector = () => {
  if (typeof document === 'undefined') {
    return false
  }
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'))
        }
      })
    })

    // Lắng nghe thay đổi attribute 'class' trên thẻ <html>
    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return isDark
}

// Định nghĩa một component đơn giản để hiển thị thông tin thống kê
const StatisticCard: React.FC<{
  title: string
  value: number | string
  suffix?: string
  color: string
  theme: any // Thêm prop theme
}> = ({ title, value, suffix, color, theme }) => (
  <div
    style={{
      backgroundColor: theme.cardBackground, // Áp dụng màu nền thẻ
      padding: '20px',
      borderRadius: '8px',
      borderLeft: `5px solid ${color}`,
      height: '100%',
      border: `1px solid ${theme.border}` // Thêm border mảnh
    }}
  >
    <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>{title}</div>
    <div
      style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: color,
        lineHeight: 1
      }}
    >
      {value}
      <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 'normal' }}>{suffix}</span>
    </div>
  </div>
)

// Component đơn giản để hiển thị thông báo lỗi
const ErrorMessage: React.FC<{ message: string | null; theme: any }> = ({ message, theme }) => {
  if (!message) return null
  return (
    <div
      style={{
        padding: '10px',
        backgroundColor: theme.errorBackground,
        color: theme.errorText,
        border: `1px solid ${theme.errorBorder}`,
        borderRadius: '4px',
        marginBottom: '20px',
        fontWeight: '500'
      }}
    >
      {message}
    </div>
  )
}

export default function AppoimentDashboard() {
  const isDark = useGlobalThemeDetector() // Phát hiện theme toàn cục

  const [loading, setLoading] = useState(false)
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [data, setData] = useState<AppointmentDashboard | null>(null)
  const [advisors, setAdvisors] = useState<User[]>([])
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<[Moment, Moment]>([moment().subtract(7, 'days'), moment()])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Định nghĩa các biến màu dựa trên trạng thái Dark Mode được phát hiện (Đã điều chỉnh màu)
  const themeColors = useMemo(
    () => ({
      // Màu nền chính: Tailwind bg-gray-900 (#111827)
      background: isDark ? '#111827' : '#f0f2f5',
      // Màu nền thẻ: Tailwind bg-gray-800 (#1f2937)
      cardBackground: isDark ? '#1f2937' : '#ffffff',
      textPrimary: isDark ? '#ffffff' : '#001529',
      textSecondary: isDark ? '#d1d5db' : '#666',
      // Border/Grid: Tailwind gray-700 (#374151)
      border: isDark ? '#374151' : '#e8e8e8',
      // Nền input: Tailwind gray-700 (#374151)
      inputBackground: isDark ? '#374151' : '#fff',
      // Border input: Tailwind gray-600 (#4b5563)
      inputBorder: isDark ? '#4b5563' : '#ccc',
      errorBackground: isDark ? '#450a0a' : '#ffdddd',
      errorText: isDark ? '#fca5a5' : '#d8000c',
      errorBorder: isDark ? '#7f1d1d' : '#d8000c',
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
    }),
    [isDark]
  )

  // Hàm thay thế message.error của Antd
  const showErrorMessage = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 5000) // Tự động ẩn sau 5s
  }

  // Hàm gọi API Lấy danh sách Beauty Advisor (Giữ nguyên)
  useEffect(() => {
    const fetchAdvisors = async () => {
      setAdvisorLoading(true)
      try {
        const response = await userApi.getBeatyAdvisor()
        setAdvisors(response.data.data as User[])
      } catch (error) {
        showErrorMessage('Failed to fetch Beauty Advisors list.')
        console.error('Fetch Advisor Error:', error)
      } finally {
        setAdvisorLoading(false)
      }
    }
    fetchAdvisors()
  }, [])

  // Hàm gọi API Lấy dữ liệu Dashboard (Giữ nguyên)
  const fetchData = useCallback(async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setData(null)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const startDate = dateRange[0].format('YYYY-MM-DD')
      const endDate = dateRange[1].format('YYYY-MM-DD')

      const response = await appointmentApi.getAppoinmentByStaticsDateRange(startDate, endDate, selectedAdvisor)
      setData(response.data.data)
    } catch (error) {
      showErrorMessage('Failed to fetch Dashboard data.')
      console.error('Fetch Dashboard Error:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange, selectedAdvisor])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Chuẩn bị dữ liệu cho biểu đồ (Giữ nguyên)
  const chartData: ChartDataItem[] = data?.appointmentsByDate
    ? Object.entries(data.appointmentsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
    : []

  // Xử lý thay đổi phạm vi ngày (Giữ nguyên)
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const newDate = moment(value, 'YYYY-MM-DD')
    let newDateRange: [Moment, Moment] = [...dateRange]

    if (type === 'start') {
      newDateRange[0] = newDate
    } else {
      newDateRange[1] = newDate
    }

    // Đảm bảo ngày bắt đầu <= ngày kết thúc
    if (newDateRange[0].isAfter(newDateRange[1])) {
      showErrorMessage('Start date cannot be later than end date. Please select a valid range.')
      return
    }
    setDateRange(newDateRange)
  }

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: themeColors.background, // Áp dụng màu nền chính: #111827 (Dark)
        minHeight: '100vh',
        color: themeColors.textPrimary // Màu chữ mặc định
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            margin: 0,
            color: themeColors.textPrimary, // Áp dụng màu chữ chính
            fontSize: '32px',
            fontWeight: '700'
          }}
        >
          Appointment Management Dashboard
        </h1>
      </div>

      <div style={{ borderBottom: `1px solid ${themeColors.border}`, margin: '0 0 24px 0' }} />
      <ErrorMessage message={errorMessage} theme={themeColors} />

      {/* Filter Section */}
      <div
        style={{
          backgroundColor: themeColors.cardBackground, // Áp dụng màu nền thẻ: #1f2937 (Dark)
          padding: '20px',
          borderRadius: '8px',
          boxShadow: `0 2px 4px ${themeColors.shadowColor}`,
          marginBottom: '24px',
          border: `1px solid ${themeColors.border}`
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: themeColors.textPrimary, // Áp dụng màu chữ chính
            fontSize: '18px',
            marginBottom: '15px',
            fontWeight: '600'
          }}
        >
          Data Filter
        </h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Beauty Advisor Select */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 'bold', color: themeColors.textSecondary }}>
              Beauty Advisor:
            </span>
            <select
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${themeColors.inputBorder}`,
                width: '250px',
                backgroundColor: themeColors.inputBackground,
                color: themeColors.textPrimary
              }}
              value={selectedAdvisor || ''}
              onChange={(e) => setSelectedAdvisor(e.target.value || undefined)}
              disabled={advisorLoading}
            >
              {/* Thẻ option cần có nền động để phù hợp Dark Mode */}
              <option style={{ backgroundColor: themeColors.cardBackground, color: themeColors.textPrimary }} value=''>
                Select or leave empty for all
              </option>
              {advisors.map((advisor) => (
                <option
                  style={{ backgroundColor: themeColors.cardBackground, color: themeColors.textPrimary }}
                  key={advisor.userId}
                  value={advisor.userId}
                >
                  {`${advisor.lastName || ''} ${advisor.firstName || ''} (${advisor.userName})`}
                </option>
              ))}
            </select>
            {advisorLoading && <span style={{ marginLeft: '10px', color: themeColors.textSecondary }}>Loading...</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 'bold', color: themeColors.textSecondary }}>
              Date Range:
            </span>
            <input
              type='date'
              value={dateRange[0].format('YYYY-MM-DD')}
              onChange={(e) => handleDateChange('start', e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${themeColors.inputBorder}`,
                backgroundColor: themeColors.inputBackground,
                color: themeColors.textPrimary
              }}
            />
            <span style={{ margin: '0 10px', color: themeColors.textSecondary }}>to</span>
            <input
              type='date'
              value={dateRange[1].format('YYYY-MM-DD')}
              onChange={(e) => handleDateChange('end', e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${themeColors.inputBorder}`,
                backgroundColor: themeColors.inputBackground,
                color: themeColors.textPrimary
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            fontSize: '18px',
            color: themeColors.textPrimary
          }}
        >
          Loading dashboard data...
        </div>
      )}

      {!loading && data ? (
        <>
          {/* Statistics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}
          >
            {/* Total Revenue */}
            <StatisticCard
              theme={themeColors}
              title='Total Revenue'
              value={formatVND(data.totalRevenue)}
              color='#3f8600'
            />

            {/* Total Appointments */}
            <StatisticCard
              theme={themeColors}
              title='Total Appointments'
              value={data.totalAppointments}
              suffix=' Appointments'
              color='#1890ff'
            />

            {/* Completed */}
            <StatisticCard
              theme={themeColors}
              title='Completed'
              value={data.completedAppointments}
              suffix={`/${data.totalAppointments}`}
              color='#0055ff'
            />

            {/* Cancelled */}
            <StatisticCard
              theme={themeColors}
              title='Cancelled'
              value={data.cancelledAppointments}
              suffix={`/${data.totalAppointments}`}
              color='#cf1322'
            />

            {/* Pending */}
            <StatisticCard
              theme={themeColors}
              title='Pending'
              value={data.pendingAppointments}
              suffix={`/${data.totalAppointments}`}
              color='#faad14'
            />

            {/* Confirmed */}
            <StatisticCard
              theme={themeColors}
              title='Confirmed'
              value={data.confirmedAppointments}
              suffix={`/${data.totalAppointments}`}
              color='#52c41a'
            />
          </div>

          {/* Appointment Trend Chart */}
          <div
            style={{
              backgroundColor: themeColors.cardBackground, // Áp dụng màu nền thẻ
              padding: '20px',
              borderRadius: '8px',
              boxShadow: `0 2px 4px ${themeColors.shadowColor}`,
              border: `1px solid ${themeColors.border}`
            }}
          >
            <h3 style={{ marginTop: 0, color: themeColors.textPrimary }}>Appointment Count by Date</h3>
            <div style={{ height: 400, padding: '20px 0' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    {/* Cập nhật màu lưới và trục */}
                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={themeColors.border} />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(date) => formatDateToDDMMYYYY(date)}
                      stroke={themeColors.textSecondary}
                    />
                    <YAxis allowDecimals={false} stroke={themeColors.textSecondary} />
                    {/* Cập nhật màu nền và border cho Tooltip */}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.cardBackground,
                        border: `1px solid ${themeColors.border}`,
                        color: themeColors.textPrimary
                      }}
                    />
                    <Legend />
                    <Bar dataKey='count' fill='#1890ff' name='Number of Appointments' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    paddingTop: 100,
                    color: themeColors.textSecondary
                  }}
                >
                  No appointment data found for this date range.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Hiển thị thông báo chung khi không có dữ liệu và không loading
        !loading && (
          <div
            style={{
              backgroundColor: themeColors.cardBackground,
              textAlign: 'center',
              padding: '50px',
              borderRadius: '8px',
              boxShadow: `0 2px 4px ${themeColors.shadowColor}`,
              border: `1px solid ${themeColors.border}`
            }}
          >
            <p style={{ fontSize: '16px', color: themeColors.textSecondary }}>
              Please select a date range and a Beauty Advisor (if required) to view the Dashboard data.
            </p>
          </div>
        )
      )}
    </div>
  )
}
