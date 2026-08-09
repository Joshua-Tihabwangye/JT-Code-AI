export interface Asset {
  id: string;
  originalFilename: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  status: string;
  createdAt: string;
}

export interface CloudinarySignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes: number;
  version: number;
  original_filename: string;
}
