import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/components';
import { MessageSquare, Trash2, Clock } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  messages: number;
  updatedAt: string;
}

const CHAT_HISTORY_KEY = 'jt-code-chat-history';

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  function clearHistory() {
    if (confirm('Clear all chat history?')) {
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
          <p className="eyebrow">History</p>
          <h1>History</h1>
          <p className="text-sm text-muted-foreground mt-1">Your recent chats and sessions.</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="gap-1.5">
            <Trash2 size={16} /> Clear history
          </Button>
        )}
      </header>

      {history.length === 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-12 text-center">
            <Clock size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <h2 className="text-base font-semibold text-foreground mb-1">No history yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Start a chat and your conversations will appear here.</p>
            <Button asChild>
              <Link to="/app/chat">Start chatting</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {history.map((item) => (
            <Card key={item.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-md bg-secondary text-secondary-foreground">
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(item.updatedAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.preview}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.messages} messages</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
