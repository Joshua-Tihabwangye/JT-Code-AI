import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  autoComplete?: string
  error?: string
}

export default function PasswordField({
  id,
  label,
  value,
  placeholder,
  onChange,
  autoComplete,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className={`input-shell ${error ? 'input-shell--error' : ''}`}>
        <LockKeyhole size={18} className="input-shell__icon" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
