import { useState, type FormEvent } from 'react';

interface Props {
  disabled?: boolean;
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
}

export function ChatComposer({ disabled = false, onSubmit, placeholder = 'Ask JT-Code anything…' }: Props) {
  const [text, setText] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    setText('');
    await onSubmit(value);
  }

  return (
    <form className="composer" onSubmit={(event) => void submit(event)}>
      <label className="sr-only" htmlFor="jt-code-prompt">Message JT-Code</label>
      <textarea
        id="jt-code-prompt"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button className="button primary" type="submit" disabled={disabled || !text.trim()}>
        {disabled ? 'Working…' : 'Send'}
      </button>
    </form>
  );
}
