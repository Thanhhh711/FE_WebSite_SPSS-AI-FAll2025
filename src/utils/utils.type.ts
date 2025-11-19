export interface SuccessResponse<Data> {
  message: string
  data: Data
}

export interface ErrorResponse<Data> {
  message: string
  errors?: Data
}

export const formatDateValue = (dateString: string | undefined): string => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

export const formatDateToDDMMYYYY = (isoDateString: string | undefined): string => {
  const yyyyMmDd = formatDateValue(isoDateString) // Lấy YYYY-MM-DD
  if (!yyyyMmDd) return ''

  const parts = yyyyMmDd.split('-') // Tách [YYYY, MM, DD]

  // Đảo ngược và nối lại: DD/MM/YYYY
  // parts[2] = DD, parts[1] = MM, parts[0] = YYYY
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
