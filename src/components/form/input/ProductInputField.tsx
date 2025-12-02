/* eslint-disable @typescript-eslint/no-unused-vars */
// File: src/components/form/form-elements/ProductInputField.tsx

import React from 'react'
import Label from '../Label' // Đường dẫn đến component Label của bạn
import Input from '../input/InputField' // Đường dẫn đến component Input của bạn

// 1. Định nghĩa Interface/Type cho Props
// Các thuộc tính cơ bản cho một input field
interface ProductInputFieldProps {
  label: string
  id: string
  type: string
  placeholder?: string // Tùy chọn
  value?: string | number // Tùy chọn (dùng cho state)
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void // Tùy chọn
  rows?: number // Dùng cho TextArea (nếu bạn muốn gộp)
  isTextArea?: boolean // Tùy chọn để xác định có phải là TextArea không
}

// 2. Định nghĩa Component Function
export default function ProductInputField({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  isTextArea = false
}: ProductInputFieldProps) {
  // Bạn có thể thêm logic render TextArea ở đây nếu muốn gộp
  if (isTextArea) {
    // Nếu bạn có component TextArea riêng, hãy dùng nó ở đây
    // Ví dụ: return <TextAreaInput ... />
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {/* Input Field cơ bản */}
      <Input type={type} id={id} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

// **Lưu ý:** Đối với Select (BrandId, ProductStatusId) và TextArea,
// bạn nên sử dụng các component riêng của bạn (`SelectInputs`, `TextAreaInput`)
// và định nghĩa props cho chúng tương tự.
