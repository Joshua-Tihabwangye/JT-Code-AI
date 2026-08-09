import { useApiClient } from '@/lib/api/client';

export interface Asset {
  id: string;
  original_filename: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function listAssets(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Asset[] }>('/assets/');
  return response.data.results;
}

export async function uploadAsset(client: ReturnType<typeof useApiClient>, file: File) {
  // First get signed upload URL
  const signResponse = await client.post<{ upload_url: string; fields: Record<string, string> }>('/assets/signature/', {
    filename: file.name,
    content_type: file.type,
  });

  const { upload_url, fields } = signResponse.data;

  // Upload directly to Cloudinary
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append('file', file);

  await fetch(upload_url, {
    method: 'POST',
    body: formData,
  });

  // Complete the upload
  const completeResponse = await client.post<Asset>('/assets/complete/', {
    public_id: fields.key,
  });

  return completeResponse.data;
}

export async function signAssetUpload(client: ReturnType<typeof useApiClient>, file: File) {
  const response = await client.post<{ upload_url: string; fields: Record<string, string> }>('/assets/signature/', {
    filename: file.name,
    content_type: file.type,
  });
  return response.data;
}

export async function deleteAsset(client: ReturnType<typeof useApiClient>, assetId: string) {
  await client.delete(`/assets/${assetId}/`);
}