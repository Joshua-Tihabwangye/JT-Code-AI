import { UserRound } from 'lucide-react'
import { useState } from 'react'

interface NameFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  autoComplete?: string
  error?: string
}

export default function NameField({
  id,
  label,
  value,
  placeholder,
  onChange,
  autoComplete,
  error,
}: NameFieldProps) {
  const [hasValue, setHasValue] = useState(value.length > 0)

  return (
    <div className="field-group">
      <div className={`input-wrapper ${hasValue ? 'input-wrapper--has-value' : ''} ${error ? 'input-wrapper--error' : ''}`}>
        <UserRound size={18} className="input-wrapper__icon" />
        <span className="input-wrapper__label">{label}</span>
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            onChange(event.target.value)
            setHasValue(event.target.value.length > 0)
          }}
          autoComplete={autoComplete}
          required
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}