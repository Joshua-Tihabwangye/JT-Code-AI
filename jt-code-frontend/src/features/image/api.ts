import type { useApiClient } from '@/lib/api/client';

export interface GeneratedImage {
  url: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageGenerationResult {
  data: GeneratedImage[];
}

export interface ImageUnderstandingResult {
  description: string;
  text?: string;
  objects?: Array<{ label: string; confidence: number; bbox: number[] }>;
  text_content?: string;
}

export interface ImageEditResult {
  data: GeneratedImage[];
}

export async function generateImage(
  client: ReturnType<typeof useApiClient>,
  data: {
    prompt: string;
    negative_prompt?: string;
    model: string;
    size: string;
    quality: string;
    n: number;
  }
) {
  const response = await client.post<ImageGenerationResult>('/ai/image/generate/', data);
  return response.data;
}

export async function understandImage(
  client: ReturnType<typeof useApiClient>,
  file: File,
  prompt: string
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);

  const response = await client.post<ImageUnderstandingResult>('/ai/image/understand/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function editImage(
  client: ReturnType<typeof useApiClient>,
  file: File,
  prompt: string,
  options: { model?: string; size?: string; n?: number } = {}
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });

  const response = await client.post<ImageEditResult>('/ai/image/edit/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function listModels(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ models: Array<Record<string, unknown>> }>('/available-models/');
  return response.data.models;
}