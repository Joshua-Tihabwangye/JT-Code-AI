import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { COUNTRY_METADATA } from '../../lib/countryMetadata';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function CountryField({ form }: Props) {
  return (
    <div className="form-field">
      <label htmlFor="countryCode">Country</label>
      <select id="countryCode" {...form.register('countryCode')}>
        {COUNTRY_METADATA.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} ({country.dialCode})
          </option>
        ))}
      </select>
      <FormError message={form.formState.errors.countryCode?.message} />
    </div>
  );
}
