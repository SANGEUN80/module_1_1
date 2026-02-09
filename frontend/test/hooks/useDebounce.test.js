/**
 * @jest-environment jsdom
 * Feature: #003 - useDebounce 훅
 * Domain: Hooks
 * Method: useDebounce
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce 훅 테스트', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('초기값이 올바르게 설정됨', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  test('값이 변경되어도 delay 시간 전에는 업데이트되지 않음', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    // delay 시간 전
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');
  });

  test('delay 시간 후에 값이 업데이트됨', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    // delay 시간 후
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  test('연속된 값 변경 시 마지막 값만 반영됨', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    rerender({ value: 'second', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender({ value: 'third', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender({ value: 'final', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('final');
  });
});
