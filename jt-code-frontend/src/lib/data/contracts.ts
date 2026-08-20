// Repository contracts. Every page/feature must consume these interfaces
// instead of importing Axios/Supabase directly. Swapping mock -> api is then a
// configuration change (see `factory.ts`), not a page rewrite.

import type {
  Account,
  AccountUpdate,
  Attachment,
  ChatMessage,
  Conversation,
  CreditCategory,
  FileItem,
  ImageGeneration,
  ImageModel,
  Integration,
  IntegrationKey,
  Invoice,
  KnowledgeCollection,
  KnowledgeSearchResult,
  KnowledgeSource,
  KnowledgeSourceType,
  PaymentMethod,
  Plan,
  PlanSlug,
  Subscription,
  Usage,
  Wallet,
  AppDocument,
  PasswordChange,
} from './types';

export interface AuthSession {
  accessToken: string;
  userId: string;
  issuedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  timezone: string;
}

export interface AuthRepository {
  signUp(input: SignUpInput): Promise<{ user: AuthUser; session: AuthSession }>;
  signInWithPassword(email: string, password: string): Promise<{ user: AuthUser; session: AuthSession }>;
  signInWithOAuth(provider: 'google' | 'apple'): Promise<{ user: AuthUser; session: AuthSession }>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getUser(): Promise<AuthUser | null>;
  resetPasswordForEmail(email: string): Promise<void>;
  resetPassword(code: string, newPassword: string): Promise<void>;
  onChange(listener: (session: AuthSession | null) => void): () => void;
}

export interface AccountRepository {
  getAccount(): Promise<Account>;
  updateAccount(update: AccountUpdate): Promise<Account>;
  changePassword(change: PasswordChange): Promise<void>;
}

