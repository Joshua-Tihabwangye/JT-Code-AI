import { useRef, useState } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { ChatComposer } from '@/features/chat/ChatComposer';
import { createChatRequest, createConversation, streamChatRequest } from '@/features/chat/api';
import type { ChatRequest } from '@/features/chat/types';

interface LocalMessage { id: string; role: 'user' | 'assistant' | 'system'; content: string; }

export function ChatPage() {
  const client = useApiClient();
  const conversationId = useRef<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello. I am JT-Code. What are we building today?' },
  ]);
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    setBusy(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: text }]);
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: assistantId, role: 'assistant', content: 'Queued…' }]);

    try {
      if (!conversationId.current) {
        conversationId.current = (await createConversation(client)).id;
      }
      const request = await createChatRequest(client, {
        conversationId: conversationId.current,
        chatInput: text,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
      });

      await streamChatRequest(client, request.id, ({ type, data }) => {
        setMessages((current) => current.map((message) => {
          if (message.id !== assistantId) return message;
          if (type === 'failed') return { ...message, content: data.message ?? 'The request failed.' };
          const updated = data as Partial<ChatRequest>;
          return { ...message, content: updated.outputText || `Status: ${updated.status ?? 'running'}…` };
        }));
      });
    } catch (error) {
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, content: apiErrorMessage(error) } : message,
      ));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace chat-workspace">
      <header className="workspace-header"><div><p className="eyebrow">JT-CODE</p><h1>Conversation</h1></div></header>
      <div className="message-list" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`message ${message.role}`}>
            <span className="message-role">{message.role === 'assistant' ? 'JT-Code' : message.role}</span>
            <p>{message.content}</p>
          </article>
        ))}
      </div>
      <ChatComposer disabled={busy} onSubmit={send} />
    </section>
  );
}
