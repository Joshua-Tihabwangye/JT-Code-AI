// Shared type definitions

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export type UUID = string & { readonly __brand: unique symbol };

export function createUUID(id: string): UUID {
  return id as UUID;
}