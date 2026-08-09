import type { AxiosInstance } from 'axios';
import type { Asset, CloudinarySignature, CloudinaryUploadResponse } from '@/features/files/types';
import type { Paginated } from '@/lib/api/types';

export async function listAssets(client: AxiosInstance): Promise<Asset[]> {
  const { data } = await client.get<Paginated<Asset> | Asset[]>('/files/');
  return Array.isArray(data) ? data : data.results;
}

export async function uploadAsset(client: AxiosInstance, file: File): Promise<Asset> {
  const { data: signature } = await client.post<CloudinarySignature>('/files/signature/', {
    originalFilename: file.name,
    contentType: file.type || 'application/octet-stream',
    bytes: file.size,
  });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);

  const uploadResponse = await fetch(signature.uploadUrl, { method: 'POST', body: form });
  if (!uploadResponse.ok) throw new Error(`Cloudinary upload failed (${uploadResponse.status}).`);
  const uploaded = await uploadResponse.json() as CloudinaryUploadResponse;

  const { data } = await client.post<Asset>('/files/complete/', {
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    resourceType: uploaded.resource_type,
    format: uploaded.format ?? '',
    bytes: uploaded.bytes,
    version: uploaded.version,
    originalFilename: uploaded.original_filename || file.name,
  }, { headers: { 'Idempotency-Key': crypto.randomUUID() } });
  return data;
}
