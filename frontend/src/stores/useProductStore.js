import { create } from 'zustand';

/**
 * Initial mock product data.
 */
const initialProducts = [
  { id: 1, name: 'Aqua 600ml', category: 'Minuman', buy_price: 2500, sell_price: 4000, stock: 8, min_stock: 10, emoji: '💧' },
  { id: 2, name: 'Mie Goreng', category: 'Makanan', buy_price: 2000, sell_price: 3500, stock: 3, min_stock: 5, emoji: '🍜' },
  { id: 3, name: 'Teh Botol', category: 'Minuman', buy_price: 3000, sell_price: 5000, stock: 24, min_stock: 10, emoji: '🍵' },
  { id: 4, name: 'Susu UHT', category: 'Minuman', buy_price: 4000, sell_price: 6500, stock: 2, min_stock: 5, emoji: '🥛' },
  { id: 5, name: 'Chitato', category: 'Snack', buy_price: 5000, sell_price: 8000, stock: 32, min_stock: 15, emoji: '🍟' },
  { id: 6, name: 'Roti Tawar', category: 'Makanan', buy_price: 8000, sell_price: 12000, stock: 15, min_stock: 10, emoji: '🍞' },
  { id: 7, name: 'Indomie Goreng', category: 'Makanan', buy_price: 2000, sell_price: 3000, stock: 48, min_stock: 20, emoji: '🍲' },
  { id: 8, name: 'Kopi Sachet', category: 'Minuman', buy_price: 1500, sell_price: 2500, stock: 60, min_stock: 15, emoji: '☕' },
  { id: 9, name: 'Sabun Mandi', category: 'Kebutuhan Rumah', buy_price: 6000, sell_price: 8500, stock: 20, min_stock: 8, emoji: '🧼' }
];

/**
 * Zustand store for managing product catalog and stock adjustments.
 */
export const useProductStore = create((set, get) => ({
  products: initialProducts,
  loading: false,
  error: null,

  /**
   * Fetches all products. Currently uses mock state.
   */
  fetchProducts: async () => {
    set({ loading: true });
    try {
      // Mock fetch latency
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ products: [...get().products], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Adds a new product to the catalog.
   * @param {Object} product 
   */
  addProduct: async (product) => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newProduct = {
        ...product,
        id: get().products.length ? Math.max(...get().products.map((p) => p.id)) + 1 : 1,
        stock: parseInt(product.stock) || 0,
        min_stock: parseInt(product.min_stock) || 10,
        buy_price: parseInt(product.buy_price) || 0,
        sell_price: parseInt(product.sell_price) || 0,
      };
      set({ products: [...get().products, newProduct], loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Updates an existing product.
   * @param {number} id 
   * @param {Object} updatedData 
   */
  updateProduct: async (id, updatedData) => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const updatedList = get().products.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedData,
            stock: parseInt(updatedData.stock) ?? p.stock,
            min_stock: parseInt(updatedData.min_stock) ?? p.min_stock,
            buy_price: parseInt(updatedData.buy_price) ?? p.buy_price,
            sell_price: parseInt(updatedData.sell_price) ?? p.sell_price,
          };
        }
        return p;
      });
      set({ products: updatedList, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Soft deletes or removes a product from the catalog.
   * @param {number} id 
   */
  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const filtered = get().products.filter((p) => p.id !== id);
      set({ products: filtered, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Directly adjusts the stock level of a product.
   * @param {number} id 
   * @param {number} amount 
   */
  adjustStock: async (id, amount) => {
    const updatedList = get().products.map((p) => {
      if (p.id === id) {
        const nextStock = p.stock + amount;
        return { ...p, stock: Math.max(0, nextStock) };
      }
      return p;
    });
    set({ products: updatedList });
  }
}));
