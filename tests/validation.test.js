import { isPastDateTime, isEndBeforeStart, isValidTimeFormat } from '../utils/validation';

describe('isPastDateTime', () => {
  test('returns true for a date/time clearly in the past', () => {
    expect(isPastDateTime('2020-01-01', '08:00')).toBe(true);
  });

  test('returns false for a date/time in the future', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const dateStr = future.toISOString().split('T')[0];
    expect(isPastDateTime(dateStr, '08:00')).toBe(false);
  });

  test('treats a date without time as end-of-day for comparison', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isPastDateTime(today, null)).toBe(false);
  });
});

describe('isEndBeforeStart', () => {
  test('detects an invalid range', () => {
    expect(isEndBeforeStart('2026-02-01', '2026-01-01')).toBe(true);
  });
  test('accepts a valid range', () => {
    expect(isEndBeforeStart('2026-01-01', '2026-02-01')).toBe(false);
  });
});

describe('isValidTimeFormat', () => {
  test('accepts HH:MM', () => {
    expect(isValidTimeFormat('08:00')).toBe(true);
  });
  test('rejects malformed input', () => {
    expect(isValidTimeFormat('8:0')).toBe(false);
    expect(isValidTimeFormat('')).toBe(false);
    expect(isValidTimeFormat(undefined)).toBe(false);
  });
});