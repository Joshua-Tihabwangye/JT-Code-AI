import { KEYS } from './keys';
import { JsonCollection, writeValue, blobKey, putBlob } from '../storage/store';
import { getBackend } from '../storage/idb';
import type {
  Account,
  Plan,
  Subscription,
  Wallet,
  Usage,
  Invoice,
  PaymentMethod,
  Integration,
  KnowledgeCollection,
  FileItem,
  AppDocument,
  Conversation,
  ChatMessage,
  ImageGeneration,
  ImageAsset,
} from '../types';

// Small deterministic SVG placeholder used for generated images and sample
// assets so the mock has no runtime dependency on <canvas>.
function placeholderSvg(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="hsl(${hue},70%,55%)"/>
  <stop offset="1" stop-color="hsl(${(hue + 60) % 360},70%,40%)"/>
  </linearGradient></defs>
  <rect width="768" height="768" fill="url(#g)"/>
  <circle cx="384" cy="320" r="150" fill="rgba(255,255,255,0.18)"/>
  <text x="384" y="660" font-family="sans-serif" font-size="34" fill="rgba(255,255,255,0.92)" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function seedMockData(): Promise<void> {
  // Skip if a user/account already exists (keeps demo data from clobbering
  // real local signups). The seeded flag is set for first-run detection.
  const existing = await getBackend().get(KEYS.account);
  if (existing) {
    await writeValue(KEYS.seeded, true);
    return;
  }
  await writeValue(KEYS.seeded, true);

  const now = new Date().toISOString();

  const account: Account = {
    id: 'seed-account',
    email: 'joshua@jtcode.dev',
    firstName: 'Joshua',
    lastName: 'Tihabwangye',
    contact: '+256 700 000 000',
    countryCode: 'UG',
    countryName: 'Uganda',
    dialCode: '+256',
    timezone: 'Africa/Kampala',
    avatarUrl: null,
    createdAt: now,
    termsAccepted: true,
    privacyAccepted: true,
    plan: 'pro',
  };
  await writeValue(KEYS.account, account);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      slug: 'free',
      priceCents: 0,
      currency: 'USD',
      interval: 'month',
      monthlyCredits: 1000,
      isPopular: false,
      description: 'For individuals getting started',
      features: ['1,000 credits / month', 'Access to base models', 'Basic AI tools', 'Community support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      slug: 'pro',
      priceCents: 2000,
      currency: 'USD',
      interval: 'month',
      monthlyCredits: 2000,
      isPopular: true,
      description: 'For professionals and power users',
      features: ['2,000 credits / month', 'Access to advanced models', 'Priority generation', 'Priority support'],
    },
    {
      id: 'team',
      name: 'Team',
      slug: 'team',
      priceCents: 4900,
      currency: 'USD',
      interval: 'month',
      monthlyCredits: 5000,
      isPopular: false,
      description: 'For teams and organizations',
      features: ['5,000 credits / user', 'Team workspace', 'Admin controls', 'SLA'],
    },
    {
      id: 'business',
      name: 'Business',
      slug: 'business',
      priceCents: 19900,
      currency: 'USD',
      interval: 'month',
      monthlyCredits: 25000,
      isPopular: false,
      description: 'For scaling teams',
      features: ['Custom credits', 'SSO & audit logs', 'Dedicated support', 'SLA guarantee'],
    },
  ];
  await writeValue(KEYS.plans, plans);

  const subscription: Subscription = {
    id: 'seed-sub',
    status: 'active',
    plan: 'pro',
    planName: 'Pro',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(Date.now() + 30 * 864e5).toISOString(),
    cancelAtPeriodEnd: false,
    isActive: true,
    daysRemaining: 30,
  };
  await writeValue(KEYS.subscription, subscription);

  const wallet: Wallet = {
    id: 'seed-wallet',
    balance: 1840,
    reservedBalance: 0,
    currency: 'USD',
    creditValueUsd: 0.01,
    autoTopupEnabled: false,
    autoTopupThreshold: 200,
    monthlySpendingLimit: null,
  };
  await writeValue(KEYS.wallet, wallet);

  const usage: Usage = {
    totalCredits: 160,
    byType: { chat: 90, images: 55, documents: 10, agent: 5 },
  };
  await writeValue(KEYS.usage, usage);

  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      number: 'JT-2026-001',
      date: new Date(Date.now() - 30 * 864e5).toISOString(),
      amountCents: 2000,
      currency: 'USD',
      status: 'paid',
      description: 'JT-Code Pro — Monthly',
    },
    {
      id: 'inv-002',
      number: 'JT-2026-002',
      date: now,
      amountCents: 2000,
      currency: 'USD',
      status: 'open',
      description: 'JT-Code Pro — Monthly',
    },
  ];
  await writeValue(KEYS.invoices, invoices);

  const paymentMethod: PaymentMethod = {
    id: 'pm-seed',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
    name: 'Joshua Tihabwangye',
  };
  await writeValue(KEYS.paymentMethod, paymentMethod);

  const integrations: Integration[] = [
    {
      id: 'int-github',
      key: 'github',
      name: 'GitHub',
      displayName: 'Joshua',
      connected: true,
      status: 'connected',
      lastSync: now,
      permissions: ['Read repositories', 'Read user profile'],
      config: {},
    },
    {
      id: 'int-slack',
      key: 'slack',
      name: 'Slack',
      displayName: '',
      connected: false,
      status: 'disconnected',
      lastSync: null,
      permissions: ['Post messages'],
      config: {},
    },
  ];
  await writeValue(KEYS.integrations, integrations);

  const knowledge: KnowledgeCollection[] = [
    {
      id: 'kc-seed',
      name: 'Product Docs',
      description: 'Internal product documentation used for retrieval',
      createdAt: now,
      sources: [
        {
          id: 'ks-seed',
          collectionId: 'kc-seed',
          type: 'file',
          name: 'getting-started.md',
          status: 'indexed',
          chunkCount: 12,
          docCount: 1,
          lastSync: now,
          config: {},
        },
      ],
    },
  ];
  await writeValue(KEYS.knowledge, knowledge);

  const file1Key = blobKey('file');
  await putBlob(file1Key, new Blob(['# Getting Started\nWelcome to JT-Code.'], { type: 'text/markdown' }));
  const files: FileItem[] = [
    {
      id: 'file-seed-1',
      name: 'getting-started.md',
      mimeType: 'text/markdown',
      size: 42,
      blobKey: file1Key,
      createdAt: now,
      updatedAt: now,
      usedIn: [],
    },
    {
      id: 'file-seed-2',
      name: 'brand-banner.svg',
      mimeType: 'image/svg+xml',
      size: 820,
      blobKey: blobKey('file'),
      createdAt: now,
      updatedAt: now,
      usedIn: [],
    },
  ];
  const filesCollection = new JsonCollection<FileItem>(KEYS.files);
  await filesCollection.replaceAll(files);

  const documents: AppDocument[] = [
    {
      id: 'doc-seed-1',
      title: 'Quarterly Plan',
      template: 'blank',
      content: '# Quarterly Plan\n\n## Goals\n- Ship image studio\n- Improve billing',
      favorite: false,
      createdAt: now,
      updatedAt: now,
      version: 1,
      versions: [{ id: 'dv-1', version: 1, content: '# Quarterly Plan', createdAt: now }],
    },
  ];
  const docsCollection = new JsonCollection<AppDocument>(KEYS.documents);
  await docsCollection.replaceAll(documents);

  const conversation: Conversation = {
    id: 'conv-seed-1',
    title: 'Welcome to JT-Code',
    preview: 'How do I get started with image generation?',
    messageCount: 2,
    model: 'gpt-4o',
    updatedAt: now,
    createdAt: now,
    pinned: true,
    archived: false,
    hasAttachments: false,
  };
  const conversations = new JsonCollection<Conversation>(KEYS.conversations);
  await conversations.replaceAll([conversation]);

  const messages: ChatMessage[] = [
    {
      id: 'msg-seed-1',
      conversationId: 'conv-seed-1',
      role: 'user',
      content: 'How do I get started with image generation?',
      createdAt: now,
      status: 'complete',
    },
    {
      id: 'msg-seed-2',
      conversationId: 'conv-seed-1',
      role: 'assistant',
      content: 'Open Images from the sidebar, write a prompt, pick a style and aspect ratio, then Generate.',
      createdAt: now,
      model: 'gpt-4o',
      status: 'complete',
    },
  ];
  const messagesCollection = new JsonCollection<ChatMessage>(KEYS.messages);
  await messagesCollection.replaceAll(messages);

  const asset: ImageAsset = {
    id: 'img-asset-seed',
    url: placeholderSvg('Sunset', 20),
    width: 768,
    height: 768,
  };
  const generations: ImageGeneration[] = [
    {
      id: 'img-seed-1',
      prompt: 'A calm sunset over hills',
      negativePrompt: '',
      model: 'auto',
      aspectRatio: '1:1',
      style: 'photographic',
      imageCount: 1,
      createdAt: now,
      images: [asset],
      favorite: false,
      mode: 'generate',
    },
  ];
  const imagesCollection = new JsonCollection<ImageGeneration>(KEYS.images);
  await imagesCollection.replaceAll(generations);
}

