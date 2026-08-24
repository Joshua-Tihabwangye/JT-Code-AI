import { useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignupHeader } from './SignupHeader';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { NameFields } from './NameFields';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { CountryField } from './CountryField';
import { DialCodeField } from './DialCodeField';
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

function PasswordRequirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? 'is-met' : ''}>
      {ok ? <Check size={14} aria-hidden /> : <CircleAlert size={14} aria-hidden />}
      <span>{label}</span>
    </li>
  );
}

export function SignupForm({ onSignedUp }: Props) {
  const [submitError, setSubmitError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

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
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const isSubmitting = form.formState.isSubmitting || !!loadingProvider;

  const passwordChecks = [
    { ok: password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { ok: /[a-z]/.test(password), label: 'One lowercase letter' },
    { ok: /[0-9]/.test(password), label: 'One number' },
  ];

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setSubmitError('');
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        setSubmitError(error.message);
        return;
      }
      onSignedUp();
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <section className="signup-card auth-card">
      <SignupHeader />

      <p className="signup-subtitle">
        Create a secure account with the fields JT-Code actually uses across the app.
      </p>

        <SocialAuthButtons
          onGoogle={() => void handleOAuth('google')}
          onApple={() => void handleOAuth('apple')}
          disabled={isSubmitting}
          loadingProvider={loadingProvider}
        />

      <div className="signup-divider">
        <span />
        <span>or</span>
        <span />
      </div>

      <form
        onSubmit={(event) => {
          void form.handleSubmit(submit)(event);
        }}
        noValidate
        className="signup-form"
      >
        <NameFields form={form} />
        <EmailField form={form} />

        <PasswordField
          form={form}
          field="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          helper={(
            <ul className="password-checklist" aria-label="Password requirements">
              {passwordChecks.map((check) => (
                <PasswordRequirement key={check.label} ok={check.ok} label={check.label} />
              ))}
            </ul>
          )}
        />

        <PasswordField
          form={form}
          field="confirmPassword"
          label="Confirm password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          helper={(
            <div className={`password-match ${confirmPassword ? (confirmPassword === password ? 'is-ok' : 'is-error') : ''}`}>
              {confirmPassword && confirmPassword === password
                ? 'Passwords match.'
                : confirmPassword
                  ? 'Passwords do not match yet.'
                  : 'Re-enter your password to confirm it.'}
            </div>
          )}
        />

        <CountryField form={form} />

        <div className="signup-grid signup-grid--two">
          <DialCodeField form={form} />
          <PhoneField form={form} />
        </div>

        <TimezoneField form={form} />

        <div className="signup-note">
          The selected country updates phone validation and timezone suggestions automatically.
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
