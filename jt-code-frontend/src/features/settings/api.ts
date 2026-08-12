import { useApiClient } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  contact?: string;
  country?: string;
  timezone: string;
  locale: string;
  avatar_url?: string;
  job_title?: string;
  bio?: string;
  supabase_user_id: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  consent_type: string;
  status: 'granted' | 'denied';
  version: string;
  granted_at?: string;
  expires_at?: string;
}

export async function getUserProfile(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<UserProfile>('/settings/profile/');
  return response.data;
}

export async function updateUserProfile(
  client: ReturnType<typeof useApiClient>,
  data: Partial<UserProfile>
) {
  const response = await client.patch<UserProfile>('/settings/profile/', data);
  return response.data;
}

export async function getOrganization(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<Organization>('/settings/organization/');
  return response.data;
}

export async function updateOrganization(
  client: ReturnType<typeof useApiClient>,
  data: Partial<Organization>
) {
  const response = await client.patch<Organization>('/settings/organization/', data);
  return response.data;
}

export async function getConsents(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: ConsentRecord[] }>('/settings/consents/');
  return response.data.results;
}

export async function updateConsent(
  client: ReturnType<typeof useApiClient>,
  consentType: string,
  status: 'granted' | 'denied'
) {
  const response = await client.post('/settings/consents/', { consent_type: consentType, status });
  return response.data;
}

export async function exportUserData(client: ReturnType<typeof useApiClient>) {
  const response = await client.post('/settings/export/');
  return response.data;
}

export async function deleteAccount(client: ReturnType<typeof useApiClient>) {
  await client.delete('/settings/account/');
}