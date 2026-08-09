import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { ClerkProvider } from '@clerk/clerk-react';
import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';
import { initializeSentry } from '@/lib/sentry';
import { config } from '@/lib/config';
import '@/styles/global.css';

initializeSentry();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="fatal-error">JT-Code encountered an error.</div>}>
      <ClerkProvider publishableKey={config.clerkPublishableKey} afterSignOutUrl="/">
        <AppProviders>
          <App />
        </AppProviders>
      </ClerkProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);