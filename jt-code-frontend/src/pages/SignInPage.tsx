<<<<<<< HEAD
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useSignIn } from '@clerk/react'
import AuthLayout from '@/auth/AuthLayout'
import PasswordField from '@/auth/PasswordField'
import EmailField from '@/auth/EmailField'
import SocialButtons from '@/auth/SocialButtons'
import { getClerkErrorMessage } from '@/auth/clerk-utils'

type OAuthStrategy = 'oauth_google' | 'oauth_github'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, errors, fetchStatus } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const busy = fetchStatus === 'fetching'

  const finalize = async () => {
    const { error } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.warn('Clerk session task requires handling:', session.currentTask)
          return
        }
        const url = decorateUrl('/app')
        if (url.startsWith('http')) window.location.href = url
        else navigate(url)
      },
    })
    if (error) setGeneralError(getClerkErrorMessage(error))
  }

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    const { error } = await signIn.password({ emailAddress: email, password })
    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'Unable to sign in. Check your details and try again.'))
      return
    }

    if (signIn.status === 'complete') {
      await finalize()
      return
    }

    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const { error: sendError } = await signIn.mfa.sendEmailCode()
      if (sendError) {
        setGeneralError(getClerkErrorMessage(sendError, 'Additional verification is required.'))
        return
      }
      setNeedsVerification(true)
      return
    }

    setGeneralError('Your Clerk configuration requires an additional authentication step.')
  }

  const verifyAdditionalStep = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')
    const { error } = await signIn.mfa.verifyEmailCode({ code: verificationCode })
    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'The verification code is invalid.'))
      return
    }
    if (signIn.status === 'complete') await finalize()
  }

  const startOAuth = async (strategy: OAuthStrategy) => {
    setGeneralError('')
    const { error } = await signIn.sso({
      strategy,
      redirectCallbackUrl: '/sso-callback',
      redirectUrl: '/app',
    })
    if (error) setGeneralError(getClerkErrorMessage(error))
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--signin">
{needsVerification ? (
          <>
            <div className="auth-card__heading">
              <h2>Verify it's you</h2>
              <p>Enter the verification code Clerk sent to your email.</p>
            </div>
            <form onSubmit={verifyAdditionalStep} className="auth-form">
              <EmailField
                id="verification-code"
                label="Verification code"
                value={verificationCode}
                onChange={setVerificationCode}
                placeholder="Enter the 6-digit code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                error={errors.fields.code?.message}
              />
              {generalError && <div className="form-error">{generalError}</div>}
              <button className="primary-button" disabled={busy}>Verify</button>
              <button type="button" className="text-button" onClick={() => setNeedsVerification(false)}>
                Back to sign in
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-card__heading">
              <h2>Welcome back</h2>
              <p>Sign in to continue to JT-Code</p>
            </div>

            <SocialButtons
              onGoogle={() => startOAuth('oauth_google')}
              onGithub={() => startOAuth('oauth_github')}
              disabled={busy}
            />

            <div className="auth-divider"><span>or</span></div>

            <form onSubmit={handlePasswordSignIn} className="auth-form">
              <EmailField
                id="email"
                label="Email address"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.fields.identifier?.message}
              />

              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.fields.password?.message}
              />

              <div className="form-options">
                <label className="checkbox-row">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              {generalError && <div className="form-error">{generalError}</div>}

              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="auth-card__switch">
              Don’t have an account? <Link to="/sign-up">Create account</Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
=======
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Alert } from '@/shared/components';
import { Mail, Lock } from 'lucide-react';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      navigate('/app/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/sign-in',
      });
      if (resetError) throw resetError;
      alert('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-form-header">
          <h1>Sign in to JT-Code</h1>
          <p>Enter your credentials to access your workspace.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="auth-form-footer">
          <button
            type="button"
            className="link text-sm"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot your password?
          </button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/sign-up" className="link font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
>>>>>>> 6b24cd4 (Modified backend)
}
