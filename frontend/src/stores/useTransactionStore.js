import { create } from 'zustand';
import { useProductStore } from './useProductStore';

/**
 * Zustand store to manage and track POS checkout transactions.
 */
export const useTransactionStore = create((set, get) => ({
  transactions: [
    {
      id: 47,
      invoice_number: 'TRX-20260524-0047',
      customer_name: 'Budi S.',
      payment_method: 'qris',
      total_amount: 45000,
      discount: 0,
      tax: 4950,
      payment_amount: 45000,
      change_amount: 0,
      created_at: '2026-05-24T14:32:00',
      status: 'completed',
      items: [
        { product_name: 'Teh Botol', quantity: 9, unit_price: 5000, subtotal: 45000 }
      ]
    },
    {
      id: 46,
      invoice_number: 'TRX-20260524-0046',
      customer_name: 'Siti R.',
      payment_method: 'cash',
      total_amount: 87500,
      discount: 0,
      tax: 9625,
      payment_amount: 100000,
      change_amount: 12500,
      created_at: '2026-05-24T14:15:00',
      status: 'completed',
      items: [
        { product_name: 'Chitato', quantity: 10, unit_price: 8000, subtotal: 80000 },
        { product_name: 'Mie Goreng', quantity: 2, unit_price: 3750, subtotal: 7500 }
      ]
    },
    {
      id: 45,
      invoice_number: 'TRX-20260524-0045',
      customer_name: 'Umum (Cash)',
      payment_method: 'cash',
      total_amount: 22000,
      discount: 0,
      tax: 2420,
      payment_amount: 50000,
      change_amount: 28000,
      created_at: '2026-05-24T14:01:00',
      status: 'completed',
      items: [
        { product_name: 'Roti Tawar', quantity: 1, unit_price: 12000, subtotal: 12000 },
        { product_name: 'Teh Botol', quantity: 2, unit_price: 5000, subtotal: 10000 }
      ]
    },
    {
      id: 44,
      invoice_number: 'TRX-20260524-0044',
      customer_name: 'Andi W.',
      payment_method: 'transfer',
      total_amount: 134000,
      discount: 6700,
      tax: 14740,
      payment_amount: 134000,
      change_amount: 0,
      created_at: '2026-05-24T13:48:00',
      status: 'pending',
      items: [
        { product_name: 'Susu UHT', quantity: 20, unit_price: 6700, subtotal: 134000 }
      ]
    }
  ],
  loading: false,
  error: null,

  /**
   * Fetches the transaction list.
   */
  fetchTransactions: async () => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ transactions: [...get().transactions], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Completes a POS transaction checkout.
   * @param {Object} cartInfo
   * @param {string} customerName
   * @returns {Object} invoice detail
   */
  checkout: async (cartInfo, customerName = 'Umum') => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const { cart, paymentMethod, cashReceived, bankRef, getSummary } = cartInfo;
      const summary = getSummary();
      
      // Validation for cash payments
      if (paymentMethod === 'cash' && (parseFloat(cashReceived) || 0) < summary.total) {
        throw new Error('Uang tunai diterima tidak mencukupi!');
      }

      // Generate invoice number
      const date = new Date();
      const yyyymmdd = date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
      
      const sequence = String(get().transactions.length + 45).padStart(4, '0');
      const invoiceNumber = `TRX-${yyyymmdd}-${sequence}`;

      const items = Object.keys(cart).map((key) => {
        const item = cart[key];
        // Deduct stock in ProductStore
        useProductStore.getState().adjustStock(parseInt(key), -item.qty);
        return {
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price,
          subtotal: item.price * item.qty
        };
      });

      const paymentAmt = paymentMethod === 'cash' ? parseFloat(cashReceived) : summary.total;
      const changeAmt = paymentMethod === 'cash' ? Math.max(0, paymentAmt - summary.total) : 0;

      const newTx = {
        id: Date.now(),
        invoice_number: invoiceNumber,
        customer_name: customerName || 'Umum',
        payment_method: paymentMethod,
        total_amount: summary.total,
        discount: summary.discount,
        tax: summary.tax,
        payment_amount: paymentAmt,
        change_amount: changeAmt,
        created_at: new Date().toISOString(),
        status: 'completed',
        items
      };

      set({
        transactions: [newTx, ...get().transactions],
        loading: false
      });

      return { success: true, transaction: newTx };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  }
}));
