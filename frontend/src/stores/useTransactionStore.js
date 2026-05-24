import { create } from 'zustand';
import { transactionService } from '../services/transactionService';
import { useProductStore } from './useProductStore';

/**
 * Zustand store to manage and track POS checkout transactions.
 */
export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  /**
   * Fetches the transaction list from the backend server.
   * @param {Object} [filters]
   * @param {string} [filters.date]
   * @param {string} [filters.status]
   */
  fetchTransactions: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.getTransactions(filters);
      if (response.success) {
        set({ transactions: response.data, loading: false });
      } else {
        throw new Error(response.error || 'Gagal memuat daftar transaksi');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
    }
  },

  /**
   * Completes a POS transaction checkout via backend transaction API.
   * @param {Object} cartInfo
   * @param {string} customerName
   * @returns {Promise<{success: boolean, transaction?: Object, error?: string}>}
   */
  checkout: async (cartInfo, customerName = 'Umum') => {
    set({ loading: true, error: null });
    try {
      const { cart, paymentMethod, cashReceived, bankRef, getSummary } = cartInfo;
      const summary = getSummary();

      const items = Object.keys(cart).map((key) => ({
        product_id: parseInt(key),
        quantity: cart[key].qty
      }));

      const paymentAmt = paymentMethod === 'cash' ? parseFloat(cashReceived) : summary.total;

      const checkoutPayload = {
        items,
        discount: summary.discount,
        tax: summary.tax,
        payment_method: paymentMethod,
        payment_amount: paymentAmt,
        customer_name: customerName || 'Umum',
        notes: paymentMethod !== 'cash' ? bankRef : null
      };

      const response = await transactionService.createTransaction(checkoutPayload);

      if (response.success) {
        // Refresh products catalog in the UI to update stock levels
        await useProductStore.getState().fetchProducts();
        // Reload transactions
        await get().fetchTransactions();
        
        return { success: true, transaction: response.data };
      } else {
        throw new Error(response.error || 'Gagal melakukan checkout');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  /**
   * Voids/cancels a transaction, reverting its inventory changes in the database.
   * @param {number|string} id 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  cancelTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.cancelTransaction(id);
      if (response.success) {
        // Refresh transactions and products to reflect stock returns
        await get().fetchTransactions();
        await useProductStore.getState().fetchProducts();
        return { success: true };
      } else {
        throw new Error(response.error || 'Gagal membatalkan transaksi');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));
