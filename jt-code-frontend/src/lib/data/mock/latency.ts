// Simulated network latency and failure injection (FE-112/113).
// Production code awaits `simulate()` around repository logic so the UI exercises
// real loading/error/retry states even with no backend. Tests can force failures
// deterministically via `failFor` tags and disable latency for speed.

export interface MockRuntimeConfig {
  latencyMs: number;
  failureRate: number;
  failFor: Set<string>;
}

export class MockFailureError extends Error {
  constructor(message = 'Simulated network failure') {
    super(message);
    this.name = 'MockFailureError';
  }
}

let runtime: MockRuntimeConfig = {
  latencyMs: 320,
  failureRate: 0,
  failFor: new Set<string>(),
};

export function configureMockRuntime(partial: Partial<Omit<MockRuntimeConfig, 'failFor'>> & { failFor?: string[] }): void {
  runtime = {
    latencyMs: partial.latencyMs ?? runtime.latencyMs,
    failureRate: partial.failureRate ?? runtime.failureRate,
    failFor: new Set(partial.failFor ?? runtime.failFor),
  };
}

export function getMockRuntimeConfig(): MockRuntimeConfig {
  return runtime;
}

export function resetMockRuntime(): void {
  runtime = { latencyMs: 320, failureRate: 0, failFor: new Set() };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulate<T>(tag: string, producer: () => T | Promise<T>): Promise<T> {
  if (runtime.latencyMs > 0) {
    await delay(runtime.latencyMs * (0.6 + Math.random() * 0.8));
  }
  if (runtime.failFor.has(tag)) {
    throw new MockFailureError(`Simulated failure for "${tag}"`);
  }
  if (runtime.failureRate > 0 && Math.random() < runtime.failureRate) {
    throw new MockFailureError();
  }
  return producer();
}
