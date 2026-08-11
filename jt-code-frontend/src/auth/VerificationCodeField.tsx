import { Mail } from 'lucide-react'
import { useState } from 'react'

interface VerificationCodeFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  autoComplete?: string
  error?: string
}

export default function VerificationCodeField({
  id,
  label,
  value,
  placeholder,
  onChange,
  autoComplete,
  error,
}: VerificationCodeFieldProps) {
  const [hasValue, setHasValue] = useState(value.length > 0)

  return (
    <div className="field-group">
      <div className={`input-wrapper ${hasValue ? 'input-wrapper--has-value' : ''} ${error ? 'input-wrapper--error' : ''}`}>
        <Mail size={18} className="input-wrapper__icon" />
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
          inputMode="numeric"
          autoComplete={autoComplete}
          required
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}