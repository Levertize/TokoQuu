import db from '../db/connection.js';

/**
 * Generates a unique sequential invoice number based on today's date.
 * Format: TRX-YYYYMMDD-XXXX (e.g. TRX-20260524-0001)
 * @returns {Promise<string>} Sequential invoice number
 */
export async function generateInvoiceNumber(trx = null) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const prefix = `TRX-${yyyy}${mm}${dd}-`;

  const queryDb = trx || db;

  // Find the latest transaction with today's invoice prefix
  const latestTx = await queryDb('transactions')
    .where('invoice_number', 'like', `${prefix}%`)
    .orderBy('invoice_number', 'desc')
    .first();

  let seq = 1;
  if (latestTx) {
    const parts = latestTx.invoice_number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}
