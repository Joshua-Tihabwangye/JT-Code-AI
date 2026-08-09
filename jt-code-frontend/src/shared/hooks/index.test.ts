import { act, renderHook, waitFor } from '@testing-library/react';
import { useDebounce, useLocalStorage, useMediaQuery } from '../shared/hooks';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      result.current('arg1');
      result.current('arg2');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg2');
  });

  it('cancels previous timeout on rapid calls', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebounce(callback, delay),
      { initialProps: { delay: 300 } }
    );

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ delay: 300 });

    act(() => {
      result.current('second');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when key not set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value when key exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe('"updated"');
  });

  it('supports function updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });
});

describe('useMediaQuery', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });
});