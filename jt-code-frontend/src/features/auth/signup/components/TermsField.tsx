import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function TermsField({ form }: Props) {
  return (
    <div>
      <div className="terms-field">
        <input
          id="acceptedTerms"
          type="checkbox"
          {...form.register('acceptedTerms')}
        />
        <label htmlFor="acceptedTerms">
          I agree to the <a href="/terms">Terms</a> and{' '}
          <a href="/privacy">Privacy Policy</a>
        </label>
      </div>
      <FormError message={form.formState.errors.acceptedTerms?.message} />
    </div>
  );
}
