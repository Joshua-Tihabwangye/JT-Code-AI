import type { useApiClient } from '@/lib/api/client';

export interface Connector {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  auth_type: string;
  icon_url?: string;
  is_verified: boolean;
}

export interface ConnectorAccount {
  id: string;
  connector_id: string;
  connector: Connector;
  name: string;
  status: string;
  is_default: boolean;
  last_sync_at?: string;
  created_at: string;
}

export async function listConnectors(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Connector[] }>('/connectors/');
  return response.data.results;
}

export async function listConnectorAccounts(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: ConnectorAccount[] }>('/connector-accounts/');
  return response.data.results;
}

export async function createConnectorAccount(
  client: ReturnType<typeof useApiClient>,
  connectorId: string,
  config: Record<string, unknown>
) {
  const name = typeof config.name === 'string' ? config.name : '';
  const response = await client.post<ConnectorAccount>('/connector-accounts/', {
    connector: connectorId,
    name,
  });
  return response.data;
}

export async function testConnectorAccount(client: ReturnType<typeof useApiClient>, accountId: string) {
  const response = await client.post<Record<string, unknown>>(`/connector-accounts/${accountId}/test/`);
  return response.data;
}

export async function deleteConnectorAccount(client: ReturnType<typeof useApiClient>, accountId: string) {
  await client.delete(`/connector-accounts/${accountId}/`);
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  created_at: string;
}

export async function listWebhooks(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Webhook[] }>('/webhooks/');
  return response.data.results;
}

export async function createWebhook(client: ReturnType<typeof useApiClient>, data: { url: string; events: string[] }) {
  const response = await client.post<Webhook>('/webhooks/', data);
  return response.data;
}