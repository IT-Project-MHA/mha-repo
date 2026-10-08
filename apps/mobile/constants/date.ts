/**
 * Formats a YYYY-MM-DD date as e.g. 'Mon, 12 Oct 2026'.
 */
export const formatDate = (date: string) =>
  parseDate(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Reads a YYYY-MM-DD date as a Date in local time.
 */
export const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formats a Date as YYYY-MM-DD in local time.
 */
export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
