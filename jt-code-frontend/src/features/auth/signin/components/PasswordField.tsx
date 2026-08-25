import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignInSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignInSchema>;
}

export function PasswordField({ form }: Props) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="form-field">
      <label htmlFor="password">{t('signin.passwordLabel')}</label>
      <div className="password-input">
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={t('signin.passwordPlaceholder')}
          {...form.register('password')}
        />
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
      </div>
      <FormError
        message={
          form.formState.errors.password?.message
            ? t(form.formState.errors.password.message)
            : undefined
        }
      />
    </div>
  );
}
