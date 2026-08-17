import type { useApiClient } from '@/lib/api/client';

export interface Document {
  id: string;
  title: string;
  template: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRenderResult {
  download_url: string;
  format: string;
  pages: number;
}

export async function listDocuments(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Document[] }>('/documents/');
  return response.data;
}

export async function createDocument(client: ReturnType<typeof useApiClient>, data: { title: string; template: string; content: string }) {
  const response = await client.post<Document>('/documents/', data);
  return response.data;
}

export async function getDocument(client: ReturnType<typeof useApiClient>, id: string) {
  const response = await client.get<Document>(`/documents/${id}/`);
  return response.data;
}

export async function updateDocument(client: ReturnType<typeof useApiClient>, id: string, data: Partial<Document>) {
  const response = await client.patch<Document>(`/documents/${id}/`, data);
  return response.data;
}

export async function renderDocument(client: ReturnType<typeof useApiClient>, id: string, format: string = 'pdf') {
  const response = await client.post<DocumentRenderResult>(`/documents/${id}/render/`, { format });
  return response.data;
}

export async function deleteDocument(client: ReturnType<typeof useApiClient>, id: string) {
  await client.delete(`/documents/${id}/`);
}