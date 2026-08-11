import { useEffect, useRef } from 'react'
import { useClerk, useSignIn, useSignUp } from '@clerk/react'
import { useNavigate } from 'react-router-dom'

export default function SsoCallbackPage() {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return
    hasRun.current = true

    const finalize = async () => {
      const navigation = ({ session, decorateUrl }: { session?: { currentTask?: unknown } | null; decorateUrl: (url: string) => string }) => {
        if (session?.currentTask) {
          console.warn('Clerk session task requires handling:', session.currentTask)
          return
        }
        const url = decorateUrl('/app')
        if (url.startsWith('http')) window.location.href = url
        else navigate(url, { replace: true })
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({ navigate: navigation })
        return
      }

      if (signUp.isTransferable) {
        await signIn.create({ transfer: true })
        if (signIn.status === 'complete') {
          await signIn.finalize({ navigate: navigation })
          return
        }
        navigate('/sign-in', { replace: true })
        return
      }

      if (signIn.isTransferable) {
        await signUp.create({ transfer: true })
        if (signUp.status === 'complete') {
          await signUp.finalize({ navigate: navigation })
          return
        }
        navigate('/sign-up', { replace: true })
        return
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: navigation })
        return
      }

      if (signIn.existingSession || signUp.existingSession) {
        const sessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId
        if (sessionId) {
          await clerk.setActive({ session: sessionId, navigate: navigation })
          return
        }
      }

      navigate('/sign-in', { replace: true })
    }

    void finalize()
  }, [clerk, navigate, signIn, signUp])

  return (
    <div className="sso-loading">
      <div className="sso-loading__mark">JT</div>
      <p>Finishing sign in…</p>
    </div>
  )
}
