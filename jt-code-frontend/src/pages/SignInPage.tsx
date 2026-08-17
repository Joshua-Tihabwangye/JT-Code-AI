import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import EmailField from '@/auth/EmailField';
import PasswordField from '@/auth/PasswordField';
import SocialButtons from '@/auth/SocialButtons';
import { supabase } from '@/lib/supabase';

type OAuthStrategy = 'google' | 'github';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message || 'Unable to sign in. Check your details and try again.');
      } else {
        void navigate('/app/chat');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuth = async (strategy: OAuthStrategy) => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: strategy,
      options: {
        redirectTo: window.location.origin + '/sso-callback',
      },
    });
    if (error) setErrorMsg(error.message || 'Unable to start OAuth sign in.');
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card--signin">
        <div className="auth-card__heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue to JT-Code</p>
        </div>

        <SocialButtons
          onGoogle={() => startOAuth('google')}
          onGithub={() => startOAuth('github')}
          disabled={isLoading}
        />

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={(event) => void handlePasswordSignIn(event)} className="auth-form">
          <EmailField
            id="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="form-options">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__switch">
          Don't have an account? <Link to="/sign-up">Create account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}