export interface SendMessageOptions {
  conversationId: string;
  content: string;
  model: string;
  attachments?: Attachment[];
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export interface ChatRepository {
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  createConversation(title?: string, model?: string): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  pinConversation(id: string, pinned: boolean): Promise<Conversation>;
  archiveConversation(id: string, archived: boolean): Promise<Conversation>;
  exportConversation(id: string, format: 'markdown' | 'json'): Promise<string>;
  getMessages(id: string): Promise<ChatMessage[]>;
  sendMessage(options: SendMessageOptions): Promise<ChatMessage>;
  cancelGeneration(conversationId: string): void;
  consumeCredits(category: CreditCategory, amount: number): Promise<void>;
}

export interface HistoryFilter {
  search?: string;
  pinnedOnly?: boolean;
  archivedOnly?: boolean;
  withFilesOnly?: boolean;
}

export interface HistoryRepository {
  list(filter?: HistoryFilter): Promise<Conversation[]>;
  open(id: string): Promise<Conversation | null>;
  rename(id: string, title: string): Promise<Conversation>;
  pin(id: string, pinned: boolean): Promise<Conversation>;
  archive(id: string, archived: boolean): Promise<Conversation>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  clearAll(): Promise<void>;
  export(id: string, format: 'markdown' | 'json'): Promise<string>;
}

export interface BillingRepository {
  getPlans(): Promise<Plan[]>;
  getSubscription(): Promise<Subscription | null>;
  getWallet(): Promise<Wallet>;
  getUsage(): Promise<Usage>;
  topup(amountUsd: number): Promise<Wallet>;
  createCheckout(planSlug: PlanSlug, interval: 'month' | 'year'): Promise<Subscription>;
  cancelSubscription(): Promise<Subscription>;
  reactivate(): Promise<Subscription>;
  updatePaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod>;
  getPaymentMethod(): Promise<PaymentMethod | null>;
  setAutoRecharge(enabled: boolean, threshold: number): Promise<Wallet>;
  setSpendingLimit(limit: number | null): Promise<Wallet>;
  listInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  downloadInvoice(id: string): Promise<Blob>;
  consumeCredits(category: CreditCategory, amount: number): Promise<Usage>;
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  model: ImageModel;
  aspectRatio: string;
  style: string;
  seed?: number;
  imageCount: number;
  referenceImageRef?: string;
  referenceStrength?: number;
  compositionStrength?: number;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

export interface ImageRepository {
  listModels(): Promise<{ id: ImageModel; label: string }[]>;
  generate(options: GenerateImageOptions): Promise<ImageGeneration>;
  edit(options: GenerateImageOptions & { instruction: string }): Promise<ImageGeneration>;
  understand(imageRef: string, question: string): Promise<string>;
  listGenerations(): Promise<ImageGeneration[]>;
  getGeneration(id: string): Promise<ImageGeneration | null>;
  deleteGeneration(id: string): Promise<void>;
  toggleFavorite(id: string, favorite: boolean): Promise<ImageGeneration>;
  saveToFiles(id: string): Promise<FileItem>;
  consumeCredits(amount: number): Promise<void>;
}

export interface UploadOptions {
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface FilesRepository {
  list(): Promise<FileItem[]>;
  get(id: string): Promise<FileItem | null>;
  upload(options: UploadOptions): Promise<FileItem>;
  rename(id: string, name: string): Promise<FileItem>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  download(id: string): Promise<Blob>;
  attachToChat(id: string, conversationId: string): Promise<FileItem>;
}

export interface CreateDocumentInput {
  title: string;
  template: string;
  content?: string;
}

export interface DocumentsRepository {
  list(): Promise<AppDocument[]>;
  get(id: string): Promise<AppDocument | null>;
  create(input: CreateDocumentInput): Promise<AppDocument>;
  update(id: string, content: string): Promise<AppDocument>;
  rename(id: string, title: string): Promise<AppDocument>;
  duplicate(id: string): Promise<AppDocument>;
  delete(id: string): Promise<void>;
  addVersion(id: string): Promise<AppDocument>;
  exportMarkdown(id: string): Promise<string>;
  exportPdf(id: string): Promise<Blob>;
  saveToFiles(id: string): Promise<FileItem>;
}

export interface ConnectIntegrationInput {
  key: IntegrationKey;
  displayName?: string;
  config?: Record<string, unknown>;
}

export interface IntegrationRepository {
  list(): Promise<Integration[]>;
  connect(input: ConnectIntegrationInput): Promise<Integration>;
  disconnect(id: string): Promise<void>;
  configure(id: string, displayName: string, config: Record<string, unknown>): Promise<Integration>;
  test(id: string): Promise<{ ok: boolean; message: string }>;
  reconnect(id: string): Promise<Integration>;
}

export interface AddSourceInput {
  collectionId: string;
  type: KnowledgeSourceType;
  name: string;
  config?: Record<string, unknown>;
}

export interface KnowledgeRepository {
  listCollections(): Promise<KnowledgeCollection[]>;
  getCollection(id: string): Promise<KnowledgeCollection | null>;
  createCollection(name: string, description?: string): Promise<KnowledgeCollection>;
  renameCollection(id: string, name: string): Promise<KnowledgeCollection>;
  deleteCollection(id: string): Promise<void>;
  addSource(input: AddSourceInput): Promise<KnowledgeCollection>;
  removeSource(collectionId: string, sourceId: string): Promise<KnowledgeCollection>;
  syncSource(collectionId: string, sourceId: string): Promise<KnowledgeSource>;
  search(collectionId: string, query: string): Promise<KnowledgeSearchResult[]>;
  query(collectionId: string, query: string): Promise<string>;
}

export interface Repositories {
  auth: AuthRepository;
  account: AccountRepository;
  chat: ChatRepository;
  history: HistoryRepository;
  billing: BillingRepository;
  images: ImageRepository;
  files: FilesRepository;
  documents: DocumentsRepository;
  integrations: IntegrationRepository;
  knowledge: KnowledgeRepository;
}
