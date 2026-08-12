import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import PasswordField from '@/auth/PasswordField';
import EmailField from '@/auth/EmailField';
import NameField from '@/auth/NameField';
import SocialButtons from '@/auth/SocialButtons';
import { supabase } from '@/lib/supabase';

type OAuthStrategy = 'google' | 'github';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!accepted) {
      setErrorMsg('Please agree to the Terms and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
          },
        },
      });
      if (error) {
        setErrorMsg(error.message || 'Unable to create your account.');
      } else {
        alert('Account created! Check your email to verify your account.');
        navigate('/sign-in');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuth = async (strategy: OAuthStrategy) => {
    setErrorMsg('');
    if (!accepted) {
      setErrorMsg('Please agree to the Terms and Privacy Policy before continuing.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: strategy,
      options: {
        redirectTo: window.location.origin + '/sso-callback',
      },
    });
    if (error) setErrorMsg(error.message || 'Unable to start OAuth sign up.');
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card--signup">
        <div className="auth-card__heading auth-card__heading--signup">
          <h2>Create your account</h2>
          <p>Start your journey with JT-Code</p>
        </div>

        <SocialButtons
          onGoogle={() => startOAuth('google')}
          onGithub={() => startOAuth('github')}
          disabled={isLoading}
        />

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSignUp} className="auth-form auth-form--compact">
          <NameField
            id="full-name"
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Enter your full name"
            autoComplete="name"
          />

          <EmailField
            id="signup-email"
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <PasswordField
            id="signup-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <label className="checkbox-row checkbox-row--terms">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
          </label>

          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__switch auth-card__switch--signup">
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}