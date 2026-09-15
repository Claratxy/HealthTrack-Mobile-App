import { generateRecurringDates, formatDate, isSameDay, sortByDateTimeAsc } from '../utils/dateUtils';

describe('generateRecurringDates', () => {
  test('generates a date for every day when selectedDays is empty', () => {
    const dates = generateRecurringDates('2026-01-01', '2026-01-05', []);
    expect(dates).toEqual(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05']);
  });

  test('generates only the selected weekdays', () => {
    // 2026-01-01 is a Thursday (day 4). Select Mon(1), Wed(3), Fri(5) for two weeks.
    const dates = generateRecurringDates('2026-01-01', '2026-01-14', [1, 3, 5]);
    dates.forEach((d) => {
      const day = new Date(d).getDay();
      expect([1, 3, 5]).toContain(day);
    });
  });

  test('returns an empty array when end date is before start date', () => {
    const dates = generateRecurringDates('2026-01-10', '2026-01-01', []);
    expect(dates).toEqual([]);
  });

  test('returns an empty array for invalid dates', () => {
    const dates = generateRecurringDates('not-a-date', '2026-01-01', []);
    expect(dates).toEqual([]);
  });

  test('includes both start and end date in range', () => {
    const dates = generateRecurringDates('2026-02-01', '2026-02-01', []);
    expect(dates).toEqual(['2026-02-01']);
  });
});

describe('formatDate / isSameDay', () => {
  test('formats a date string to YYYY-MM-DD', () => {
    expect(formatDate('2026-03-05T10:00:00')).toBe('2026-03-05');
  });

  test('isSameDay correctly compares two date strings', () => {
    expect(isSameDay('2026-03-05', '2026-03-05T23:59:00')).toBe(true);
    expect(isSameDay('2026-03-05', '2026-03-06')).toBe(false);
  });
});

describe('sortByDateTimeAsc', () => {
  test('sorts items by date then time ascending', () => {
    const items = [
      { date: '2026-01-02', time: '08:00' },
      { date: '2026-01-01', time: '09:00' },
      { date: '2026-01-01', time: '08:00' },
    ];
    const sorted = sortByDateTimeAsc(items);
    expect(sorted).toEqual([
      { date: '2026-01-01', time: '08:00' },
      { date: '2026-01-01', time: '09:00' },
      { date: '2026-01-02', time: '08:00' },
    ]);
  });
});