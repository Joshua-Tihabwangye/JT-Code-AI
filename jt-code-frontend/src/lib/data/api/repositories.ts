import axios from 'axios';
import { config } from '@/lib/config';
import { KEYS } from '../mock/keys';
import { readValue, writeValue } from '../storage/store';
import type {
  Account,
  AccountUpdate,
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
  PasswordChange,
  Plan,
  PlanSlug,
  Subscription,
  Usage,
  Wallet,
  AppDocument,
} from '../types';
import type {
  AccountRepository,
  AuthRepository,
  AuthSession,
  AuthUser,
  BillingRepository,
  ChatRepository,
  DocumentsRepository,
  FilesRepository,
  HistoryFilter,
  HistoryRepository,
  ImageRepository,
  IntegrationRepository,
  KnowledgeRepository,
  Repositories,
  SendMessageOptions,
} from '../contracts';

// Standalone API client for api mode (no React hook required). Mirrors the
// interceptor behaviour of lib/api/client.tsx so repositories can be swapped
// without touching pages. Auth header is attached from the Supabase session.
function createApiClient() {
  const instance = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });
  instance.interceptors.request.use((request) => {
    const raw = localStorage.getItem('jtcode_session');
    if (raw) {
      try {
        const session = JSON.parse(raw) as AuthSession;
        if (session?.accessToken) request.headers.Authorization = `Bearer ${session.accessToken}`;
      } catch {
        /* ignore */
      }
    }
    return request;
  });
  return instance;
}

const api = createApiClient();

// In api mode we still persist the auth session locally so the UI session model
// is identical. This is a thin bridge; a real backend would own sessions.
class ApiAuthRepository implements AuthRepository {
  async signUp(input: Parameters<AuthRepository['signUp']>[0]) {
    const { data } = await api.post<{ user: AuthUser; session: AuthSession }>('/auth/signup/', input);
    await writeValue(KEYS.session, data.session);
    return data;
  }
  async signInWithPassword(email: string, password: string) {
    const { data } = await api.post<{ user: AuthUser; session: AuthSession }>('/auth/signin/', { email, password });
    await writeValue(KEYS.session, data.session);
    return data;
  }
  async signInWithOAuth(provider: 'google' | 'apple') {
    const { data } = await api.post<{ user: AuthUser; session: AuthSession }>(`/auth/oauth/${provider}/`);
    await writeValue(KEYS.session, data.session);
    return data;
  }
  async signOut() {
    await api.post('/auth/signout/');
    await writeValue(KEYS.session, null);
  }
  async getSession() {
    return readValue<AuthSession | null>(KEYS.session, null);
  }
  async getUser() {
    const { data } = await api.get<AuthUser>('/auth/me/');
    return data;
  }
  async resetPasswordForEmail(email: string) {
    await api.post('/auth/reset/', { email });
  }
  async resetPassword(code: string, newPassword: string) {
    await api.post('/auth/reset/confirm/', { code, password: newPassword });
  }
  onChange() {
    return () => {};
  }
}

class ApiAccountRepository implements AccountRepository {
  async getAccount() {
    const { data } = await api.get<Account>('/accounts/me/');
    return data;
  }
  async updateAccount(update: AccountUpdate) {
    const { data } = await api.patch<Account>('/accounts/me/', update);
    return data;
  }
  async changePassword(change: PasswordChange) {
    await api.post('/accounts/me/password/', change);
  }
}

