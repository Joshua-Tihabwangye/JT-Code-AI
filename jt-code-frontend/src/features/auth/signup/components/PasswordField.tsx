import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
  field: 'password' | 'confirmPassword';
  label: string;
  placeholder: string;
  autoComplete: 'new-password' | 'current-password';
  helper?: ReactNode;
}

export function PasswordField({
  form,
  field,
  label,
  placeholder,
  autoComplete,
  helper,
}: Props) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const errorMessage = form.formState.errors[field]?.message;

  return (
    <div className="form-field">
      <Input
        id={field}
        label={label}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        leftIcon={<Lock size={16} aria-hidden />}
        rightIcon={(
          <button
            type="button"
            className="password-toggle"
            aria-label={visible ? t('common.hide') : t('common.show')}
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{visible ? t('common.hide') : t('common.show')}</span>
          </button>
        )}
        {...form.register(field)}
        error={errorMessage ? t(errorMessage) : undefined}
      />
      {helper && <div className="field-help">{helper}</div>}
    </div>
  );
}
