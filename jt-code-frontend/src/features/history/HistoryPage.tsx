import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components';
import { MessageSquare, Trash2, Clock } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  messages: number;
  updatedAt: string;
}

const CHAT_HISTORY_KEY = 'jt-code-chat-history';

function formatRelativeTime(iso: string, locale: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diffMs < 60_000) return rtf.format(-Math.round(diffMs / 1000), 'second');
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  return date.toLocaleDateString(locale);
}

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        setHistory(Array.isArray(parsed) ? (parsed as HistoryItem[]) : []);
      }
    } catch {
      // ignore
    }
  }, []);

  function clearHistory() {
    if (confirm(t('history.clearConfirm'))) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setHistory([]);
    }
  }

  function removeItem(id: string) {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">{t('history.eyebrow')}</p>
          <h1>{t('history.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('history.subtitle')}</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="gap-1.5">
            <Trash2 size={16} /> {t('history.clearHistory')}
          </Button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <Clock size={40} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">{t('history.emptyTitle')}</h2>
          <p className="text-sm text-muted-foreground mb-5">{t('history.emptyDesc')}</p>
          <Link
            to="/app/chat"
            className="inline-flex items-center justify-center rounded-md bg-secondary text-foreground px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            {t('history.startChatting')}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {history.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <div className="p-2.5 rounded-md bg-secondary text-foreground">
                <MessageSquare size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.updatedAt, i18n.language)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 truncate">{item.preview}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('common.messagesCount', { count: item.messages })}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} aria-label={t('history.deleteItemAria', { title: item.title })}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
