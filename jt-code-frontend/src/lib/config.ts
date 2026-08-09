import { z } from 'zod';

const schema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  VITE_API_BASE_URL: z.string().default('/api/v1'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_SENTRY_ENVIRONMENT: z.string().default('development'),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  VITE_APP_NAME: z.literal('JT-Code').default('JT-Code'),
  VITE_APP_VERSION: z.string().default('0.1.0'),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid frontend environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('JT-Code web configuration is invalid. Check .env against .env.example.');
}

export const config = {
  clerkPublishableKey: parsed.data.VITE_CLERK_PUBLISHABLE_KEY,
  apiBaseUrl: parsed.data.VITE_API_BASE_URL.replace(/\/$/, ''),
  sentryDsn: parsed.data.VITE_SENTRY_DSN || undefined,
  sentryEnvironment: parsed.data.VITE_SENTRY_ENVIRONMENT,
  sentryTracesSampleRate: parsed.data.VITE_SENTRY_TRACES_SAMPLE_RATE,
  appName: parsed.data.VITE_APP_NAME,
  appVersion: parsed.data.VITE_APP_VERSION,
} as const;
