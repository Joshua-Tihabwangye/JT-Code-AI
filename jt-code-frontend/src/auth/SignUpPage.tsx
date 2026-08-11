import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, UserRound } from 'lucide-react'
import { useSignUp } from '@clerk/react'
import AuthLayout from './AuthLayout'
import PasswordField from './PasswordField'
import SocialButtons from './SocialButtons'
import { getClerkErrorMessage, splitFullName } from './clerk-utils'

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
              <div className="field-group">
                <label htmlFor="signup-code">Verification code</label>
                <div className="input-shell">
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="signup-code"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="Enter the 6-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {errors.fields.code && <p className="field-error">{errors.fields.code.message}</p>}
              </div>
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
              <div className="field-group">
                <label htmlFor="full-name">Full name</label>
                <div className="input-shell">
                  <UserRound size={18} className="input-shell__icon" />
                  <input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="signup-email">Email address</label>
                <div className={`input-shell ${errors.fields.emailAddress ? 'input-shell--error' : ''}`}>
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.fields.emailAddress && <p className="field-error">{errors.fields.emailAddress.message}</p>}
              </div>

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
}