class ApiChatRepository implements ChatRepository {
  async listConversations() {
    const { data } = await api.get<Conversation[]>('/conversations/');
    return data;
  }
  async getConversation(id: string) {
    const { data } = await api.get<Conversation>(`/conversations/${id}/`);
    return data;
  }
  async createConversation(title = 'New conversation', model = 'gpt-4o') {
    const { data } = await api.post<Conversation>('/conversations/', { title, model });
    return data;
  }
  async renameConversation(id: string, title: string) {
    const { data } = await api.patch<Conversation>(`/conversations/${id}/`, { title });
    return data;
  }
  async deleteConversation(id: string) {
    await api.delete(`/conversations/${id}/`);
  }
  async pinConversation(id: string, pinned: boolean) {
    const { data } = await api.patch<Conversation>(`/conversations/${id}/`, { pinned });
    return data;
  }
  async archiveConversation(id: string, archived: boolean) {
    const { data } = await api.patch<Conversation>(`/conversations/${id}/`, { archived });
    return data;
  }
  async exportConversation(id: string, format: 'markdown' | 'json') {
    const { data } = await api.get<{ content: string }>(`/conversations/${id}/export/`, { params: { format } });
    return data.content;
  }
  async getMessages(id: string) {
    const { data } = await api.get<ChatMessage[]>(`/conversations/${id}/messages/`);
    return data;
  }
  async sendMessage(options: SendMessageOptions) {
    const { data } = await api.post<ChatMessage>(`/conversations/${options.conversationId}/messages/`, {
      content: options.content,
      model: options.model,
      attachments: options.attachments,
    });
    return data;
  }
  cancelGeneration(conversationId: string) {
    void api.post(`/conversations/${conversationId}/cancel/`);
  }
  async consumeCredits(_category: CreditCategory, _amount: number) {
    /* backend tracks usage server-side */
  }
}

class ApiHistoryRepository implements HistoryRepository {
  async list(filter: HistoryFilter = {}) {
    const { data } = await api.get<Conversation[]>('/conversations/', { params: filter });
    return data;
  }
  async open(id: string) {
    return new ApiChatRepository().getConversation(id);
  }
  async rename(id: string, title: string) {
    return new ApiChatRepository().renameConversation(id, title);
  }
  async pin(id: string, pinned: boolean) {
    return new ApiChatRepository().pinConversation(id, pinned);
  }
  async archive(id: string, archived: boolean) {
    return new ApiChatRepository().archiveConversation(id, archived);
  }
  async delete(id: string) {
    await new ApiChatRepository().deleteConversation(id);
  }
  async bulkDelete(ids: string[]) {
    await api.post('/conversations/bulk-delete/', { ids });
  }
  async clearAll() {
    await api.post('/conversations/clear/');
  }
  async export(id: string, format: 'markdown' | 'json') {
    return new ApiChatRepository().exportConversation(id, format);
  }
}

class ApiBillingRepository implements BillingRepository {
  async getPlans() {
    const { data } = await api.get<{ results: Plan[] }>('/plans/');
    return data.results;
  }
  async getSubscription() {
    const { data } = await api.get<{ results: Subscription[] }>('/subscriptions/');
    return data.results.find((s) => s.isActive) ?? data.results[0] ?? null;
  }
  async getWallet() {
    const { data } = await api.get<Wallet>('/wallets/me/');
    return data;
  }
  async getUsage() {
    const { data } = await api.get<Usage>('/usage/');
    return data;
  }
  async topup(amountUsd: number) {
    await api.post('/wallets/me/topup/', { amount_cents: Math.round(amountUsd * 100) });
    return this.getWallet();
  }
  async createCheckout(planSlug: PlanSlug, interval: 'month' | 'year') {
    await api.post(`/plans/${planSlug}/subscribe/`, { interval });
    return (await this.getSubscription())!;
  }
  async cancelSubscription() {
    await api.post('/subscriptions/cancel/');
    return (await this.getSubscription())!;
  }
  async reactivate() {
    await api.post('/subscriptions/reactivate/');
    return (await this.getSubscription())!;
  }
  async updatePaymentMethod(method: Omit<PaymentMethod, 'id'>) {
    const { data } = await api.post<PaymentMethod>('/payment-methods/', method);
    return data;
  }
  async getPaymentMethod() {
    const { data } = await api.get<PaymentMethod | null>('/payment-methods/me/');
    return data;
  }
  async setAutoRecharge(enabled: boolean, threshold: number) {
    const { data } = await api.patch<Wallet>('/wallets/me/', { auto_topup_enabled: enabled, auto_topup_threshold: threshold });
    return data;
  }
  async setSpendingLimit(limit: number | null) {
    const { data } = await api.patch<Wallet>('/wallets/me/', { monthly_spending_limit: limit });
    return data;
  }
  async listInvoices() {
    const { data } = await api.get<Invoice[]>('/invoices/');
    return data;
  }
  async getInvoice(id: string) {
    const { data } = await api.get<Invoice>(`/invoices/${id}/`);
    return data;
  }
  async downloadInvoice(id: string) {
    const { data } = await api.get<Blob>(`/invoices/${id}/download/`, { responseType: 'blob' });
    return data;
  }
  async consumeCredits(_category: CreditCategory, _amount: number) {
    return this.getUsage();
  }
}

