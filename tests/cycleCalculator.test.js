import {
  calculateNextPeriodDate,
  daysUntilNextPeriod,
  generateFutureCycleDates,
} from '../utils/cycleCalculator';

describe('calculateNextPeriodDate', () => {
  test('adds the average cycle length to the last period date', () => {
    expect(calculateNextPeriodDate('2026-01-01', 28)).toBe('2026-01-29');
  });

  test('returns null when inputs are missing', () => {
    expect(calculateNextPeriodDate(null, 28)).toBeNull();
    expect(calculateNextPeriodDate('2026-01-01', null)).toBeNull();
  });

  test('handles different cycle lengths', () => {
    expect(calculateNextPeriodDate('2026-01-01', 21)).toBe('2026-01-22');
    expect(calculateNextPeriodDate('2026-01-01', 35)).toBe('2026-02-05');
  });
});

describe('daysUntilNextPeriod', () => {
  test('returns a positive count for a future date', () => {
    const result = daysUntilNextPeriod('2026-01-10', new Date('2026-01-01'));
    expect(result).toBe(9);
  });

  test('returns a negative count for a past date', () => {
    const result = daysUntilNextPeriod('2026-01-01', new Date('2026-01-10'));
    expect(result).toBe(-9);
  });
});

describe('generateFutureCycleDates', () => {
  test('includes the logged period as the first range', () => {
    const results = generateFutureCycleDates('2026-01-01', 28, 5, 3);
    expect(results[0]).toEqual({ start: '2026-01-01', end: '2026-01-05' });
  });

  test('generates the requested number of future cycles after the logged one', () => {
    const results = generateFutureCycleDates('2026-01-01', 28, 5, 3);
    expect(results).toHaveLength(4); // 1 logged + 3 future
    expect(results[1].start).toBe('2026-01-29');
    expect(results[1].end).toBe('2026-02-02');
  });

  test('returns an empty array when tracking data is missing', () => {
    expect(generateFutureCycleDates(null, 28, 5, 3)).toEqual([]);
  });
});