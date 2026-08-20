import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
  field: 'password' | 'confirmPassword';
  label: string;
  placeholder: string;
  autoComplete: 'new-password' | 'current-password';
}

export function PasswordField({
  form,
  field,
  label,
  placeholder,
  autoComplete,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={field}>{label}</label>
      <div className="password-input">
        <input
          id={field}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...form.register(field)}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      <FormError message={form.formState.errors[field]?.message} />
    </div>
  );
}
