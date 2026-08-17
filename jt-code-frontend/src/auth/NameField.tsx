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
      <label htmlFor={id} className="field-label">{label}</label>
      <div className={`input-wrapper ${hasValue ? 'input-wrapper--has-value' : ''} ${error ? 'input-wrapper--error' : ''}`}>
        <UserRound size={18} className="input-wrapper__icon" />
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
          aria-invalid={error ? true : undefined}
          required
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
