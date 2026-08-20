// Core domain model shared across all repositories and pages.
// Page components depend only on these types and the repository contracts,
// never on transport details (Axios / Supabase / IndexedDB).

export type DataMode = 'mock' | 'api';

export type PlanSlug = 'free' | 'pro' | 'team' | 'business';

export type CreditCategory = 'chat' | 'images' | 'documents' | 'agent';

export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  timezone: string;
  avatarUrl: string | null;
  createdAt: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  plan: PlanSlug;
}

export interface AccountUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  contact?: string;
  countryCode?: string;
  countryName?: string;
  dialCode?: string;
  timezone?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  priceCents: number;
  currency: string;
  interval: 'month' | 'year';
  monthlyCredits: number;
  isPopular: boolean;
  description: string;
  features: string[];
}

export type SubscriptionStatus = 'active' | 'canceled' | 'trialing' | 'past_due';

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: PlanSlug;
  planName: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  daysRemaining: number;
}

export interface Wallet {
  id: string;
  balance: number;
  reservedBalance: number;
  currency: string;
  creditValueUsd: number;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  monthlySpendingLimit: number | null;
}

export interface UsageByType {
  chat: number;
  images: number;
  documents: number;
  agent: number;
}

export interface Usage {
  totalCredits: number;
  byType: UsageByType;
}

export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  name: string;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export type AttachmentKind = 'image' | 'document' | 'file';

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  mimeType: string;
  size: number;
  // In mock mode this is an IndexedDB blob key; in api mode a URL.
  ref: string;
  previewUrl?: string;
}

export type MessageStatus = 'streaming' | 'complete' | 'error' | 'canceled';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  model?: string;
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  model: string;
  updatedAt: string;
  createdAt: string;
  pinned: boolean;
  archived: boolean;
  hasAttachments: boolean;
}

export type ImageModel = 'auto' | 'dall-e-3' | 'stable-diffusion' | 'imagen';

export interface ImageAsset {
  id: string;
  url: string;
  width: number;
  height: number;
  blobKey?: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: ImageModel;
  aspectRatio: string;
  style: string;
  seed?: number;
  imageCount: number;
  createdAt: string;
  images: ImageAsset[];
  favorite: boolean;
  mode: 'generate' | 'edit' | 'understand';
}

export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blobKey: string;
  createdAt: string;
  updatedAt: string;
  usedIn: string[];
}

export interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
}

export interface AppDocument {
  id: string;
  title: string;
  template: string;
  content: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  versions: DocumentVersion[];
}

export type IntegrationKey = 'github' | 'google_drive' | 'slack' | 'notion';

export type IntegrationStatus = 'connected' | 'error' | 'syncing' | 'disconnected';

export interface Integration {
  id: string;
  key: IntegrationKey;
  name: string;
  displayName: string;
  connected: boolean;
  status: IntegrationStatus;
  lastSync: string | null;
  permissions: string[];
  config: Record<string, unknown>;
}

export type KnowledgeSourceType = 'file' | 'integration' | 'text';

export type KnowledgeSourceStatus = 'pending' | 'indexing' | 'indexed' | 'error';

export interface KnowledgeSource {
  id: string;
  collectionId: string;
  type: KnowledgeSourceType;
  name: string;
  status: KnowledgeSourceStatus;
  chunkCount: number;
  docCount: number;
  lastSync: string | null;
  config: Record<string, unknown>;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  sources: KnowledgeSource[];
}

export interface KnowledgeSearchResult {
  sourceId: string;
  collectionId: string;
  text: string;
  score: number;
}
