import api from './api';

/**
 * Service to manage sales transactions through API communication.
 */
export const transactionService = {
  /**
   * Fetches all transaction records, supports date and status filters.
   * @param {Object} [params]
   * @param {string} [params.date] - YYYY-MM-DD
   * @param {string} [params.status] - 'completed' | 'cancelled'
   * @returns {Promise<Object>} API response data
   */
  getTransactions: async (params) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },

  /**
   * Fetches full transaction details including products items snapshot.
   * @param {number|string} id
   * @returns {Promise<Object>} API response data
   */
  getTransactionById: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },

  /**
   * Executes a checkout for POS shopping cart.
   * @param {Object} checkoutData
   * @param {Array<{product_id: number, quantity: number}>} checkoutData.items
   * @param {number} checkoutData.discount
   * @param {number} checkoutData.tax
   * @param {string} checkoutData.payment_method - 'cash' | 'qris' | 'transfer'
   * @param {number} checkoutData.payment_amount
   * @param {string} [checkoutData.customer_name]
   * @param {string} [checkoutData.notes]
   * @returns {Promise<Object>} API response data
   */
  createTransaction: async (checkoutData) => {
    const res = await api.post('/transactions', checkoutData);
    return res.data;
  },

  /**
   * Voids/cancels a completed transaction and returns its inventory stock.
   * @param {number|string} id
   * @returns {Promise<Object>} API response data
   */
  cancelTransaction: async (id) => {
    const res = await api.patch(`/transactions/${id}/cancel`);
    return res.data;
  }
};
