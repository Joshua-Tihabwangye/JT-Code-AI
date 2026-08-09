import {
  APP_NAME,
  APP_VERSION,
  STORAGE_KEYS,
  API_ENDPOINTS,
  QUERY_KEYS,
  MESSAGE_ROLES,
  CHAT_REQUEST_STATUS,
  ASSET_STATUS,
  ROUTES,
  BREAKPOINTS,
  ANIMATION_DURATION,
} from './index';

describe('constants', () => {
  describe('APP_NAME & APP_VERSION', () => {
    it('has correct values', () => {
      expect(APP_NAME).toBe('JT-Code');
      expect(APP_VERSION).toBe('0.1.0');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('has all required keys', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('jt-code-auth-token');
      expect(STORAGE_KEYS.REFRESH_TOKEN).toBe('jt-code-refresh-token');
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe('jt-code-user-preferences');
      expect(STORAGE_KEYS.THEME).toBe('jt-code-theme');
    });
  });

  describe('API_ENDPOINTS', () => {
    it('has correct base URLs', () => {
      expect(API_ENDPOINTS.BASE).toBe('/api/v1');
      expect(API_ENDPOINTS.AUTH).toBe('/api/v1/auth');
      expect(API_ENDPOINTS.CONVERSATIONS).toBe('/api/v1/conversations');
      expect(API_ENDPOINTS.ASSETS).toBe('/api/v1/assets');
      expect(API_ENDPOINTS.HEALTH).toBe('/api/v1/health');
    });
  });

  describe('QUERY_KEYS', () => {
    it('generates correct query keys', () => {
      expect(QUERY_KEYS.CONVERSATIONS).toEqual(['conversations']);
      expect(QUERY_KEYS.CONVERSATION('123')).toEqual(['conversations', '123']);
      expect(QUERY_KEYS.MESSAGES('456')).toEqual(['conversations', '456', 'messages']);
      expect(QUERY_KEYS.ASSETS).toEqual(['assets']);
      expect(QUERY_KEYS.USER).toEqual(['user']);
    });
  });

  describe('MESSAGE_ROLES', () => {
    it('has all message roles', () => {
      expect(MESSAGE_ROLES.SYSTEM).toBe('system');
      expect(MESSAGE_ROLES.USER).toBe('user');
      expect(MESSAGE_ROLES.ASSISTANT).toBe('assistant');
      expect(MESSAGE_ROLES.TOOL).toBe('tool');
    });
  });

  describe('CHAT_REQUEST_STATUS', () => {
    it('has all status values', () => {
      expect(CHAT_REQUEST_STATUS.QUEUED).toBe('queued');
      expect(CHAT_REQUEST_STATUS.RUNNING).toBe('running');
      expect(CHAT_REQUEST_STATUS.COMPLETED).toBe('completed');
      expect(CHAT_REQUEST_STATUS.FAILED).toBe('failed');
      expect(CHAT_REQUEST_STATUS.CANCELLED).toBe('cancelled');
    });
  });

  describe('ASSET_STATUS', () => {
    it('has all asset statuses', () => {
      expect(ASSET_STATUS.READY).toBe('ready');
      expect(ASSET_STATUS.QUARANTINED).toBe('quarantined');
      expect(ASSET_STATUS.DELETED).toBe('deleted');
    });
  });

  describe('ROUTES', () => {
    it('has all route paths', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.CHAT).toBe('/chat');
      expect(ROUTES.FILES).toBe('/files');
      expect(ROUTES.SETTINGS).toBe('/settings');
      expect(ROUTES.LOGIN).toBe('/login');
    });
  });

  describe('BREAKPOINTS', () => {
    it('has correct breakpoint values', () => {
      expect(BREAKPOINTS.SM).toBe(640);
      expect(BREAKPOINTS.MD).toBe(768);
      expect(BREAKPOINTS.LG).toBe(1024);
      expect(BREAKPOINTS.XL).toBe(1280);
      expect(BREAKPOINTS['2XL']).toBe(1536);
    });
  });

  describe('ANIMATION_DURATION', () => {
    it('has correct duration values', () => {
      expect(ANIMATION_DURATION.FAST).toBe(150);
      expect(ANIMATION_DURATION.NORMAL).toBe(250);
      expect(ANIMATION_DURATION.SLOW).toBe(350);
    });
  });
});