import { config } from '@/lib/config';
import { createMockRepositories } from './mock/repositories';
import { createApiRepositories } from './api/repositories';
import type { Repositories } from './contracts';

// Selects the runtime implementation based on VITE_DATA_MODE. Pages only ever
// see the `Repositories` contract, so switching to a real backend is a config
// change (no page rewrites).
export function createRepositories(): Repositories {
  return config.dataMode === 'api' ? createApiRepositories() : createMockRepositories();
}
