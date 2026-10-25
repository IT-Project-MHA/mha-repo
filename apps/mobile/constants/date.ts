/**
 * Formats an ISO date and time into a readable string e.g. 'Mon, 12 Oct 2026, 2:30 pm'
 * in the phone's timezone.
 */
export const formatDateTime = (dateTime: string) =>
  new Date(dateTime).toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// time without date
export type TimeOfDay = { hours: number; minutes: number };

// appointments can only be from 6:00 am to 8:59 pm, so they stay on the same day in every
// Australian timezone (up to 3 hours apart, e.g. Perth and Sydney in daylight saving)
export const APPOINTMENT_EARLIEST: TimeOfDay = { hours: 6, minutes: 0 };
export const APPOINTMENT_LATEST: TimeOfDay = { hours: 20, minutes: 59 };

/**
 * Formats a time of day into readable string e.g. '2:30 pm'.
 */
export const formatTime = (time: TimeOfDay) =>
  withTime(new Date(), time).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });

// minutes since midnight, for comparing times of day
const minutesOf = (time: TimeOfDay) => time.hours * 60 + time.minutes;

/**
 * Whether a time of day is from earliest to latest, both included.
 */
export const isTimeBetween = (time: TimeOfDay, earliest: TimeOfDay, latest: TimeOfDay) =>
  minutesOf(time) >= minutesOf(earliest) && minutesOf(time) <= minutesOf(latest);

/**
 * Returns the time of day of a Date in local time.
 */
export const timeOf = (date: Date): TimeOfDay => ({
  hours: date.getHours(),
  minutes: date.getMinutes(),
});

/**
 * Returns a copy of a Date with its time of day set to the given time, in local time.
 */
export const withTime = (date: Date, time: TimeOfDay) => {
  const dateTime = new Date(date);
  dateTime.setHours(time.hours, time.minutes, 0, 0);
  return dateTime;
};

/**
 * Receives JS date object and returns a date in 'YYYY-MM-DD' form which the api expects.
 */
export const toApiDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** 
 * Receives a date string in the form 'YYYY-MM-DD' and returns a JS Date object at midnight
 * in the phone's local time.
*/
export const parseApiDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** 
 * Receives a date string in the form 'YYYY-MM-DD', parses it o date object and returns date as display text.
 * 
 * Goes through parseApiDate so the day is never shifted by the phone's timezone.
 */
export const formatDate = (value: string) =>
  parseApiDate(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// converts YYYY-MM-DD on a Monday to display text Monday-Sunday (whole week)
export const weekRangeLabel = (weekStarting: string) => {
  const start = parseApiDate(weekStarting);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const monthName = (date: Date) => date.toLocaleDateString('en-AU', { month: 'long' });

  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}-${end.getDate()} ${monthName(end)}`
    : `${start.getDate()} ${monthName(start)} - ${end.getDate()} ${monthName(end)}`;
};