import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { config } from '@/lib/config';
import { queryClient } from '@/lib/queryClient';
import { ApiClientProvider } from '@/lib/api/client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider publishableKey={config.clerkPublishableKey} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <ApiClientProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ApiClientProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
