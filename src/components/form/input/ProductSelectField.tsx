import Label from '../Label'
import Select from '../Select'

// 1. Interface cho Option
interface SelectOption {
  value: string | number
  label: string
}

// 2. Interface cho Props
interface ProductSelectProps {
  label: string
  id: string
  options?: SelectOption[]
  placeholder?: string
  value?: string | number
  onChange?: (value: string | number) => void
}

// 3. Component tái sử dụng
export default function ProductSelectField({
  label,
  id,
  options = [],
  placeholder = 'Chọn một tùy chọn',

  onChange
}: ProductSelectProps) {
  const handleChange = (selectedValue: string | number) => {
    onChange?.(selectedValue)
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        options={options} // ✅ Truyền đúng kiểu dữ liệu
        placeholder={placeholder}
        onChange={handleChange}
        className='dark:bg-dark-900'
      />
    </div>
  )
}
