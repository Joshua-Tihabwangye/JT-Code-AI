import type { useApiClient } from '@/lib/api/client';

export interface Asset {
  id: string;
  originalFilename: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  bytes: number;
  status: string;
  createdAt: string;
}

export async function listAssets(client: ReturnType<typeof useApiClient>) {
  const response = await client.get<{ results: Asset[] }>('/files/');
  return response.data.results;
}

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
}

export async function uploadAsset(client: ReturnType<typeof useApiClient>, file: File) {
  const signResponse = await client.post<SignatureResponse>('/files/signature/', {
    originalFilename: file.name,
    contentType: file.type,
    bytes: file.size,
  });

  const { apiKey, timestamp, signature, folder, uploadUrl } = signResponse.data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  if (!uploadResponse.ok) {
    throw new Error('Cloudinary upload failed');
  }
  const uploaded = (await uploadResponse.json()) as {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    version: number;
  };

  const completeResponse = await client.post<Asset>('/files/complete/', {
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    resourceType: uploaded.resource_type,
    format: uploaded.format,
    bytes: uploaded.bytes,
    version: uploaded.version,
    originalFilename: file.name,
  });

  return completeResponse.data;
}

export async function signAssetUpload(client: ReturnType<typeof useApiClient>, file: File) {
  const response = await client.post<SignatureResponse>('/files/signature/', {
    originalFilename: file.name,
    contentType: file.type,
    bytes: file.size,
  });
  return response.data;
}