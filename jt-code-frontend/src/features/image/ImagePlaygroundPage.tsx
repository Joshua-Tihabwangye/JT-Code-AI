import { useState, type ChangeEvent } from 'react';
import { useApiClient, apiErrorMessage } from '@/lib/api/client';
import { generateImage, understandImage, editImage } from '@/features/image/api';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Alert, Spinner, Badge, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import { formatDate } from '@/shared/utils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
}

export function ImagePlaygroundPage() {
  const client = useApiClient();
  const [activeTab, setActiveTab] = useState<'generate' | 'understand' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('gpt-image-1');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [imageCount, setImageCount] = useState(1);
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [understandingResult, setUnderstandingResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const models = [
    { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'OpenAI' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI' },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'Stability AI' },
    { id: 'midjourney-v6', name: 'Midjourney v6', provider: 'Midjourney' },
  ];

  const sizes = [
    { value: '1024x1024', label: '1024×1024 (Square)' },
    { value: '1792x1024', label: '1792×1024 (Landscape)' },
    { value: '1024x1792', label: '1024×1792 (Portrait)' },
  ];

  const qualities = [
    { value: 'standard', label: 'Standard' },
    { value: 'hd', label: 'HD' },
    { value: '4k', label: '4K (Premium)' },
  ];

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setInputImage(file);
    setInputImagePreview(URL.createObjectURL(file));
    setError('');
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
        model,
        size,
        quality,
        n: imageCount,
      });

      const newImages: GeneratedImage[] = result.data.map((img, i) => ({
        id: crypto.randomUUID(),
        url: img.url || img.b64_json || '',
        prompt,
        model,
        createdAt: new Date().toISOString(),
      }));

      setGeneratedImages((prev) => [...newImages, ...prev]);
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
      const result = await understandImage(client, inputImage, prompt || 'Describe this image in detail');
      setUnderstandingResult(result.description || result.text || 'No result');
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
      const result = await editImage(client, inputImage, prompt, { model, size, n: 1 });
      if (result.data?.[0]?.url) {
        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          url: result.data[0].url,
          prompt: `Edit: ${prompt}`,
          model,
          createdAt: new Date().toISOString(),
        };
        setGeneratedImages((prev) => [newImage, ...prev]);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const tabs = [
    { id: 'generate', label: 'Generate', icon: '✨' },
    { id: 'understand', label: 'Understand', icon: '🔍' },
    { id: 'edit', label: 'Edit', icon: '✏️' },
  ];

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">IMAGE PLAYGROUND</p>
          <h1>Image Playground</h1>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <span>{tab.icon}</span> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    label="Prompt"
                    placeholder="A futuristic cityscape at sunset, neon lights, cyberpunk style..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <Textarea
                    label="Negative Prompt (optional)"
                    placeholder="Things to avoid: blurry, low quality, distorted..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                  />
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Model</label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Size</label>
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
                      <label className="block text-sm font-medium mb-1">Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {qualities.map((q) => (
                          <option key={q.value} value={q.value}>{q.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Count</label>
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
                  </div>
                  <Button onClick={handleGenerate} disabled={busy || !prompt.trim()} className="w-full" size="lg">
                    {busy ? <Spinner size="sm" /> : 'Generate Images'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedImages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No images generated yet</p>
                      <p className="text-sm mt-1">Enter a prompt and click Generate</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {generatedImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-4">
                            <div className="text-center">
                              <p className="text-sm font-medium truncate">{img.prompt.slice(0, 50)}...</p>
                              <p className="text-xs text-muted-foreground mt-1">{img.model} • {formatDate(img.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="understand">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Understand Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center" onClick={() => document.getElementById('understand-image-input')?.click()}>
                  {inputImagePreview ? (
                    <img src={inputImagePreview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded" />
                  ) : (
                    <>
                      <input id="understand-image-input" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <p className="text-muted-foreground">Click to upload an image</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                    </>
                  )}
                </div>
                <Textarea
                  label="Question (optional)"
                  placeholder="What is in this image? Describe it in detail..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleUnderstand} disabled={busy || !inputImage} className="w-full" size="lg">
                  {busy ? <Spinner size="sm" /> : 'Analyze Image'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
              </CardHeader>
              <CardContent>
                {understandingResult ? (
                  <div className="prose max-w-none">{understandingResult}</div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Upload an image and click Analyze to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center" onClick={() => document.getElementById('edit-image-input')?.click()}>
                  {inputImagePreview ? (
                    <img src={inputImagePreview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded" />
                  ) : (
                    <>
                      <input id="edit-image-input" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <p className="text-muted-foreground">Click to upload an image</p>
                    </>
                  )}
                </div>
                <Textarea
                  label="Edit Prompt"
                  placeholder="Change the background to a beach at sunset..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {sizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={handleEdit} disabled={busy || !inputImage || !prompt.trim()} className="w-full" size="lg">
                  {busy ? <Spinner size="sm" /> : 'Edit Image'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edited Image</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 && generatedImages[0].prompt.startsWith('Edit:') ? (
                  <img src={generatedImages[0].url} alt="Edited" className="w-full aspect-square object-cover rounded-lg" />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Upload an image, describe the edit, and click Edit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}