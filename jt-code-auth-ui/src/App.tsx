import { Navigate, Route, Routes } from 'react-router-dom'
import { Show } from '@clerk/react'
import SignInPage from './auth/SignInPage'
import SignUpPage from './auth/SignUpPage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import SsoCallbackPage from './auth/SsoCallbackPage'

function DemoAppPage() {
  return (
    <div style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
      <h1>JT-Code</h1>
      <p>You are signed in.</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route
        path="/app"
        element={
          <Show when="signed-in" fallback={<Navigate to="/sign-in" replace />}>
            <DemoAppPage />
          </Show>
        }
      />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  )
}
