import { useApiClient } from '@/lib/api/client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  interval: string;
  monthly_credits: number;
  features: Record<string, unknown>;
  is_popular: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Wallet {
  balance: number;
  reserved_balance: number;
  currency: string;
  credit_value_usd: number;
}

export interface Usage {
  by_type: Record<string, { total_credits: number; count: number }>;
  total_credits: number;
}

export async function getPlans(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Plan[] }>('/billing/plans/');
  return response.data;
}

export async function getSubscription(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<Subscription>('/billing/subscription/');
  return response.data;
}

export async function getWallet(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<Wallet>('/billing/wallet/');
  return response.data;
}

export async function getUsage(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<Usage>('/billing/usage/');
  return response.data;
}

export async function topupCredits(client: ReturnType<typeof useApiClient>, amountUsd: number) {
  const response = await client.post('/billing/topup/', { amount_usd: amountUsd });
  return response.data;
}

export async function createCheckoutSession(client: ReturnType<typeof useApiClient>, planId: string) {
  const response = await client.post('/billing/checkout/', { plan_id: planId });
  return response.data;
}

export async function cancelSubscription(client: ReturnType<typeof useApiClient>) {
  await client.post('/billing/subscription/cancel/');
}