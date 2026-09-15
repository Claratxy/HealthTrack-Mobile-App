/**
 * Returns true if the given date (and optional time) is already in the past.
 * If no time is given, compares against the end of that day.
 */
export function isPastDateTime(date, time) {
  if (!date) return false;
  const dt = new Date(date);
  if (isNaN(dt.getTime())) return false;

  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      dt.setHours(h, m, 0, 0);
    }
  } else {
    dt.setHours(23, 59, 59, 999);
  }

  return dt.getTime() < Date.now();
}

export function isEndBeforeStart(startDate, endDate) {
  return new Date(endDate) < new Date(startDate);
}

export function isValidTimeFormat(time) {
  return /^\d{2}:\d{2}$/.test(time || '');
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}