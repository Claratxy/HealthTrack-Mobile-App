import { calculateReminderTime, calculateDailyProgress, isOccurrenceMissed } from '../utils/reminderUtils';

describe('calculateReminderTime', () => {
  test('returns null when reminders are disabled', () => {
    expect(calculateReminderTime('2026-01-01', '08:00', false)).toBeNull();
  });

  test('returns null for missing date or time', () => {
    expect(calculateReminderTime(null, '08:00', true)).toBeNull();
    expect(calculateReminderTime('2026-01-01', null, true)).toBeNull();
  });

  test('calculates the correct reminder time with no offset', () => {
    const result = calculateReminderTime('2026-01-01', '08:00', true, 0);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(0);
  });

  test('applies a minutes-before offset correctly', () => {
    const result = calculateReminderTime('2026-01-01', '08:00', true, 30);
    expect(result.getHours()).toBe(7);
    expect(result.getMinutes()).toBe(30);
  });
});

describe('calculateDailyProgress', () => {
  test('returns 0/0 for an empty list', () => {
    expect(calculateDailyProgress([])).toEqual({ completed: 0, total: 0 });
  });

  test('correctly counts Taken vs total', () => {
    const occurrences = [
      { status: 'Taken' },
      { status: 'Pending' },
      { status: 'Taken' },
      { status: 'Skipped' },
    ];
    expect(calculateDailyProgress(occurrences)).toEqual({ completed: 2, total: 4 });
  });
});

describe('isOccurrenceMissed', () => {
  test('returns false if status is not Pending', () => {
    const occ = { status: 'Taken', date: '2020-01-01', scheduledTime: '08:00' };
    expect(isOccurrenceMissed(occ, new Date('2026-01-01'))).toBe(false);
  });

  test('returns true if scheduled time has passed and status is Pending', () => {
    const occ = { status: 'Pending', date: '2026-01-01', scheduledTime: '08:00' };
    const now = new Date('2026-01-01T10:00:00');
    expect(isOccurrenceMissed(occ, now)).toBe(true);
  });

  test('returns false if scheduled time has not yet passed', () => {
    const occ = { status: 'Pending', date: '2026-01-01', scheduledTime: '18:00' };
    const now = new Date('2026-01-01T10:00:00');
    expect(isOccurrenceMissed(occ, now)).toBe(false);
  });
});