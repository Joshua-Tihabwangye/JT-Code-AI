import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { queryClient } from '@/lib/queryClient';
import { ApiClientProvider } from '@/lib/api/client';
import { ThemeProvider } from '@/lib/theme';
import { SupabaseProvider } from '@/lib/supabase';
import { AppDataInitializer } from './AppDataInitializer';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvider>
            <BrowserRouter>
              <AppDataInitializer />
              {children}
            </BrowserRouter>
          </ApiClientProvider>
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
