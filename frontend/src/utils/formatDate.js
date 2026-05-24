import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Formats a Date object or date-string into localized Indonesian format.
 * @param {Date|string} date 
 * @param {string} formatStr 
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'EEEE, d MMMM yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, formatStr, { locale: id });
}

/**
 * Formats time from ISO date.
 * @param {Date|string} date 
 * @returns {string} HH:mm
 */
export function formatTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, 'HH:mm');
}
export default formatDate;
