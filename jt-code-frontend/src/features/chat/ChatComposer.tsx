import { useState, useRef, type FormEvent, type FocusEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Send, Paperclip, Image as ImageIcon, FileText, X, ChevronDown, Mic } from 'lucide-react';
import { useApiClient } from '@/lib/api/client';
import { getSubscription } from '@/features/billing/api';

interface Props {
  disabled?: boolean;
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
}

export function ChatComposer({ disabled = false, onSubmit, placeholder = 'Ask JT-Code anything…' }: Props) {
  const client = useApiClient();
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const subscription = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });
  const planName = subscription.data?.plan_name ?? 'Free';

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    setText('');
    setAttachments([]);
    await onSubmit(value);
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleAttach(type: 'document' | 'image') {
    setShowAttachMenu(false);
    if (type === 'document') documentInputRef.current?.click();
    else imageInputRef.current?.click();
  }

  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFormFocus(event: FocusEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(true);
    }
  }

  function handleFormBlur(event: FocusEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false);
    }
  }

  return (
    <form
      className="composer compact"
      onSubmit={(event) => void submit(event)}
      onFocus={handleFormFocus}
      onBlur={handleFormBlur}
      style={{
        borderColor: focused ? 'transparent' : undefined,
        boxShadow: focused ? '0 0 0 2px var(--ring)' : undefined,
      }}
    >
      <button
        type="button"
        className="icon"
        title="Attach"
        onClick={() => setShowAttachMenu((v) => !v)}
      >
        <Plus size={18} />
      </button>
      {showAttachMenu && (
        <div className="attach-menu">
          <button type="button" onClick={() => handleAttach('document')}>
            <Paperclip size={14} /> Attach a document
          </button>
          <button type="button" onClick={() => handleAttach('image')}>
            <ImageIcon size={14} /> Attach an image
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        id="jt-code-prompt"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          autoResize();
        }}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />

      <div className="composer-actions">
        <div className="composer-actions-center" title="Current plan">
          {planName} <ChevronDown size={12} />
        </div>

        <button className="icon" type="button" title="Voice input">
          <Mic size={18} />
        </button>

        <button className="send" type="submit" disabled={disabled || !text.trim()} title="Send message">
          <Send size={16} />
        </button>
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

      {attachments.length > 0 && (
        <div className="absolute -top-10 left-0 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground border border-border"
            >
              {file.type.startsWith('image/') ? <ImageIcon size={12} /> : <FileText size={12} />}
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button type="button" onClick={() => removeAttachment(index)} className="hover:text-foreground">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  );
}
