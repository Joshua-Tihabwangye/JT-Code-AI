import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function NameFields({ form }: Props) {
  return (
    <div className="signup-grid signup-grid--two">
      <div className="form-field">
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          autoComplete="given-name"
          placeholder="First name"
          {...form.register('firstName')}
        />
        <FormError message={form.formState.errors.firstName?.message} />
      </div>

      <div className="form-field">
        <label htmlFor="lastName">Last name</label>
        <input
          id="lastName"
          autoComplete="family-name"
          placeholder="Last name"
          {...form.register('lastName')}
        />
        <FormError message={form.formState.errors.lastName?.message} />
      </div>
    </div>
  );
}
