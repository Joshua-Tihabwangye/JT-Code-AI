import { useEffect } from 'react';
import { useAuth } from '@/lib/supabase';
import { useApiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/queryClient';
import { getUserProfile } from '@/features/settings/api';
import { getSubscription, getWallet, getUsage } from '@/features/billing/api';

export function AppDataInitializer() {
  const { isSignedIn, loading } = useAuth();
  const client = useApiClient();

  useEffect(() => {
    if (loading || !isSignedIn) return;

    void queryClient.prefetchQuery({ queryKey: ['user-profile'], queryFn: () => getUserProfile(client) });
    void queryClient.prefetchQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
    void queryClient.prefetchQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
    void queryClient.prefetchQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });
  }, [loading, isSignedIn, client]);

  return null;
}
