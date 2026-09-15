// Days of week helper: 0 = Sunday ... 6 = Saturday
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayString() {
  return formatDate(new Date());
}

export function isSameDay(dateStrA, dateStrB) {
  return formatDate(dateStrA) === formatDate(dateStrB);
}

/**
 * Generates recurring occurrence dates for a medicine schedule.
 * selectedDays: array of numbers 0-6 (Sun-Sat). Empty/undefined = every day.
 */
export function generateRecurringDates(startDate, endDate, selectedDays) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }

  const useAllDays = !selectedDays || selectedDays.length === 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (useAllDays || selectedDays.includes(cursor.getDay())) {
      dates.push(formatDate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function sortByDateTimeAsc(items, dateKey = 'date', timeKey = 'time') {
  return [...items].sort((a, b) => {
    const aStr = `${a[dateKey]}T${a[timeKey] || '00:00'}`;
    const bStr = `${b[dateKey]}T${b[timeKey] || '00:00'}`;
    return aStr.localeCompare(bStr);
  });
}