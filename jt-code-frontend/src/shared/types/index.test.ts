import { ApiError, PaginatedResponse, SelectOption, LoadingState, BaseEntity, createUUID } from './index';

describe('shared types', () => {
  describe('ApiError', () => {
    it('accepts valid error object', () => {
      const error: ApiError = {
        message: 'Something went wrong',
        code: 'ERROR_CODE',
        status: 400,
        details: { field: 'value' },
      };
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('ERROR_CODE');
    });

    it('allows minimal error', () => {
      const error: ApiError = { message: 'Error' };
      expect(error.message).toBe('Error');
    });
  });

  describe('PaginatedResponse', () => {
    it('types paginated data correctly', () => {
      const response: PaginatedResponse<{ id: string }> = {
        count: 10,
        next: 'http://example.com/api?page=2',
        previous: null,
        results: [{ id: '1' }, { id: '2' }],
      };
      expect(response.count).toBe(10);
      expect(response.results).toHaveLength(2);
    });
  });

  describe('SelectOption', () => {
    it('types select options correctly', () => {
      const options: SelectOption[] = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B', disabled: true },
      ];
      expect(options[0]!.disabled).toBeUndefined();
      expect(options[1]!.disabled).toBe(true);
    });
  });

  describe('LoadingState', () => {
    it('accepts valid states', () => {
      const states: LoadingState[] = ['idle', 'loading', 'success', 'error'];
      expect(states).toHaveLength(4);
    });
  });

  describe('BaseEntity', () => {
    it('requires id, created_at, updated_at', () => {
      const entity: BaseEntity = {
        id: '123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };
      expect(entity.id).toBe('123');
    });
  });

  describe('createUUID', () => {
    it('creates branded UUID type', () => {
      const uuid = createUUID('550e8400-e29b-41d4-a716-446655440000');
      expect(uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});