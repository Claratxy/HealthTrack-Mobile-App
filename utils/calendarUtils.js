import { formatDate } from './dateUtils';

/**
 * Builds a 6-row (42-cell) month grid for the given year/month (month is 0-indexed).
 * Cells outside the current month are included (as faded) to fill the grid, with
 * isCurrentMonth: false so the UI can style them differently.
 */
export function buildMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Leading days from previous month
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    cells.push({ day, date: formatDate(date), isCurrentMonth: false });
  }

  // Days in current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ day, date: formatDate(date), isCurrentMonth: true });
  }

  // Trailing days from next month to fill up to 42 cells
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    cells.push({ day, date: formatDate(date), isCurrentMonth: false });
  }

  return cells;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];