import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/shared/components';
import { MessageSquare, Image as ImageIcon, Files, FileText, CornerDownLeft } from 'lucide-react';
import { useRepositories } from '@/lib/data';
import type { Conversation, FileItem, AppDocument, ImageGeneration } from '@/lib/data';

type ResultType = 'chat' | 'image' | 'file' | 'document';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  to: string;
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const repos = useRepositories();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [images, setImages] = useState<ImageGeneration[]>([]);

  useEffect(() => {
    if (!open) return;
    let activeFetch = true;
    void Promise.all([
      repos.history.list({}),
      repos.files.list(),
      repos.documents.list(),
      repos.images.listGenerations(),
    ]).then(([c, f, d, i]) => {
      if (!activeFetch) return;
      setConversations(c);
      setFiles(f);
      setDocuments(d);
      setImages(i);
    });
    return () => {
      activeFetch = false;
    };
  }, [open, repos]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const match = (text: string) => !q || text.toLowerCase().includes(q);

    const chat: SearchResult[] = conversations
      .filter((c) => match(c.title) || match(c.preview))
      .map((c) => ({
        id: c.id,
        type: 'chat',
        title: c.title,
        subtitle: c.preview || t('search.conversation'),
        to: '/app/history',
      }));

    const image: SearchResult[] = images
      .filter((img) => match(img.prompt))
      .map((img) => ({
        id: img.id,
        type: 'image',
        title: img.prompt.slice(0, 60) || t('search.generatedImage'),
        subtitle: t('search.imageType', { style: img.style }),
        to: '/app/image',
      }));

    const file: SearchResult[] = files
      .filter((f) => match(f.name))
      .map((f) => ({ id: f.id, type: 'file', title: f.name, subtitle: t('search.file'), to: '/app/files' }));

    const document: SearchResult[] = documents
      .filter((d) => match(d.title))
      .map((d) => ({ id: d.id, type: 'document', title: d.title, subtitle: t('search.document'), to: '/app/documents' }));

    return [...chat, ...image, ...file, ...document].slice(0, 20);
  }, [query, conversations, images, files, documents, t]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const result = results[active];
        if (result) {
          void navigate(result.to);
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, active, navigate, onClose]);

  if (!open) return null;

  const icons = { chat: MessageSquare, image: ImageIcon, file: Files, document: FileText } as const;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-xl border border-border bg-background p-3 shadow-2xl" role="dialog" aria-modal="true" aria-label={t('common.search')}>
        <SearchInput
          autoFocus
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('search.placeholder')}
        />
        <div className="mt-2 max-h-[50vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">{t('search.noResults')}</div>
          ) : (
            results.map((result, index) => {
              const Icon = icons[result.type];
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${index === active ? 'bg-accent' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    void navigate(result.to);
                    onClose();
                  }}
                >
                  <Icon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{result.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span>
                  </span>
                  {index === active && <CornerDownLeft size={14} className="text-muted-foreground" aria-hidden />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
