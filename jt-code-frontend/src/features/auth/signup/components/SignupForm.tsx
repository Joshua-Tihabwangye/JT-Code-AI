import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignupHeader } from './SignupHeader';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { NameFields } from './NameFields';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { CountryField } from './CountryField';
import { PhoneField } from './PhoneField';
import { TimezoneField } from './TimezoneField';
import { TermsField } from './TermsField';
import { SubmitButton } from './SubmitButton';
import { useSignupForm } from '../hooks/useSignupForm';
import { signup } from '../services/signup.service';
import type { SignupPayload } from '../types';
import { supabase } from '@/lib/supabase';
import '../styles/signup.css';

interface Props {
  onSignedUp: () => void;
}

export function SignupForm({ onSignedUp }: Props) {
  const [submitError, setSubmitError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignup = async (payload: SignupPayload) => {
    setSubmitError('');
    const result = await signup(payload);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    onSignedUp();
  };

  const { form, submit } = useSignupForm(handleSignup);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setSubmitError('');
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        setSubmitError(error.message);
        return;
      }
      onSignedUp();
    } finally {
      setOauthLoading(false);
    }
  };

  const isSubmitting = form.formState.isSubmitting || oauthLoading;

  return (
    <section className="signup-card">
      <SignupHeader />

      <SocialAuthButtons
        onGoogle={() => void handleOAuth('google')}
        onApple={() => void handleOAuth('apple')}
        disabled={isSubmitting}
      />

      <div className="signup-divider">
        <span />
        <span>or</span>
        <span />
      </div>

      <form onSubmit={(event) => { void form.handleSubmit(submit)(event); }} noValidate className="signup-form">
        <NameFields form={form} />
        <EmailField form={form} />
        <PasswordField
          form={form}
          field="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <PasswordField
          form={form}
          field="confirmPassword"
          label="Confirm password"
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
        <CountryField form={form} />
        <PhoneField form={form} />
        <TimezoneField form={form} />

        <div className="country-helper">
          Phone format and timezone options automatically update based on the
          selected country.
        </div>

        <TermsField form={form} />

        {submitError && <div className="form-error">{submitError}</div>}

        <SubmitButton isSubmitting={isSubmitting} label="Create account" />
      </form>

      <footer className="signup-footer">
        <span>Already have an account?</span>
        <Link to="/sign-in">Sign in</Link>
      </footer>
    </section>
  );
}
