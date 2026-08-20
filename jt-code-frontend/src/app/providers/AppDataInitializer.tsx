import { useEffect } from 'react';
import { useAuth } from '@/lib/supabase';
import { useApiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/queryClient';
import { config } from '@/lib/config';
import { getUserProfile } from '@/features/settings/api';
import { getSubscription, getWallet, getUsage } from '@/features/billing/api';

export function AppDataInitializer() {
  const { isSignedIn, loading } = useAuth();
  const client = useApiClient();

  useEffect(() => {
    // In mock mode the repositories own all data; never call the backend.
    if (config.dataMode === 'mock') return;
    if (loading || !isSignedIn) return;

    void queryClient.prefetchQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
    void queryClient.prefetchQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
    void queryClient.prefetchQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
    void queryClient.prefetchQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });
  }, [loading, isSignedIn, client]);

  return null;
}
