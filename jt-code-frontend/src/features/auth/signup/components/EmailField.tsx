import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function EmailField({ form }: Props) {
  const { t } = useTranslation();
  return (
    <div className="form-field">
      <Input
        id="email"
        label={t('signup.emailLabel')}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={16} aria-hidden />}
        {...form.register('email')}
        error={
          form.formState.errors.email?.message
            ? t(form.formState.errors.email.message)
            : undefined
        }
      />
    </div>
  );
}
