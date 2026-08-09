import * as Sentry from '@sentry/react';
import { config } from '@/lib/config';

export function initializeSentry(): void {
  if (!config.sentryDsn) return;

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: `jt-code-web@${config.appVersion}`,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: config.sentryTracesSampleRate,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    sendDefaultPii: false,
  });
}
