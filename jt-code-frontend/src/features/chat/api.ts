import { useApiClient } from '@/lib/api/client';
import type { Conversation, ChatRequest } from './types';

export async function getConversations(client: ReturnType<typeof useApiClient>): Promise<Conversation[]> {
  const response = await client.get<{ results: Array<{ id: string; title: string; created_at: string; updated_at: string }> }>('/conversations/');
  return response.data.results.map(c => ({
    id: c.id,
    title: c.title,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

export async function createConversation(client: ReturnType<typeof useApiClient>) {
  const response = await client.post<Conversation>('/conversations/', { title: 'New conversation' });
  return response.data;
}

export async function createChatRequest(
  client: ReturnType<typeof useApiClient>,
  data: { conversationId: string; chatInput: string; timezone: string; locale: string }
) {
  const response = await client.post<ChatRequest>('/conversations/chat/', data);
  return response.data;
}

export async function streamChatRequest(
  client: ReturnType<typeof useApiClient>,
  requestId: string,
  onEvent: (event: { type: string; data: unknown }) => void
) {
  const response = await client.get<ReadableStream>(`/conversations/chat/${requestId}/stream/`, {
    responseType: 'stream',
  });

  const reader = response.data.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6));
          onEvent(event);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}