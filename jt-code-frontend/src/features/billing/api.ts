import type { useApiClient } from '@/lib/api/client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  interval: string;
  monthly_credits: number;
  is_popular: boolean;
  features?: Record<string, unknown>;
  description?: string;
  price_dollars?: number;
}

export interface Subscription {
  id: string;
  status: string;
  plan: string;
  plan_name: string;
  plan_slug: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  is_active?: boolean;
  days_remaining?: number;
}

export interface Wallet {
  id: string;
  balance: number;
  reserved_balance: number;
  available_balance: number;
  currency: string;
  credit_value_usd: number;
  auto_topup_enabled?: boolean;
}

export interface Usage {
  by_type: Record<string, { total_credits: number; count: number }>;
  total_credits: number;
}

export async function getPlans(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Plan[] }>('/plans/');
  return response.data.results;
}

export async function getSubscription(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Subscription[] }>('/subscriptions/');
  const active = response.data.results.find((s) => s.is_active) ?? response.data.results[0];
  return active ?? null;
}

export async function getWallet(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Wallet[] }>('/wallets/');
  return response.data.results[0] ?? null;
}

export async function getUsage(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<Usage>('/usage/');
  return response.data;
}

export async function topupCredits(client: ReturnType<typeof useApiClient>, amountUsd: number) {
  const wallet = await getWallet(client);
  if (!wallet) throw new Error('No credit wallet available.');
  const response = await client.post<{ client_secret: string; payment_intent_id: string }>(
    `/wallets/${wallet.id}/topup/`,
    { amount_cents: Math.round(amountUsd * 100) },
  );
  return response.data;
}

export async function createCheckoutSession(client: ReturnType<typeof useApiClient>, planId: string) {
  const response = await client.post<{ checkout_url: string }>(`/plans/${planId}/subscribe/`, {
    success_url: window.location.origin + '/app/billing',
    cancel_url: window.location.origin + '/app/billing',
  });
  return response.data;
}

export async function cancelSubscription(client: ReturnType<typeof useApiClient>) {
  const subscription = await getSubscription(client);
  if (!subscription) throw new Error('No active subscription.');
  await client.post(`/subscriptions/${subscription.id}/cancel/`);
}