import { UserRound, User } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function NameFields({ form }: Props) {
  return (
    <div className="signup-grid signup-grid--two">
      <div className="form-field">
        <Input
          id="firstName"
          label="First name"
          autoComplete="given-name"
          placeholder="First name"
          leftIcon={<User size={16} aria-hidden />}
          {...form.register('firstName')}
          error={form.formState.errors.firstName?.message}
        />
      </div>

      <div className="form-field">
        <Input
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          placeholder="Last name"
          leftIcon={<UserRound size={16} aria-hidden />}
          {...form.register('lastName')}
          error={form.formState.errors.lastName?.message}
        />
      </div>
    </div>
  );
}
