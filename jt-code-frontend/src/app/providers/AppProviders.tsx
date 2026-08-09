import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { queryClient } from '@/lib/queryClient';
import { ApiClientProvider } from '@/lib/api/client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ApiClientProvider>
    </QueryClientProvider>
  );
}