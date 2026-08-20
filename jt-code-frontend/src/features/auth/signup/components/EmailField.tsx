import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function EmailField({ form }: Props) {
  return (
    <div className="form-field">
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        {...form.register('email')}
      />
      <FormError message={form.formState.errors.email?.message} />
    </div>
  );
}
