import { create } from 'zustand';
import { useSettingsStore } from './useSettingsStore';


/**
 * Zustand store for Point of Sale (POS) shopping cart management.
 */
export const useCartStore = create((set, get) => ({
  cart: {}, // key: product_id, value: { id, name, price, qty, maxStock, emoji }
  discount: 0,
  taxRate: 0.11, // PPN 11%
  paymentMethod: 'cash',
  cashReceived: '',
  bankRef: '',

  /**
   * Clears the current cart and input values.
   */
  clearCart: () => {
    set({ cart: {}, discount: 0, cashReceived: '', bankRef: '' });
  },

  /**
   * Sets the active payment method.
   * @param {string} method 
   */
  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  /**
   * Updates the cash received input.
   * @param {string|number} amount 
   */
  setCashReceived: (amount) => {
    set({ cashReceived: amount });
  },

  /**
   * Updates the bank transfer reference.
   * @param {string} ref 
   */
  setBankRef: (ref) => {
    set({ bankRef: ref });
  },

  /**
   * Adds an item to the shopping cart.
   * @param {Object} product 
   * @returns {Object} result success status & message
   */
  addToCart: (product) => {
    const { cart } = get();
    const id = product.id;
    
    if (product.stock <= 0) {
      return { success: false, message: 'Produk habis, tidak bisa ditambahkan!', type: 'error' };
    }

    const currentItem = cart[id];
    const currentQty = currentItem ? currentItem.qty : 0;

    if (currentQty >= product.stock) {
      return { success: false, message: `Stok maksimal (${product.stock} pcs) tercapai!`, type: 'warning' };
    }

    const updatedCart = {
      ...cart,
      [id]: {
        id: product.id,
        name: product.name,
        price: product.sell_price,
        qty: currentQty + 1,
        maxStock: product.stock,
        emoji: product.emoji
      }
    };

    set({ cart: updatedCart });
    return { success: true, message: `${product.name} ditambahkan ke keranjang`, type: 'success' };
  },

  /**
   * Adjusts the quantity of a cart item by offset amount (+1 or -1).
   * @param {number} id 
   * @param {number} offset 
   * @returns {Object} result status info
   */
  adjustQty: (id, offset) => {
    const { cart } = get();
    const item = cart[id];
    if (!item) return { success: false };

    const nextQty = item.qty + offset;
    
    if (nextQty > item.maxStock) {
      return { success: false, message: 'Batas stok tercapai!', type: 'warning' };
    }

    const updatedCart = { ...cart };
    if (nextQty <= 0) {
      delete updatedCart[id];
      set({ cart: updatedCart });
      return { success: true, message: 'Barang dihapus dari keranjang', type: 'info' };
    } else {
      updatedCart[id] = { ...item, qty: nextQty };
      set({ cart: updatedCart });
      return { success: true };
    }
  },

  /**
   * Computes the cart summary values (subtotal, tax, discount, total).
   */
  getSummary: () => {
    const { cart } = get();
    const keys = Object.keys(cart);
    const taxRatePercent = useSettingsStore.getState().taxRate;
    const taxRate = taxRatePercent / 100;
    
    const subtotal = keys.reduce((sum, key) => sum + cart[key].price * cart[key].qty, 0);
    const tax = Math.round(subtotal * taxRate);
    
    // Simulate discount: 5% discount if subtotal >= 100,000
    let discount = 0;
    if (subtotal >= 100000) {
      discount = Math.round(subtotal * 0.05);
    }
    
    const total = subtotal + tax - discount;
    const itemCount = keys.reduce((sum, key) => sum + cart[key].qty, 0);

    return {
      subtotal,
      tax,
      discount,
      total,
      itemCount
    };
  }
}));
