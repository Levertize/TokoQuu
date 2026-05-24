/**
 * Formats a numeric value into Indonesian Rupiah (IDR) format.
 * @param {number} amount 
 * @returns {string} Formatted Rupiah string (e.g. "Rp 10.000")
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount).replace(/,00$/, '');
}
export default formatCurrency;
