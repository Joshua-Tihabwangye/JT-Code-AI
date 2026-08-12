import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from '@/auth/AuthLayout';
import PasswordField from '@/auth/PasswordField';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'email' | 'sent'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sendResetLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/forgot-password?reset=true',
      });
      if (error) {
        setErrorMsg(error.message || 'Could not send the password reset link.');
      } else {
        setStage('sent');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card--forgot">
        {stage === 'email' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <h2>Forgot your password?</h2>
              <p>No worries. Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={sendResetLink} className="auth-form auth-form--forgot">
              <div className="field-group">
                <label htmlFor="reset-email">Email address</label>
                <div className={`input-shell ${errorMsg ? 'input-shell--error' : ''}`}>
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errorMsg && <p className="field-error">{errorMsg}</p>}
              </div>

              {errorMsg && <div className="form-error">{errorMsg}</div>}

              <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>

              <Link to="/sign-in" className="back-link"><ArrowLeft size={17} /> Back to sign in</Link>
            </form>

            <div className="help-note">
              <div className="help-note__icon"><Mail size={18} /></div>
              <p>Don't see the email? Check your spam folder or try again. If you still need help, <a href="/support">contact support</a>.</p>
            </div>
          </>
        )}

        {stage === 'sent' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <h2>Check your email</h2>
              <p>We've sent a password reset link to {email}. Click the link in the email to reset your password.</p>
            </div>
            <Link to="/sign-in" className="back-link"><ArrowLeft size={17} /> Back to sign in</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}