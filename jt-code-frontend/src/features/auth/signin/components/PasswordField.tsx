import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { SignInSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignInSchema>;
}

export function PasswordField({ form }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor="password">Password</label>
      <div className="password-input">
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          {...form.register('password')}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      <FormError message={form.formState.errors.password?.message} />
    </div>
  );
}
