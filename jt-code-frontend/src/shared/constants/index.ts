// Application constants

export const APP_NAME = 'JT-Code';
export const APP_VERSION = '0.1.0';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'jt-code-auth-token',
  REFRESH_TOKEN: 'jt-code-refresh-token',
  USER_PREFERENCES: 'jt-code-user-preferences',
  THEME: 'jt-code-theme',
} as const;

export const API_ENDPOINTS = {
  BASE: '/api/v1',
  AUTH: '/api/v1/auth',
  CONVERSATIONS: '/api/v1/conversations',
  ASSETS: '/api/v1/assets',
  HEALTH: '/api/v1/health',
} as const;

export const QUERY_KEYS = {
  CONVERSATIONS: ['conversations'],
  CONVERSATION: (id: string) => ['conversations', id],
  MESSAGES: (conversationId: string) => ['conversations', conversationId, 'messages'],
  ASSETS: ['assets'],
  USER: ['user'],
} as const;

export const MESSAGE_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
  TOOL: 'tool',
} as const;

export const CHAT_REQUEST_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const ASSET_STATUS = {
  READY: 'ready',
  QUARANTINED: 'quarantined',
  DELETED: 'deleted',
} as const;

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  FILES: '/files',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
} as const;