import { useRef, useState, useEffect, useCallback } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Send, Paperclip, Image as ImageIcon, FileText, X } from 'lucide-react';
import { createChatRequest, createConversation, streamChatRequest } from '@/features/chat/api';
import { getSubscription } from '@/features/billing/api';
import type { ChatRequest } from '@/features/chat/types';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const subscription = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getSubscription(client),
  });

  const planLabel = subscription.data?.plan_name
    ? `${subscription.data?.plan_name} plan`
    : 'Free plan';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);

    const userMessageId = crypto.randomUUID();
    setMessages((current) => [...current, { id: userMessageId, role: 'user', content: text, status: 'complete' }]);

    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }]);

    try {
      if (!conversationId.current) {
        const conversation = await createConversation(client);
        conversationId.current = conversation.id;
      }

      const request = await createChatRequest(client, {
        conversationId: conversationId.current,
        chatInput: text,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
      });

      await streamChatRequest(client, request.id, ({ type, data }) => {
        setMessages((current) =>
          current.map((message) => {
            if (message.id !== assistantId) return message;
            if (type === 'failed') {
              const errorData = data as { message?: string };
              return { ...message, content: errorData.message ?? 'The request failed.', status: 'error' };
            }
            const updated = data as Partial<ChatRequest>;
            return {
              ...message,
              content: updated.outputText || (updated.status ? `Status: ${updated.status}…` : ''),
              status: 'streaming',
            };
          })
        );
      });

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, status: 'complete' } : message
        )
      );
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: apiErrorMessage(error), status: 'error' }
            : message
        )
      );
    } finally {
      setBusy(false);
    }
  }

  const handleSend = () => {
    const value = input.trim();
    if (!value || busy) return;
    setInput('');
    setAttachments([]);
    void send(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const handleAttach = (type: 'document' | 'image') => {
    setShowAttachMenu(false);
    if (type === 'document') {
      documentInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setAttachments((current) => [...current, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, i) => i !== index));
  };

  const composer = (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        {attachments.length > 0 && (
          <div className="chat-attachments">
            {attachments.map((file, index) => (
              <span key={`${file.name}-${index}`} className="chat-attachment-chip">
                {file.type.startsWith('image/') ? <ImageIcon size={12} /> : <FileText size={12} />}
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => removeAttachment(index)} title="Remove">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="chat-input-field"
          placeholder="Ask JT-Code..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          disabled={busy}
          rows={1}
        />

        <div className="chat-input-toolbar">
          <div className="chat-input-toolbar-left">
            <div className="chat-attach">
              <button
                type="button"
                className="chat-input-icon"
                title="Attach"
                onClick={() => setShowAttachMenu((v) => !v)}
              >
                <Plus size={18} />
              </button>
              {showAttachMenu && (
                <div className="chat-attach-menu">
                  <button type="button" onClick={() => handleAttach('document')}>
                    <Paperclip size={14} />
                    Attach a document
                  </button>
                  <button type="button" onClick={() => handleAttach('image')}>
                    <ImageIcon size={14} />
                    Attach an image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="chat-input-toolbar-center">
            <span className="chat-plan-label">{planLabel}</span>
          </div>

          <div className="chat-input-toolbar-right">
            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={busy || !input.trim()}
              title="Send message"
            >
              {busy ? '…' : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,.csv"
        multiple
        className="sr-only"
        onChange={(e) => onFilesSelected(e.target.files)}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => onFilesSelected(e.target.files)}
      />
    </div>
  );

  return (
    <div className="chat-page">
      {messages.length > 0 ? (
        <>
          <div className="chat-message-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.role} ${message.status}`}
              >
                {message.role === 'assistant' && <span className="role assistant">JT-Code</span>}
                {message.role === 'user' && <span className="role user">You</span>}
                <p>{message.content || '…'}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {composer}
        </>
      ) : (
        <div className="chat-empty">
          <h1 className="chat-headline">What should we build today?</h1>
          <p className="chat-subhead">
            Ask JT-Code about code, documents, research, or anything else.
          </p>
          {composer}
        </div>
      )}
    </div>
  );
}
