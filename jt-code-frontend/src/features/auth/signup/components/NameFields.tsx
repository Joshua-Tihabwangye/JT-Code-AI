import { UserRound, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function NameFields({ form }: Props) {
  const { t } = useTranslation();
  const tError = (message?: string) => (message ? t(message) : undefined);

  return (
    <div className="signup-grid signup-grid--two">
      <div className="form-field">
        <Input
          id="firstName"
          label={t('signup.firstNameLabel')}
          autoComplete="given-name"
          placeholder={t('signup.firstNameLabel')}
          leftIcon={<User size={16} aria-hidden />}
          {...form.register('firstName')}
          error={tError(form.formState.errors.firstName?.message)}
        />
      </div>

      <div className="form-field">
        <Input
          id="lastName"
          label={t('signup.lastNameLabel')}
          autoComplete="family-name"
          placeholder={t('signup.lastNameLabel')}
          leftIcon={<UserRound size={16} aria-hidden />}
          {...form.register('lastName')}
          error={tError(form.formState.errors.lastName?.message)}
        />
      </div>
    </div>
  );
}
