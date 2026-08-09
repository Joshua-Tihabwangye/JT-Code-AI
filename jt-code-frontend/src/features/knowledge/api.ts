import { useApiClient } from '@/lib/api/client';

export interface Collection {
  id: string;
  name: string;
  description: string;
  embedding_provider: string;
  embedding_model: string;
  document_count: number;
  chunk_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  collection_id: string;
  source_type: string;
  name: string;
  status: string;
  document_count: number;
  last_synced_at?: string;
  created_at: string;
}

export async function listCollections(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Collection[] }>('/knowledge/collections/');
  return response.data;
}

export async function createCollection(client: ReturnType<typeof useApiClient>, data: Partial<Collection>) {
  const response = await client.post<Collection>('/knowledge/collections/', data);
  return response.data;
}

export async function getCollection(client: ReturnType<typeof useApiClient>, id: string) {
  const response = await client.get<Collection>(`/knowledge/collections/${id}/`);
  return response.data;
}

export async function syncSource(client: ReturnType<typeof useApiClient>, sourceId: string) {
  const response = await client.post(`/knowledge/sources/${sourceId}/sync/`);
  return response.data;
}

export async function searchCollections(client: ReturnType<typeof useApiClient>, query: string, collectionIds: string[]) {
  const response = await client.post('/knowledge/search/', { query, collection_ids: collectionIds });
  return response.data;
}

export async function ragQuery(client: ReturnType<typeof useApiClient>, query: string, collectionIds: string[]) {
  const response = await client.post('/knowledge/rag/', { query, collection_ids: collectionIds });
  return response.data;
}