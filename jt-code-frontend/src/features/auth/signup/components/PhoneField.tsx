import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { useCountryMetadata } from '../hooks/useCountryMetadata';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function PhoneField({ form }: Props) {
  const countryCode = form.watch('countryCode');
  const { dialCode, phonePlaceholder } = useCountryMetadata(countryCode);

  return (
    <div className="form-field">
      <label htmlFor="contact">Contact / phone number</label>
      <div className="phone-input">
        <div className="phone-dial-code">{dialCode}</div>
        <input
          id="contact"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={phonePlaceholder || 'Enter phone number'}
          {...form.register('contact')}
        />
      </div>
      <FormError message={form.formState.errors.contact?.message} />
    </div>
  );
}
