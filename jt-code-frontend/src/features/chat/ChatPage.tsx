import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { ChatComposer } from '@/features/chat/ChatComposer';
import { ChatBackground } from '@/features/chat/ChatBackground';
import { createChatRequest, createConversation, streamChatRequest, getConversations } from '@/features/chat/api';
import { Button, ScrollArea, Avatar, Badge } from '@/shared/components';
import type { ChatRequest, Conversation } from '@/features/chat/types';
import { useBillingStore } from '@/features/billing/store';
import { Sparkles, Plus } from 'lucide-react';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  metadata?: Record<string, unknown>;
}

const CHAT_HISTORY_KEY = 'jt-code-chat-history';

function saveChatSession(messages: LocalMessage[], conversationId: string | null) {
  if (!conversationId || messages.length <= 1) return;
  const title = messages.find((m) => m.role === 'user')?.content.slice(0, 60) || 'New chat';
  const lastAssistant = [...messages].reverse().find((m: LocalMessage) => m.role === 'assistant' && m.status === 'complete');
  const preview = lastAssistant?.content.slice(0, 120) || '';
  const item = {
    id: conversationId,
    title,
    preview,
    messages: messages.length,
    updatedAt: new Date().toISOString(),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]') as unknown[];
    const filtered = Array.isArray(saved) ? saved.filter((s: unknown) => {
      const record = s as { id?: string };
      return record.id !== item.id;
    }) : [];
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([item, ...filtered].slice(0, 50)));
  } catch {
    // ignore
  }
}

function useTypingText(text: string, speed = 60) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

export function ChatPage() {
  const { t } = useTranslation();
  const client = useApiClient();
  const conversationId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 'welcome', role: 'assistant', content: t('chat.welcome'), status: 'complete' },
  ]);
  const [busy, setBusy] = useState(false);
  const [, setConversations] = useState<Conversation[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  const headline = useTypingText(t('chat.headline'), 160);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations(client);
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [client]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  async function send(text: string) {
    setBusy(true);
    const userMessageId = crypto.randomUUID();
    setMessages((current) => [...current, { id: userMessageId, role: 'user', content: text, status: 'complete' }]);
    useBillingStore.getState().consumeCredits(5, 'Chat');

    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }]);

    try {
      if (!conversationId.current) {
        const conversation = await createConversation(client);
        conversationId.current = conversation.id;
        void loadConversations();
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
          if (type === 'failed') {
            const errorData = data as { message?: string };
            return { ...message, content: errorData.message ?? t('chat.requestFailed'), status: 'error' };
          }
          const updated = data as Partial<ChatRequest>;
          return { ...message, content: updated.outputText || t('chat.statusRunning', { status: updated.status ?? 'running' }), status: 'streaming' };
        }));
      });

      setMessages((current) => {
        const updated: LocalMessage[] = current.map((message) =>
          message.id === assistantId ? { ...message, status: 'complete' } : message
        );
        saveChatSession(updated, conversationId.current);
        return updated;
      });
    } catch (error) {
      setMessages((current) => {
        const updated: LocalMessage[] = current.map((message) =>
          message.id === assistantId
            ? { ...message, content: apiErrorMessage(error), status: 'error' }
            : message
        );
        saveChatSession(updated, conversationId.current);
        return updated;
      });
    } finally {
      setBusy(false);
    }
  }

  function handleNewChat() {
    saveChatSession(messages, conversationId.current);
    conversationId.current = null;
    setMessages([
      { id: 'welcome', role: 'assistant', content: t('chat.welcome'), status: 'complete' },
    ]);
    setShowNewChat(false);
  }

  const isEmpty = messages.length <= 1;

  return (
    <section className="chat-workspace">
      <ChatBackground />

      {isEmpty ? (
        <div className="chat-empty">
          <div className="pointer-events-none absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.08] dark:opacity-[0.18] blur-3xl" />

          <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm text-secondary-foreground text-xs font-medium border border-border">
            <Sparkles size={14} className="text-primary" />
            {t('chat.badge')}
          </div>

          <h1 className="chat-headline relative">
            {headline.displayed}
            {!headline.done && <span className="chat-cursor" />}
          </h1>

          <p className="chat-subhead relative">
            {t('chat.subhead')}
          </p>

          <div className="relative w-full max-w-[720px]">
            <ChatComposer disabled={busy} onSubmit={send} placeholder={t('chat.composerPlaceholder')} />
          </div>

           <div className="relative flex flex-wrap items-center justify-center gap-2" />
        </div>
      ) : (
        <>
          <header className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-card/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {conversationId.current ? t('chat.conversation') : t('chat.newChat')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">GPT-4o</Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowNewChat(true)}>
                <Plus size={16} className="mr-1" /> {t('chat.newChat')}
              </Button>
            </div>
          </header>

          <div className="chat-scroll">
            <ScrollArea className="h-full">
              <div className="message-list" aria-live="polite">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`message ${message.role} ${message.status ?? ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          size="sm"
                          fallback={message.role === 'assistant' ? 'JT' : 'U'}
                          className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
                        />
                        {message.role === 'assistant' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="message-role">
                            {message.role === 'assistant' ? 'JT-Code' : message.role === 'user' ? t('chat.you') : message.role}
                          </span>
                          {message.status === 'streaming' && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              {t('chat.streaming')}
                            </span>
                          )}
                          {message.status === 'error' && (
                            <Badge variant="destructive" className="text-xs">{t('chat.errorBadge')}</Badge>
                          )}
                        </div>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </article>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="relative z-10 p-4 border-t border-border bg-card/70 backdrop-blur-sm">
            <ChatComposer disabled={busy} onSubmit={send} placeholder={busy ? t('chat.composerPlaceholderBusy') : t('chat.composerPlaceholder')} />
          </div>
        </>
      )}

      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowNewChat(false)}>
          <div className="w-full max-w-md rounded-xl bg-card text-card-foreground p-6 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">{t('chat.startNewChatTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('chat.startNewChatDesc')}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowNewChat(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleNewChat}>{t('chat.newChat')}</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
