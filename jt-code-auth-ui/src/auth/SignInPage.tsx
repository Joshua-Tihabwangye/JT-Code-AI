import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useSignIn } from '@clerk/react'
import AuthLayout from './AuthLayout'
import PasswordField from './PasswordField'
import SocialButtons from './SocialButtons'
import { getClerkErrorMessage } from './clerk-utils'

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
              <h2>Verify it’s you</h2>
              <p>Enter the verification code Clerk sent to your email.</p>
            </div>
            <form onSubmit={verifyAdditionalStep} className="auth-form">
              <div className="field-group">
                <label htmlFor="verification-code">Verification code</label>
                <div className="input-shell">
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="Enter the 6-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
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
              <div className="field-group">
                <label htmlFor="email">Email address</label>
                <div className={`input-shell ${errors.fields.identifier ? 'input-shell--error' : ''}`}>
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.fields.identifier && <p className="field-error">{errors.fields.identifier.message}</p>}
              </div>

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
}
