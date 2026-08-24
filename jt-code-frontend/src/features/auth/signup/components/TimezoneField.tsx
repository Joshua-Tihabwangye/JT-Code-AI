import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { getCountryMetadata } from '../../lib/countryMetadata';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function TimezoneField({ form }: Props) {
  const countryCode = form.watch('countryCode');
  const country = getCountryMetadata(countryCode);
  const timezones = country?.timezones ?? [];

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
      <p className="field-help">
        Suggested timezones are filtered by the selected country, but you can override them.
      </p>
      {form.formState.errors.timezone?.message && (
        <p className="field-error">{form.formState.errors.timezone.message}</p>
      )}
    </div>
  );
}
