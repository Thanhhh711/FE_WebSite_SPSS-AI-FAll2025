// File: src/components/form/form-elements/ProductTextAreaField.tsx

import React from 'react'
import Label from '../Label' // Component Label của bạn
import TextArea from './TextArea' // Component TextArea cơ bản của bạn

// 1. Định nghĩa Interface/Type cho Props
interface ProductTextAreaProps {
  label: string
  id: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number // Số hàng mặc định là 6 nếu không truyền
}

// 2. Định nghĩa Component Function Tái Sử Dụng
export default function ProductTextAreaField({
  label,
  id,
  placeholder = '',
  value,
  onChange,
  rows = 6
}: ProductTextAreaProps) {
  // Dùng handle internal change để khớp với props 'value' (string) mà bạn đang dùng trong demo
  //   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //     if (onChange) {
  //       onChange(e.target.value)
  //     }
  //   }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {/* Component TextArea cơ bản */}
      <TextArea
        value={value}
        onChange={(value) => onChange?.(value)} // Giữ type string
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}
