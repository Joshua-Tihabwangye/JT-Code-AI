import { useState, useEffect, type ChangeEvent } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { generateImage, understandImage, editImage } from '@/features/image/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Alert, Spinner, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import { Plus, Download, Upload, X, Image as ImageIcon } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
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
        createdAt: new Date().toISOString(),
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
          prompt: `Edit: ${prompt}`,
          createdAt: new Date().toISOString(),
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

    if (generatedImages.length > 0 && (activeTab === 'generate' || (activeTab === 'edit' && generatedImages.some(img => img.prompt.startsWith('Edit:'))))) {
      const displayImages = activeTab === 'edit'
        ? generatedImages.filter(img => img.prompt.startsWith('Edit:'))
        : generatedImages;

      if (displayImages.length > 0) {
        const firstImage = displayImages[0];
        return (
          <div className="space-y-4">
            <div className="image-preview-area">
              {firstImage && (
                <img
                  src={firstImage.url}
                  alt={firstImage.prompt}
                  className="max-w-full max-h-[400px] rounded-lg object-contain"
                />
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="image-gallery">
                {displayImages.slice(1).map((img) => (
                  <div key={img.id} className="image-thumb group">
                    <img src={img.url} alt={img.prompt} />
                    <button
                      type="button"
                      className="download-btn absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => window.open(img.url, '_blank')}
                    >
                      <Download size={14} />
                    </button>
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
            <img src={inputImagePreview} alt="Preview" className="max-w-full max-h-[400px] rounded-lg object-contain" />
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

  return (
    <div className="page-container">
      <header className="workspace-header mb-6">
        <div>
          <p className="eyebrow">IMAGE STUDIO</p>
          <h1 className="text-2xl font-bold text-foreground">Image Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and edit images with the power of AI.</p>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="generate" className="gap-2">
            <Plus size={14} /> Generate
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <ImageIcon size={14} /> Edit
          </TabsTrigger>
          <TabsTrigger value="understand" className="gap-2">
            <Download size={14} style={{ transform: 'rotate(180deg)' }} /> Understand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="image-studio-grid">
            {/* Left Panel */}
            <div className="space-y-4">
              <Textarea
                label="Prompt"
                placeholder="A futuristic cityscape at sunset, neon lights, cyberpunk style..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />

              <div className="space-y-3">
                <Textarea
                  label="Negative prompt (optional)"
                  placeholder="Things to avoid: blurry, low quality, distorted..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                />

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {sizes.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {styles.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Count</label>
                  <select
                    value={imageCount}
                    onChange={(e) => setImageCount(parseInt(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Plus size={14} style={{ transform: showMoreOptions ? 'rotate(45deg)' : 'none' }} />
                  More options
                </button>

                {showMoreOptions && (
                  <div className="space-y-3 pt-2">
                    <Input label="Seed (optional)" placeholder="Leave blank for random" type="number" />
                  </div>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={busy || !prompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {busy ? <Spinner size="sm" /> : 'Generate Image'}
              </Button>
            </div>

            {/* Right Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPreviewArea()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="image-studio-grid">
            <div className="space-y-4">
              {!inputImagePreview ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary"
                  onClick={() => document.getElementById('image-edit-upload')?.click()}
                >
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload an image to edit</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                  <input
                    id="image-edit-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={inputImagePreview} alt="Upload preview" className="w-full rounded-lg max-h-[200px] object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <Textarea
                label="Edit prompt"
                placeholder="Change the background to a beach at sunset..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sizes.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleEdit}
                disabled={busy || !inputImage || !prompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {busy ? <Spinner size="sm" /> : 'Edit Image'}
              </Button>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Edited Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedImages.filter(img => img.prompt.startsWith('Edit:')).length > 0 ? (
                    (() => {
                      const edit = generatedImages.filter(img => img.prompt.startsWith('Edit:'))[0];
                      return edit ? (
                        <img
                          src={edit.url}
                          alt="Edited result"
                          className="w-full rounded-lg object-contain max-h-[400px]"
                        />
                      ) : null;
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
          </div>
        </TabsContent>

        <TabsContent value="understand">
          <div className="image-studio-grid">
            <div className="space-y-4">
              {!inputImagePreview ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary"
                  onClick={() => document.getElementById('image-understand-upload')?.click()}
                >
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload an image to analyze</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                  <input
                    id="image-understand-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={inputImagePreview} alt="Upload preview" className="w-full rounded-lg max-h-[200px] object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <Textarea
                label="Question (optional)"
                placeholder="What is in this image? Describe it in detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />

              <Button
                onClick={handleUnderstand}
                disabled={busy || !inputImage}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {busy ? <Spinner size="sm" /> : 'Analyze Image'}
              </Button>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {understandingResult ? (
                    <div className="prose max-w-none text-sm whitespace-pre-wrap">
                      {understandingResult}
                    </div>
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Suggestions */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggested templates</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setPrompt(prev => prev + ` ${template.label.toLowerCase()}`)}
              className="px-3 py-1.5 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-muted/50 transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
