import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import App from './App'
import './auth/auth.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey || publishableKey === 'pk_test_replace_me') {
  throw new Error(
    'Set VITE_CLERK_PUBLISHABLE_KEY in .env.local to your real Clerk publishable key.',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
