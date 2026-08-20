import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { useCountryMetadata } from '../hooks/useCountryMetadata';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function TimezoneField({ form }: Props) {
  const countryCode = form.watch('countryCode');
  const { timezones } = useCountryMetadata(countryCode);

  return (
    <div className="form-field">
      <label htmlFor="timezone">Timezone</label>
      <select
        id="timezone"
        disabled={!timezones.length}
        {...form.register('timezone')}
      >
        {!timezones.length && <option value="">No timezone available</option>}
        {timezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
      <FormError message={form.formState.errors.timezone?.message} />
    </div>
  );
}
