import { Link } from 'react-router-dom';
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
          I agree to the <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </label>
      </div>
      <p className="field-help">
        You can review these legal pages before you finish signing up.
      </p>
      <FormError message={form.formState.errors.acceptedTerms?.message} />
    </div>
  );
}
