import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CountryCode } from 'libphonenumber-js';
import { Phone } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { formatPhoneNumberForCountry } from '../../lib/phone';
import { getCountryMetadata } from '../../lib/countryMetadata';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function PhoneField({ form }: Props) {
  const { t } = useTranslation();
  const countryCode = form.watch('countryCode');
  const dialCode = form.watch('dialCode');
  const country = getCountryMetadata(countryCode) ?? undefined;
  const placeholder = useMemo(
    () => country?.phonePlaceholder ?? t('signup.phone.defaultPlaceholder'),
    [country, t],
  );
  const contactField = form.register('contact');

  return (
    <div className="form-field">
      <label htmlFor="contact">{t('signup.phone.label')}</label>
      <div className="phone-row">
        <div className="phone-row__dial">{dialCode}</div>
        <Input
          id="contact"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={placeholder}
          leftIcon={<Phone size={16} aria-hidden />}
          {...contactField}
          onBlur={(event) => {
            contactField.onBlur(event);
            const formatted = formatPhoneNumberForCountry(event.currentTarget.value, countryCode as CountryCode);
            if (formatted && formatted !== event.currentTarget.value) {
              form.setValue('contact', formatted, { shouldDirty: true, shouldValidate: true });
            }
          }}
          error={form.formState.errors.contact?.message}
        />
      </div>
      <p className="field-help">
        {t('signup.phone.help', { country: country?.name ?? t('signup.phone.yourCountry') })}
      </p>
    </div>
  );
}