class ApiImageRepository implements ImageRepository {
  async listModels() {
    const { data } = await api.get<{ id: ImageModel; label: string }[]>('/images/models/');
    return data;
  }
  async generate(options: Parameters<ImageRepository['generate']>[0]) {
    const { data } = await api.post<ImageGeneration>('/images/generate/', options);
    return data;
  }
  async edit(options: Parameters<ImageRepository['edit']>[0]) {
    const { data } = await api.post<ImageGeneration>('/images/edit/', options);
    return data;
  }
  async understand(imageRef: string, question: string) {
    const { data } = await api.post<{ answer: string }>('/images/understand/', { image: imageRef, question });
    return data.answer;
  }
  async listGenerations() {
    const { data } = await api.get<ImageGeneration[]>('/images/');
    return data;
  }
  async getGeneration(id: string) {
    const { data } = await api.get<ImageGeneration>(`/images/${id}/`);
    return data;
  }
  async deleteGeneration(id: string) {
    await api.delete(`/images/${id}/`);
  }
  async toggleFavorite(id: string, favorite: boolean) {
    const { data } = await api.patch<ImageGeneration>(`/images/${id}/`, { favorite });
    return data;
  }
  async saveToFiles(id: string) {
    const { data } = await api.post<FileItem>(`/images/${id}/save-to-files/`);
    return data;
  }
  async consumeCredits(_amount: number) {
    /* backend tracks */
  }
}

class ApiFilesRepository implements FilesRepository {
  async list() {
    const { data } = await api.get<FileItem[]>('/files/');
    return data;
  }
  async get(id: string) {
    const { data } = await api.get<FileItem>(`/files/${id}/`);
    return data;
  }
  async upload(options: Parameters<FilesRepository['upload']>[0]) {
    const form = new FormData();
    form.append('file', options.file);
    const { data } = await api.post<FileItem>('/files/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => options.onProgress?.(Math.round(((e.loaded ?? 0) / (e.total || 1)) * 100)),
      signal: options.signal,
    });
    return data;
  }
  async rename(id: string, name: string) {
    const { data } = await api.patch<FileItem>(`/files/${id}/`, { name });
    return data;
  }
  async delete(id: string) {
    await api.delete(`/files/${id}/`);
  }
  async bulkDelete(ids: string[]) {
    await api.post('/files/bulk-delete/', { ids });
  }
  async download(id: string) {
    const { data } = await api.get<Blob>(`/files/${id}/download/`, { responseType: 'blob' });
    return data;
  }
  async attachToChat(id: string, conversationId: string) {
    const { data } = await api.post<FileItem>(`/files/${id}/attach/`, { conversationId });
    return data;
  }
}

