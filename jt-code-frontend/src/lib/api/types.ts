export interface ApiErrorBody {
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
