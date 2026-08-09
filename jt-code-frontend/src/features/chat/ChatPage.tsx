import { useRef, useState, useEffect, useCallback } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { ChatComposer } from '@/features/chat/ChatComposer';
import { createChatRequest, createConversation, streamChatRequest, getConversations } from '@/features/chat/api';
import { Button, ScrollArea, Avatar, Badge, Dropdown, DropdownItem } from '@/shared/components';
import type { ChatRequest, Conversation } from '@/features/chat/types';
import { MessageRole, CHAT_REQUEST_STATUS } from '@/shared/constants';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  metadata?: Record<string, unknown>;
}

export function ChatPage() {
  const client = useApiClient();
  const conversationId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello! I am JT-Code. What are we building today?', status: 'complete' },
  ]);
  const [busy, setBusy] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await getConversations(client);
      setConversations(data.results || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  async function send(text: string) {
    setBusy(true);
    const userMessageId = crypto.randomUUID();
    setMessages((current) => [...current, { id: userMessageId, role: 'user', content: text, status: 'complete' }]);

    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }]);

    try {
      if (!conversationId.current) {
        conversationId.current = (await createConversation(client)).id;
        loadConversations();
      }

      const request = await createChatRequest(client, {
        conversationId: conversationId.current!,
        chatInput: text,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
      });

      await streamChatRequest(client, request.id, ({ type, data }) => {
        setMessages((current) => current.map((message) => {
          if (message.id !== assistantId) return message;
          if (type === 'failed') {
            return { ...message, content: data.message ?? 'The request failed.', status: 'error' };
          }
          const updated = data as Partial<ChatRequest>;
          return { ...message, content: updated.outputText || `Status: ${updated.status ?? 'running'}…`, status: 'streaming' };
        }));
      });

      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, status: 'complete' } : message
      ));
    } catch (error) {
      setMessages((current) => current.map((message) =>
        message.id === assistantId
          ? { ...message, content: apiErrorMessage(error), status: 'error' }
          : message
      ));
    } finally {
      setBusy(false);
    }
  }

  async function handleNewChat() {
    conversationId.current = null;
    setMessages([
      { id: 'welcome', role: 'assistant', content: 'Hello! I am JT-Code. What are we building today?', status: 'complete' },
    ]);
    setShowNewChat(false);
  }

  return (
    <section className="workspace chat-workspace">
      <div className="flex h-full flex-col">
        <header className="workspace-header">
          <div className="flex-1">
            <p className="eyebrow">JT-CODE</p>
            <h1>
              {conversationId.current ? 'Conversation' : 'New Chat'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown trigger={<Button variant="ghost" size="sm">{selectedModel} <span>▼</span></Button>} content={
              <>
                {models.map(model => (
                  <DropdownItem key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelSelector(false); }}>
                    <span className="flex items-center gap-2">
                      {model.name}
                      <Badge variant="secondary" className="ml-auto text-xs">{model.provider}</Badge>
                    </span>
                  </DropdownItem>
                ))}
              </>
            } align="right" />
            <Button variant="ghost" size="sm" onClick={() => setShowNewChat(true)}>
              <span>➕</span> New Chat
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="message-list" aria-live="polite">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`message ${message.role}`}
                  style={{ opacity: message.status === 'streaming' ? 0.9 : 1 }}
                >
                  <div className="flex gap-3">
                    <Avatar
                      size="sm"
                      fallback={message.role === 'assistant' ? 'JT' : 'U'}
                      className={message.role === 'assistant' ? 'bg-primary' : 'bg-secondary'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="message-role">
                          {message.role === 'assistant' ? 'JT-Code' : message.role === 'user' ? 'You' : message.role}
                        </span>
                        {message.status === 'streaming' && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Streaming...
                          </span>
                        )}
                        {message.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">Error</Badge>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </article>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <ChatComposer
          disabled={busy}
          onSubmit={send}
          placeholder={busy ? 'Processing...' : 'Message JT-Code...'}
        />
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowNewChat(false)}>
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Start New Chat?</h2>
            <p className="text-muted-foreground mb-6">Your current conversation will be saved. You can continue it later from the history.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowNewChat(false)}>Cancel</Button>
              <Button onClick={handleNewChat}>New Chat</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}