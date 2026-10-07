/**
 * Formats a YYYY-MM-DD date as e.g. 'Mon, 12 Oct 2026'.
 */
export const formatDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
