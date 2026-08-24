import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import { Input } from '@/shared/components/Input';
import { supabase } from '@/lib/supabase';

type Stage = 'email' | 'sent' | 'reset' | 'complete';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const auth = supabase.auth as typeof supabase.auth & {
    resetPasswordForEmail(email: string): { data?: { resetCode?: string }; error?: { message?: string } | null };
    resetPassword(input: {
      email: string;
      code: string;
      newPassword: string;
    }): { data?: unknown; error?: { message?: string } | null };
  };
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sendResetLink = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const result = await auth.resetPasswordForEmail(email);
      const error = result.error;
      if (error) {
        setErrorMsg(error.message || 'Could not send the password reset link.');
        return;
      }
      const nextResetCode = String((result as { data?: { resetCode?: string } }).data?.resetCode ?? '000000');
      setResetCode(nextResetCode);
      setCode(nextResetCode);
      setStage('sent');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeReset = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await auth.resetPassword({
        email,
        code,
        newPassword,
      });
      if (error) {
        setErrorMsg(error.message || 'Could not reset your password.');
        return;
      }
      setSuccessMsg('Your password has been updated. You can sign in with the new password.');
      setStage('complete');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <section className="auth-card auth-card--forgot">
        {stage === 'email' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <div className="auth-card__icon">
                <ShieldCheck size={18} />
              </div>
              <h2>Reset your password</h2>
              <p>Enter your email address and we’ll prepare a mock reset flow you can complete right here.</p>
            </div>

            <form onSubmit={(event) => void sendResetLink(event)} className="auth-form auth-form--forgot">
              <Input
                id="reset-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail size={16} aria-hidden />}
                error={errorMsg}
              />

              <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send reset code'}
              </button>

              <Link to="/sign-in" className="back-link">
                <ArrowLeft size={17} /> Back to sign in
              </Link>
            </form>
          </>
        )}

        {stage === 'sent' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <div className="auth-card__icon">
                <KeyRound size={18} />
              </div>
              <h2>Check your email</h2>
              <p>
                We sent a mock reset message to <strong>{email}</strong>. The code below will unlock the next step.
              </p>
            </div>

            <div className="reset-code-card">
              <span>Mock reset code</span>
              <strong>{resetCode}</strong>
              <button type="button" className="secondary-button" onClick={() => setStage('reset')}>
                Use this code now
              </button>
            </div>

            <button type="button" className="text-link" onClick={() => setStage('reset')}>
              I already have a reset code
            </button>

            <Link to="/sign-in" className="back-link">
              <ArrowLeft size={17} /> Back to sign in
            </Link>
          </>
        )}

        {stage === 'reset' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <div className="auth-card__icon">
                <ShieldCheck size={18} />
              </div>
              <h2>Create a new password</h2>
              <p>Enter the reset code and choose a new password for {email}.</p>
            </div>

            <form onSubmit={(event) => void completeReset(event)} className="auth-form auth-form--forgot">
              <Input
                id="reset-code"
                label="Reset code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="000000"
                leftIcon={<KeyRound size={16} aria-hidden />}
              />
              <Input
                id="new-password"
                label="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Create a new password"
                autoComplete="new-password"
              />
              <Input
                id="confirm-password"
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              {errorMsg && <div className="form-error">{errorMsg}</div>}

              <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? 'Updating…' : 'Reset password'}
              </button>

              <button type="button" className="text-link" onClick={() => setStage('sent')}>
                Back to code step
              </button>
            </form>
          </>
        )}

        {stage === 'complete' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <div className="auth-card__icon auth-card__icon--success">
                <CheckCircle2 size={18} />
              </div>
              <h2>Password updated</h2>
              <p>{successMsg}</p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => void navigate('/sign-in', { replace: true })}
            >
              Return to sign in
            </button>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
