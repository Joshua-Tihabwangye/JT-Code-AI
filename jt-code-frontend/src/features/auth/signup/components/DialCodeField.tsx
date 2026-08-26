import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { COUNTRY_METADATA, getCountryMetadata } from '../../lib/countryMetadata';
import type { SignupSchema } from '../schema';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function DialCodeField({ form }: Props) {
  const { t } = useTranslation();
  const countryCode = form.watch('countryCode');
  const field = form.register('countryCode');

  return (
    <div className="form-field">
      <label htmlFor="countryCode">{t('signup.country.label')}</label>
      <select
        id="countryCode"
        value={countryCode}
        {...field}
        onChange={(event) => {
          void field.onChange(event);
          const country = getCountryMetadata(event.target.value);
          if (country) {
            void form.setValue('dialCode', country.dialCode, { shouldDirty: true, shouldValidate: true });
            void form.setValue('timezone', country.timezones[0] ?? '', { shouldDirty: true, shouldValidate: true });
            void form.setValue('contact', '', { shouldDirty: true, shouldValidate: true });
          }
        }}
      >
        {COUNTRY_METADATA.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
