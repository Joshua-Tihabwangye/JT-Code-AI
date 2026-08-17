import type { useApiClient } from '@/lib/api/client';
import type { Conversation, ChatRequest } from './types';

export async function getConversations(client: ReturnType<typeof useApiClient>): Promise<Conversation[]> {
  const response = await client.get<{ results: Array<{ id: string; title: string; createdAt: string; updatedAt: string }> }>('/conversations/');
  return response.data.results.map(c => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
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
  const response = await client.post<ChatRequest>('/chat/requests/', data, {
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  });
  return response.data;
}

export async function streamChatRequest(
  client: ReturnType<typeof useApiClient>,
  requestId: string,
  onEvent: (event: { type: string; data: unknown }) => void
) {
  const response = await client.get<ReadableStream<Uint8Array>>(`/chat/requests/${requestId}/stream/`, {
    responseType: 'stream',
  });

  const reader = response.data.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventType = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          onEvent({ type: eventType, data: JSON.parse(line.slice(6)) });
        } catch {
          // Ignore parse errors
        }
        eventType = 'message';
      }
    }
  }
}