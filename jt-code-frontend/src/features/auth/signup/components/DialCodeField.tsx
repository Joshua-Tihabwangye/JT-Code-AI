import type { UseFormReturn } from 'react-hook-form';
import { COUNTRY_METADATA } from '../../lib/countryMetadata';
import type { SignupSchema } from '../schema';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

function uniqueDialCodes() {
  const seen = new Set<string>();
  return COUNTRY_METADATA.filter((country) => {
    if (seen.has(country.dialCode)) return false;
    seen.add(country.dialCode);
    return true;
  });
}

export function DialCodeField({ form }: Props) {
  const dialCode = form.watch('dialCode');
  const dialCodeField = form.register('dialCode');

  return (
    <div className="form-field">
      <label htmlFor="dialCode">Dial code</label>
      <select
        id="dialCode"
        {...dialCodeField}
        value={dialCode}
        onChange={(event) => {
          dialCodeField.onChange(event);
          form.setValue('dialCode', event.target.value, { shouldDirty: true, shouldValidate: true });
        }}
      >
        {uniqueDialCodes().map((country) => (
          <option key={`${country.dialCode}-${country.code}`} value={country.dialCode}>
            {country.flag} {country.dialCode} {country.name}
          </option>
        ))}
      </select>
      <p className="field-help">You can override the default code if you're signing up for a different calling region.</p>
      {form.formState.errors.dialCode?.message && (
        <p className="field-error">{form.formState.errors.dialCode.message}</p>
      )}
    </div>
  );
}