class ApiDocumentsRepository implements DocumentsRepository {
  async list() {
    const { data } = await api.get<AppDocument[]>('/documents/');
    return data;
  }
  async get(id: string) {
    const { data } = await api.get<AppDocument>(`/documents/${id}/`);
    return data;
  }
  async create(input: { title: string; template: string; content?: string }) {
    const { data } = await api.post<AppDocument>('/documents/', input);
    return data;
  }
  async update(id: string, content: string) {
    const { data } = await api.patch<AppDocument>(`/documents/${id}/`, { content });
    return data;
  }
  async rename(id: string, title: string) {
    const { data } = await api.patch<AppDocument>(`/documents/${id}/`, { title });
    return data;
  }
  async duplicate(id: string) {
    const { data } = await api.post<AppDocument>(`/documents/${id}/duplicate/`);
    return data;
  }
  async delete(id: string) {
    await api.delete(`/documents/${id}/`);
  }
  async addVersion(id: string) {
    const { data } = await api.post<AppDocument>(`/documents/${id}/versions/`);
    return data;
  }
  async exportMarkdown(id: string) {
    const { data } = await api.get<{ content: string }>(`/documents/${id}/export/`, { params: { format: 'md' } });
    return data.content;
  }
  async exportPdf(id: string) {
    const { data } = await api.get<Blob>(`/documents/${id}/export/`, { params: { format: 'pdf' }, responseType: 'blob' });
    return data;
  }
  async saveToFiles(id: string) {
    const { data } = await api.post<FileItem>(`/documents/${id}/save-to-files/`);
    return data;
  }
}

class ApiIntegrationRepository implements IntegrationRepository {
  async list() {
    const { data } = await api.get<Integration[]>('/integrations/');
    return data;
  }
  async connect(input: { key: IntegrationKey; displayName?: string; config?: Record<string, unknown> }) {
    const { data } = await api.post<Integration>('/integrations/connect/', input);
    return data;
  }
  async disconnect(id: string) {
    await api.delete(`/integrations/${id}/`);
  }
  async configure(id: string, displayName: string, config: Record<string, unknown>) {
    const { data } = await api.patch<Integration>(`/integrations/${id}/`, { displayName, config });
    return data;
  }
  async test(id: string) {
    const { data } = await api.post<{ ok: boolean; message: string }>(`/integrations/${id}/test/`);
    return data;
  }
  async reconnect(id: string) {
    const { data } = await api.post<Integration>(`/integrations/${id}/reconnect/`);
    return data;
  }
}

class ApiKnowledgeRepository implements KnowledgeRepository {
  async listCollections() {
    const { data } = await api.get<KnowledgeCollection[]>('/knowledge/collections/');
    return data;
  }
  async getCollection(id: string) {
    const { data } = await api.get<KnowledgeCollection>(`/knowledge/collections/${id}/`);
    return data;
  }
  async createCollection(name: string, description = '') {
    const { data } = await api.post<KnowledgeCollection>('/knowledge/collections/', { name, description });
    return data;
  }
  async renameCollection(id: string, name: string) {
    const { data } = await api.patch<KnowledgeCollection>(`/knowledge/collections/${id}/`, { name });
    return data;
  }
  async deleteCollection(id: string) {
    await api.delete(`/knowledge/collections/${id}/`);
  }
  async addSource(input: { collectionId: string; type: KnowledgeSourceType; name: string; config?: Record<string, unknown> }) {
    const { data } = await api.post<KnowledgeCollection>(`/knowledge/collections/${input.collectionId}/sources/`, input);
    return data;
  }
  async removeSource(collectionId: string, sourceId: string) {
    const { data } = await api.delete<KnowledgeCollection>(`/knowledge/collections/${collectionId}/sources/${sourceId}/`);
    return data;
  }
  async syncSource(collectionId: string, sourceId: string) {
    const { data } = await api.post<KnowledgeSource>(`/knowledge/sources/${sourceId}/sync/`);
    return data;
  }
  async search(collectionId: string, query: string) {
    const { data } = await api.get<KnowledgeSearchResult[]>('/knowledge/search/', {
      params: { collectionId, query },
    });
    return data;
  }
  async query(collectionId: string, query: string) {
    const { data } = await api.post<{ answer: string }>('/knowledge/query/', { collectionId, query });
    return data.answer;
  }
}

export function createApiRepositories(): Repositories {
  return {
    auth: new ApiAuthRepository(),
    account: new ApiAccountRepository(),
    chat: new ApiChatRepository(),
    history: new ApiHistoryRepository(),
    billing: new ApiBillingRepository(),
    images: new ApiImageRepository(),
    files: new ApiFilesRepository(),
    documents: new ApiDocumentsRepository(),
    integrations: new ApiIntegrationRepository(),
    knowledge: new ApiKnowledgeRepository(),
  };
}
