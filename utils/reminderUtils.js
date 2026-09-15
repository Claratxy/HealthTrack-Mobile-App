/**
 * Calculates the reminder datetime given an event date/time and
 * how many minutes before the event the reminder should fire.
 * Returns null if reminders are disabled or inputs are invalid.
 */
export function calculateReminderTime(date, time, reminderEnabled, minutesBefore = 0) {
  if (!reminderEnabled) return null;
  if (!date || !time) return null;

  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const eventDateTime = new Date(date);
  if (isNaN(eventDateTime.getTime())) return null;

  eventDateTime.setHours(hours, minutes, 0, 0);
  eventDateTime.setMinutes(eventDateTime.getMinutes() - minutesBefore);

  return eventDateTime;
}

/**
 * Given a list of medicine occurrences for today, returns
 * { completed, total } for progress calculations.
 */
export function calculateDailyProgress(occurrences) {
  const total = occurrences.length;
  const completed = occurrences.filter((o) => o.status === 'Taken').length;
  return { completed, total };
}

/**
 * Returns true if an occurrence should be considered "Missed":
 * scheduled time has passed today and status is still Pending.
 */
export function isOccurrenceMissed(occurrence, now = new Date()) {
  if (occurrence.status !== 'Pending') return false;
  const [hours, minutes] = (occurrence.scheduledTime || '00:00').split(':').map(Number);
  const scheduled = new Date(occurrence.date);
  scheduled.setHours(hours, minutes, 0, 0);
  return scheduled < now;
}