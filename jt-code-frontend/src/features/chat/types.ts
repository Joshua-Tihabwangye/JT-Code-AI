export type ChatRequestStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  id: string;
  conversationId: string;
  status: ChatRequestStatus;
  taskType: string;
  inputText: string;
  outputText: string;
  errorCode: string;
  traceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatStreamEvent {
  type: 'status' | 'completed' | 'failed' | 'heartbeat';
  data: Partial<ChatRequest> & { message?: string };
}
