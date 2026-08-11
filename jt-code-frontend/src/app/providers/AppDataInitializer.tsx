import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { useApiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/queryClient';
import { getUserProfile } from '@/features/settings/api';
import { getSubscription, getWallet, getUsage } from '@/features/billing/api';

export function AppDataInitializer() {
  const { isLoaded, isSignedIn } = useAuth();
  const client = useApiClient();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Prefetch shared server state so every page renders consistently.
    queryClient.prefetchQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
    queryClient.prefetchQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
    queryClient.prefetchQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
    queryClient.prefetchQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });
  }, [isLoaded, isSignedIn, client]);

  return null;
}
