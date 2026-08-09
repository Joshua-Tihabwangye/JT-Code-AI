import { cn, formatDate, formatDateTime, truncate, generateId, sleep, classNames, formatBytes } from './index';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('', false, null, undefined)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats Date object', () => {
    const result = formatDate(new Date('2024-01-15T10:30:00Z'));
    expect(result).toContain('Jan');
  });
});

describe('formatDateTime', () => {
  it('includes time in output', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).toContain('10:30');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello world', 8)).toBe('Hello...');
  });

  it('returns original if shorter than length', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(10);
  });
});

describe('sleep', () => {
  it('resolves after specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe('classNames', () => {
  it('joins truthy values', () => {
    expect(classNames('a', 'b', false, null, undefined, 'c')).toBe('a b c');
  });

  it('handles empty', () => {
    expect(classNames()).toBe('');
  });
});