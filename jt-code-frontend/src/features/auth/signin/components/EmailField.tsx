import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignInSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignInSchema>;
}

export function EmailField({ form }: Props) {
  const { t } = useTranslation();
  return (
    <div className="form-field">
      <label htmlFor="email">{t('signin.emailLabel')}</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder={t('signin.emailPlaceholder')}
        {...form.register('email')}
      />
      <FormError
        message={
          form.formState.errors.email?.message
            ? t(form.formState.errors.email.message)
            : undefined
        }
      />
    </div>
  );
}
