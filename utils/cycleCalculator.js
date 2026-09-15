import { formatDate } from './dateUtils';

/**
 * Given the last period start date and average cycle length,
 * calculates the estimated next period start date.
 */
export function calculateNextPeriodDate(lastPeriodStartDate, averageCycleLength) {
  if (!lastPeriodStartDate || !averageCycleLength) return null;
  const last = new Date(lastPeriodStartDate);
  if (isNaN(last.getTime())) return null;

  const next = new Date(last);
  next.setDate(next.getDate() + Number(averageCycleLength));
  return formatDate(next);
}

/**
 * Returns the estimated fertile window (5 days before ovulation to 1 day after),
 * assuming ovulation occurs 14 days before the next period.
 */
export function calculateFertileWindow(nextPeriodDate) {
  if (!nextPeriodDate) return null;
  const next = new Date(nextPeriodDate);
  if (isNaN(next.getTime())) return null;

  const ovulation = new Date(next);
  ovulation.setDate(ovulation.getDate() - 14);

  const start = new Date(ovulation);
  start.setDate(start.getDate() - 5);

  const end = new Date(ovulation);
  end.setDate(end.getDate() + 1);

  return { start: formatDate(start), end: formatDate(end), ovulation: formatDate(ovulation) };
}

/**
 * Calculates how many days remain until the next estimated period.
 * Returns a negative number if the estimated date has already passed.
 */
export function daysUntilNextPeriod(nextPeriodDate, fromDate = new Date()) {
  if (!nextPeriodDate) return null;
  const next = new Date(nextPeriodDate);
  const from = new Date(formatDate(fromDate));
  if (isNaN(next.getTime())) return null;

  const diffMs = next.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates estimated period date ranges for the next N cycles,
 * useful for calendar indicators.
 */
export function generateFutureCycleDates(lastPeriodStartDate, averageCycleLength, averagePeriodLength, count = 3) {
  const results = [];
  if (!lastPeriodStartDate || !averageCycleLength) return results;

  const last = new Date(lastPeriodStartDate);
  if (isNaN(last.getTime())) return results;

  // Include the actual logged period first, so the days the user
  // already recorded correctly show a cycle indicator on the calendar.
  const loggedEnd = new Date(last);
  loggedEnd.setDate(loggedEnd.getDate() + Number(averagePeriodLength) - 1);
  results.push({ start: formatDate(last), end: formatDate(loggedEnd) });

  // Then generate future estimated periods.
  let cursor = new Date(last);
  for (let i = 0; i < count; i++) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + Number(averageCycleLength));

    const periodStart = formatDate(cursor);
    const periodEndDate = new Date(cursor);
    periodEndDate.setDate(periodEndDate.getDate() + Number(averagePeriodLength) - 1);

    results.push({ start: periodStart, end: formatDate(periodEndDate) });
  }

  return results;
}