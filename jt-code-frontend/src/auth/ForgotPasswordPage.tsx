import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useSignIn } from '@clerk/react'
import AuthLayout from './AuthLayout'
import PasswordField from './PasswordField'
import { getClerkErrorMessage } from './clerk-utils'

type ResetStage = 'email' | 'code' | 'password'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { signIn, errors, fetchStatus } = useSignIn()
  const [stage, setStage] = useState<ResetStage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [generalError, setGeneralError] = useState('')

  const busy = fetchStatus === 'fetching'

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    const { error: createError } = await signIn.create({ identifier: email })
    if (createError) {
      setGeneralError(getClerkErrorMessage(createError, 'Could not start password recovery.'))
      return
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
    if (sendError) {
      setGeneralError(getClerkErrorMessage(sendError, 'Could not send the password reset code.'))
      return
    }

    setStage('code')
  }

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })
    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'The code is invalid or has expired.'))
      return
    }
    setStage('password')
  }

  const setNewPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    if (password !== confirmPassword) {
      setGeneralError('Passwords do not match.')
      return
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    })
    if (error) {
      setGeneralError(getClerkErrorMessage(error, 'Could not update your password.'))
      return
    }

    if (signIn.status === 'complete') {
      const { error: finalizeError } = await signIn.finalize({
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
      if (finalizeError) setGeneralError(getClerkErrorMessage(finalizeError))
      return
    }

    if (signIn.status === 'needs_second_factor') {
      setGeneralError('Your account requires an additional verification step before sign-in can finish.')
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-card--forgot">
        {stage === 'email' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <h2>Forgot your password?</h2>
              <p>No worries. Enter your email address and we’ll send you a code to reset your password.</p>
            </div>

            <form onSubmit={sendCode} className="auth-form auth-form--forgot">
              <div className="field-group">
                <label htmlFor="reset-email">Email address</label>
                <div className={`input-shell ${errors.fields.identifier ? 'input-shell--error' : ''}`}>
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="reset-email"
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

              {generalError && <div className="form-error">{generalError}</div>}

              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>

              <Link to="/sign-in" className="back-link"><ArrowLeft size={17} /> Back to sign in</Link>
            </form>

            <div className="help-note">
              <div className="help-note__icon"><Mail size={18} /></div>
              <p>Don’t see the email? Check your spam folder or try again. If you still need help, <a href="/support">contact support</a>.</p>
            </div>
          </>
        )}

        {stage === 'code' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <h2>Check your email</h2>
              <p>Enter the password reset code we sent to {email}.</p>
            </div>
            <form onSubmit={verifyCode} className="auth-form auth-form--forgot">
              <div className="field-group">
                <label htmlFor="reset-code">Verification code</label>
                <div className="input-shell">
                  <Mail size={18} className="input-shell__icon" />
                  <input
                    id="reset-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter the 6-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {errors.fields.code && <p className="field-error">{errors.fields.code.message}</p>}
              </div>
              {generalError && <div className="form-error">{generalError}</div>}
              <button type="submit" className="primary-button" disabled={busy}>Verify code</button>
              <button type="button" className="text-button" onClick={() => setStage('email')}>Use a different email</button>
            </form>
          </>
        )}

        {stage === 'password' && (
          <>
            <div className="auth-card__heading auth-card__heading--forgot">
              <h2>Create a new password</h2>
              <p>Choose a strong password you haven’t used before.</p>
            </div>
            <form onSubmit={setNewPassword} className="auth-form auth-form--forgot">
              <PasswordField
                id="new-password"
                label="New password"
                value={password}
                onChange={setPassword}
                placeholder="Enter a new password"
                autoComplete="new-password"
                error={errors.fields.password?.message}
              />
              <PasswordField
                id="confirm-new-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
              {generalError && <div className="form-error">{generalError}</div>}
              <button type="submit" className="primary-button" disabled={busy}>Reset password</button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
