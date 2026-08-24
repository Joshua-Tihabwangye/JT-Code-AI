import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { queryClient } from '@/lib/queryClient';
import { ApiClientProvider } from '@/lib/api/client';
import { ThemeProvider } from '@/lib/theme';
import '@/i18n/config';
import { SupabaseProvider } from '@/lib/supabase';
import { RepositoryProvider } from '@/lib/data';
import { ToastProvider } from '@/shared/components';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { OfflineBanner } from '@/app/OfflineBanner';
import { AppDataInitializer } from './AppDataInitializer';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvider>
            <RepositoryProvider>
              <ErrorBoundary>
                <ToastProvider>
                  <OfflineBanner />
                  <BrowserRouter>
                    <AppDataInitializer />
                    {children}
                  </BrowserRouter>
                </ToastProvider>
              </ErrorBoundary>
            </RepositoryProvider>
          </ApiClientProvider>
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
