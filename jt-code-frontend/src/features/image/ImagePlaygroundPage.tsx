import { useState, useEffect, type ChangeEvent } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { generateImage, understandImage, editImage } from '@/features/image/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Alert, Spinner, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import { Plus, Download, Upload, X, Image as ImageIcon, Wand2, ScanLine, PenTool, Trash2 } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: 'generate' | 'edit' | 'understand';
}

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  type: 'generate' | 'edit' | 'understand';
  size: string;
  style: string;
  count: number;
  timestamp: number;
}

const templates = [
  { id: 'photo', label: 'Photo' },
  { id: 'illustration', label: 'Illustration' },
  { id: '3d', label: '3D Render' },
  { id: 'logo', label: 'Logo' },
  { id: 'concept', label: 'Concept Art' },
];

const sizes = [
  { value: '1024x1024', label: 'Square 1024×1024' },
  { value: '1792x1024', label: 'Landscape 1792×1024' },
  { value: '1024x1792', label: 'Portrait 1024×1792' },
];

const styles = [
  { value: 'auto', label: 'Auto' },
  { value: 'vivid', label: 'Vivid' },
  { value: 'natural', label: 'Natural' },
];

const HISTORY_KEY = 'jt-code-image-history';

export function ImagePlaygroundPage() {
  const client = useApiClient();
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('auto');
  const [imageCount, setImageCount] = useState(1);
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [understandingResult, setUnderstandingResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore storage errors (e.g. quota exceeded)
    }
  }, [history]);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setInputImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setInputImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  }

  function clearImage() {
    setInputImage(null);
    setInputImagePreview(null);
  }

  function deleteHistoryItem(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  function clearHistory() {
    if (confirm('Are you sure you want to clear your image history?')) {
      setHistory([]);
    }
  }

  function restoreHistoryItem(item: HistoryItem) {
    setPrompt(item.prompt);
    if (item.type === 'generate') {
      setSize(item.size);
      setStyle(item.style);
      setImageCount(item.count);
      setActiveTab('generate');
    }
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await generateImage(client, {
        prompt,
        negative_prompt: negativePrompt || undefined,
        model: 'auto',
        size,
        quality: 'standard',
        n: imageCount,
      });
      const newImages: GeneratedImage[] = result.data.map((img) => ({
        id: crypto.randomUUID(),
        url: img.url || img.b64_json || '',
        prompt,
        type: 'generate',
      }));
      setGeneratedImages((prev) => [...newImages, ...prev]);
      const newHistoryItems: HistoryItem[] = newImages.map((img) => ({
        id: img.id,
        prompt,
        imageUrl: img.url,
        type: 'generate',
        size,
        style,
        count: imageCount,
        timestamp: Date.now(),
      }));
      setHistory((prev) => [...newHistoryItems, ...prev]);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnderstand() {
    if (!inputImage) {
      setError('Please upload an image first');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const question = prompt || 'Describe this image in detail';
      const result = await understandImage(client, inputImage, question);
      const description = result.description || result.text || 'No result';
      setUnderstandingResult(description);
      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt: question,
        imageUrl: inputImagePreview || '',
        type: 'understand',
        size,
        style,
        count: 1,
        timestamp: Date.now(),
      };
      setHistory((prev) => [historyItem, ...prev]);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit() {
    if (!inputImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await editImage(client, inputImage, prompt, { model: 'auto', size, n: 1 });
      if (result.data?.[0]?.url) {
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          url: result.data[0].url,
          prompt,
          type: 'edit',
        };
        setGeneratedImages((prev) => [newImage, ...prev]);
        const historyItem: HistoryItem = {
          id: newImage.id,
          prompt,
          imageUrl: newImage.url,
          type: 'edit',
          size,
          style,
          count: 1,
          timestamp: Date.now(),
        };
        setHistory((prev) => [historyItem, ...prev]);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function renderPreviewArea() {
    if (busy && !generatedImages.length) {
      return (
        <div className="image-preview-area">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Spinner size="lg" />
            <p className="text-sm">Generating your image…</p>
          </div>
        </div>
      );
    }

    if (generatedImages.length > 0 && (activeTab === 'generate' || (activeTab === 'edit' && generatedImages.some((img) => img.type === 'edit')))) {
      const displayImages = activeTab === 'edit'
        ? generatedImages.filter((img) => img.type === 'edit')
        : generatedImages;
      if (displayImages.length > 0) {
        const firstImage = displayImages[0];
        return (
          <div className="space-y-4">
            <div className="image-preview-area">
              {firstImage && <img src={firstImage.url} alt={firstImage.prompt} className="max-w-full max-h-[400px] rounded-md object-contain" />}
            </div>
            {displayImages.length > 1 && (
              <div className="image-gallery">
                {displayImages.slice(1).map((img) => (
                  <div key={img.id} className="image-thumb group">
                    <img src={img.url} alt={img.prompt} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(img.url, '_blank')}
                      className="absolute top-2 right-2 w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }

    if (activeTab === 'understand') {
      return (
        <div className="image-preview-area">
          {understandingResult ? (
            <div className="text-left w-full">
              <h3 className="font-medium text-foreground mb-2">Analysis</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{understandingResult}</p>
            </div>
          ) : inputImagePreview ? (
            <img src={inputImagePreview} alt="Preview" className="max-w-full max-h-[400px] rounded-md object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ImageIcon size={48} className="text-muted-foreground/40" />
              <div>
                <p className="text-muted-foreground mb-1">Upload an image to get started</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="image-preview-area">
        <div className="flex flex-col items-center gap-3">
          <ImageIcon size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Your generated images will appear here</p>
        </div>
      </div>
    );
  }

  const selectClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all';

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Image Studio</p>
          <h1>Image Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and understand images with AI.</p>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="inline-flex h-auto w-auto p-1 bg-secondary rounded-md mb-6">
          <TabsTrigger value="generate" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-sm">
            <Wand2 size={16} /> Generate
          </TabsTrigger>
          <TabsTrigger value="edit" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-sm">
            <PenTool size={16} /> Edit
          </TabsTrigger>
          <TabsTrigger value="understand" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-sm">
            <ScanLine size={16} /> Understand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <Textarea label="Prompt" placeholder="A futuristic cityscape at sunset, neon lights, cyberpunk style..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
              <Textarea label="Negative prompt (optional)" placeholder="Things to avoid: blurry, low quality, distorted..." value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} rows={2} />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
                    {sizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className={selectClass}>
                    {styles.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Count</label>
                  <select value={imageCount} onChange={(e) => setImageCount(parseInt(e.target.value))} className={selectClass}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowMoreOptions(!showMoreOptions)} className="text-muted-foreground hover:text-foreground gap-1 px-0">
                <Plus size={14} style={{ transform: showMoreOptions ? 'rotate(45deg)' : 'none' }} /> More options
              </Button>
              {showMoreOptions && <Input label="Seed (optional)" placeholder="Leave blank for random" type="number" />}
              <Button onClick={() => void handleGenerate()} disabled={busy || !prompt.trim()} className="w-full" size="lg">
                {busy ? <Spinner size="sm" /> : 'Generate Image'}
              </Button>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>{renderPreviewArea()}</CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              {!inputImagePreview ? (
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-secondary/30" onClick={() => document.getElementById('image-edit-upload')?.click()}>
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload an image to edit</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                  <input id="image-edit-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img src={inputImagePreview} alt="Upload preview" className="w-full max-h-[200px] object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-7 h-7 p-0"
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              <Textarea label="Edit prompt" placeholder="Change the background to a beach at sunset..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Size</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
                  {sizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <Button onClick={() => void handleEdit()} disabled={busy || !inputImage || !prompt.trim()} className="w-full" size="lg">
                {busy ? <Spinner size="sm" /> : 'Edit Image'}
              </Button>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Edited Result</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImages.filter((img) => img.type === 'edit').length > 0 ? (
                  (() => {
                    const edit = generatedImages.filter((img) => img.type === 'edit')[0];
                    return edit ? <img src={edit.url} alt="Edited result" className="w-full rounded-md object-contain max-h-[400px]" /> : null;
                  })()
                ) : (
                  <div className="image-preview-area">
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon size={48} className="text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Upload an image, describe the edit, and click Edit</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="understand">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              {!inputImagePreview ? (
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-secondary/30" onClick={() => document.getElementById('image-understand-upload')?.click()}>
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload an image to analyze</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                  <input id="image-understand-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img src={inputImagePreview} alt="Upload preview" className="w-full max-h-[200px] object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-7 h-7 p-0"
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              <Textarea label="Question (optional)" placeholder="What is in this image? Describe it in detail..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
              <Button onClick={() => void handleUnderstand()} disabled={busy || !inputImage} className="w-full" size="lg">
                {busy ? <Spinner size="sm" /> : 'Analyze Image'}
              </Button>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent>
                {understandingResult ? (
                  <div className="prose max-w-none text-sm whitespace-pre-wrap text-foreground">{understandingResult}</div>
                ) : (
                  <div className="image-preview-area">
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon size={48} className="text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Upload an image and click Analyze to see results here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggested templates</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPrompt((prev) => `${prev} ${template.label.toLowerCase()}`.trim())}
              className="text-muted-foreground hover:text-primary hover:border-primary"
            >
              {template.label}
            </Button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">History</h3>
            <Button type="button" variant="ghost" size="sm" onClick={clearHistory}>
              Clear history
            </Button>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => restoreHistoryItem(item)}
                className="group relative rounded-md border border-border bg-card overflow-hidden cursor-pointer hover:border-primary hover:bg-secondary/30 transition-colors"
              >
                <div className="aspect-square w-full bg-muted/50">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-foreground line-clamp-2 font-medium">{item.prompt}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                        item.type === 'generate'
                          ? 'bg-primary/10 text-primary'
                          : item.type === 'edit'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="absolute top-2 right-2 w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
