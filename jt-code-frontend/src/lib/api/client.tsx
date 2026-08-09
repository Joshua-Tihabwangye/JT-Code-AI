import { useAuth } from '@clerk/clerk-react';
import axios, { AxiosError, type AxiosInstance } from 'axios';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import * as Sentry from '@sentry/react';
import { config } from '@/lib/config';
import type { ApiErrorBody } from '@/lib/api/types';

const ApiClientContext = createContext<AxiosInstance | null>(null);

export function ApiClientProvider({ children }: PropsWithChildren) {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use(async (request) => {
      const token = await getToken();
      if (token) request.headers.Authorization = `Bearer ${token}`;
      request.headers['X-JT-Code-Client'] = `web/${config.appVersion}`;
      return request;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorBody>) => {
        const traceId = error.response?.data?.traceId;
        Sentry.captureException(error, {
          tags: {
            api_status: String(error.response?.status ?? 'network'),
            trace_id: traceId ?? 'unknown',
          },
        });
        return Promise.reject(error);
      },
    );

    return instance;
  }, [getToken]);

  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): AxiosInstance {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error('useApiClient must be used inside ApiClientProvider');
  return client;
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.detail ?? error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
