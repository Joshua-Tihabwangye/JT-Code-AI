<<<<<<< HEAD
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/react'
import AuthLayout from '@/auth/AuthLayout'
import PasswordField from '@/auth/PasswordField'
import EmailField from '@/auth/EmailField'
import NameField from '@/auth/NameField'
import VerificationCodeField from '@/auth/VerificationCodeField'
import SocialButtons from '@/auth/SocialButtons'
import { getClerkErrorMessage, splitFullName } from '@/auth/clerk-utils'

type OAuthStrategy = 'oauth_google' | 'oauth_github'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, errors, fetchStatus } = useSignUp()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationStage, setVerificationStage] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const busy = fetchStatus === 'fetching'

  const finalize = async () => {
    const { error } = await signUp.finalize({
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

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    if (password !== confirmPassword) {
      setGeneralError('Passwords do not match.')
      return
    }
    if (!accepted) {
      setGeneralError('Please agree to the Terms and Privacy Policy.')
      return
    }

    const { firstName, lastName } = splitFullName(fullName)
    if (!firstName) {
      setGeneralError('Please enter your name.')
      return
    }

    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
      legalAccepted: accepted,
    })

    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'Unable to create your account.'))
      return
    }

    const { error: codeError } = await signUp.verifications.sendEmailCode()
    if (codeError) {
      setGeneralError(getClerkErrorMessage(codeError, 'Could not send the verification code.'))
      return
    }
    setVerificationStage(true)
  }

  const verifyEmail = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    const { error } = await signUp.verifications.verifyEmailCode({ code: verificationCode })
    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'The verification code is invalid.'))
      return
    }

    if (signUp.status === 'complete') {
      await finalize()
      return
    }

    setGeneralError('Your Clerk project requires additional sign-up information.')
  }

  const startOAuth = async (strategy: OAuthStrategy) => {
    setGeneralError('')
    if (!accepted) {
      setGeneralError('Please agree to the Terms and Privacy Policy before continuing.')
      return
    }
    const { firstName, lastName } = splitFullName(fullName)
    const { error } = await signUp.sso({
      strategy,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      legalAccepted: accepted,
      redirectCallbackUrl: '/sso-callback',
      redirectUrl: '/app',
    })
    if (error) setGeneralError(getClerkErrorMessage(error))
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--signup">
        {verificationStage ? (
          <>
            <div className="auth-card__heading">
              <h2>Check your email</h2>
              <p>Enter the verification code Clerk sent to {email}.</p>
            </div>
            <form onSubmit={verifyEmail} className="auth-form">
              <VerificationCodeField
                id="signup-code"
                label="Verification code"
                value={verificationCode}
                onChange={setVerificationCode}
                placeholder="Enter the 6-digit code"
                autoComplete="one-time-code"
                error={errors.fields.code?.message}
              />
              {generalError && <div className="form-error">{generalError}</div>}
              <button type="submit" className="primary-button" disabled={busy}>Verify email</button>
              <button
                type="button"
                className="text-button"
                onClick={() => signUp.verifications.sendEmailCode()}
                disabled={busy}
              >
                Send a new code
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-card__heading auth-card__heading--signup">
              <h2>Create your account</h2>
              <p>Start your journey with JT-Code</p>
            </div>

            <SocialButtons
              onGoogle={() => startOAuth('oauth_google')}
              onGithub={() => startOAuth('oauth_github')}
              disabled={busy}
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
                error={errors.fields.emailAddress?.message}
              />

              <PasswordField
                id="signup-password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Create a password"
                autoComplete="new-password"
                error={errors.fields.password?.message}
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

              {generalError && <div className="form-error">{generalError}</div>}

              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Creating account…' : 'Create account'}
              </button>

              <div id="clerk-captcha" className="clerk-captcha" />
            </form>

            <p className="auth-card__switch auth-card__switch--signup">
              Already have an account? <Link to="/sign-in">Sign in</Link>
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
import { Mail, Lock, User } from 'lucide-react';

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
          },
        },
      });
      if (authError) throw authError;
      alert('Account created! Check your email to verify your account.');
      navigate('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-form-header">
          <h1>Create your JT-Code account</h1>
          <p>Get started with your AI assistant workspace.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <Input
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User size={16} />}
            required
            autoComplete="name"
          />
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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="auth-form-footer">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/sign-in" className="link font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
>>>>>>> 6b24cd4 (Modified backend)
}
