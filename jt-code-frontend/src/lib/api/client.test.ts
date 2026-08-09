import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from '@/lib/api/client';

describe('apiErrorMessage', () => {
  it('returns Error messages', () => {
    expect(apiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('handles unknown values', () => {
    expect(apiErrorMessage(null)).toBe('An unexpected error occurred.');
  });
});
