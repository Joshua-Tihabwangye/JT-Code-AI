import type { AxiosInstance } from 'axios';
import type { ChatRequest, ChatStreamEvent, Conversation } from '@/features/chat/types';

export async function createConversation(client: AxiosInstance, title = 'New conversation'): Promise<Conversation> {
  const { data } = await client.post<Conversation>('/conversations/', { title });
  return data;
}

export async function createChatRequest(client: AxiosInstance, payload: {
  conversationId: string;
  chatInput: string;
  timezone: string;
  locale: string;
}): Promise<ChatRequest> {
  const { data } = await client.post<ChatRequest>('/chat/requests/', payload, {
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  });
  return data;
}

export async function streamChatRequest(
  client: AxiosInstance,
  requestId: string,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await client.get<ReadableStream<Uint8Array>>(`/chat/requests/${requestId}/stream/`, {
    responseType: 'stream',
    adapter: 'fetch',
    signal,
  });

  const stream = response.data;
  if (!(stream instanceof ReadableStream)) throw new Error('Streaming is not supported by this browser.');

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const eventLine = frame.split('\n').find((line) => line.startsWith('event:'));
      const dataLine = frame.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      const type = (eventLine?.slice(6).trim() ?? 'status') as ChatStreamEvent['type'];
      const data = JSON.parse(dataLine.slice(5).trim()) as ChatStreamEvent['data'];
      onEvent({ type, data });
    }
  }
}
