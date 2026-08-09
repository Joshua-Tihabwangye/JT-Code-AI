import { useApiClient } from '@/lib/api/client';

export interface Connector {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  auth_type: string;
  icon?: string;
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
  const response = await client.get<{ results: Connector[] }>('/integrations/connectors/');
  return response.data.results;
}

export async function listConnectorAccounts(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: ConnectorAccount[] }>('/integrations/accounts/');
  return response.data.results;
}

export async function createConnectorAccount(
  client: ReturnType<typeof useApiClient>,
  connectorId: string,
  config: Record<string, unknown>
) {
  const response = await client.post<ConnectorAccount>(`/integrations/connectors/${connectorId}/connect/`, config);
  return response.data;
}

export async function testConnectorAccount(client: ReturnType<typeof useApiClient>, accountId: string) {
  const response = await client.post(`/integrations/accounts/${accountId}/test/`);
  return response.data;
}

export async function deleteConnectorAccount(client: ReturnType<typeof useApiClient>, accountId: string) {
  await client.delete(`/integrations/accounts/${accountId}/`);
}

export async function listWebhooks(client: ReturnType<typeof useApiClient>) {
  const response = await client.get('/integrations/webhooks/');
  return response.data;
}

export async function createWebhook(client: ReturnType<typeof useApiClient>, data: { url: string; events: string[] }) {
  const response = await client.post('/integrations/webhooks/', data);
  return response.data;
}