import { create } from 'zustand';
import { productService } from '../services/productService';

/**
 * Zustand store for managing product catalog and stock adjustments.
 */
export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  /**
   * Fetches all products from the backend with optional query parameters.
   * @param {Object} [filters]
   * @param {string} [filters.search]
   * @param {string} [filters.category]
   * @param {boolean|string} [filters.low_stock]
   */
  fetchProducts: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await productService.getProducts(filters);
      if (response.success) {
        set({ products: response.data, loading: false });
      } else {
        throw new Error(response.error || 'Gagal mengambil produk');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
    }
  },

  /**
   * Adds a new product to the catalog.
   * @param {Object} product 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      const response = await productService.createProduct(product);
      if (response.success) {
        await get().fetchProducts();
        return { success: true };
      } else {
        throw new Error(response.error || 'Gagal menambahkan produk');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  /**
   * Updates an existing product's details.
   * @param {number|string} id 
   * @param {Object} updatedData 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  updateProduct: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const response = await productService.updateProduct(id, updatedData);
      if (response.success) {
        await get().fetchProducts();
        return { success: true };
      } else {
        throw new Error(response.error || 'Gagal memperbarui produk');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  /**
   * Performs a soft delete to remove a product from active view.
   * @param {number|string} id 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        await get().fetchProducts();
        return { success: true };
      } else {
        throw new Error(response.error || 'Gagal menghapus produk');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  /**
   * Directly adjusts the stock level of a product with backend log auditing.
   * @param {number|string} id 
   * @param {number} amount - positive for restock, negative for adjustment
   */
  adjustStock: async (id, amount) => {
    set({ error: null });
    try {
      const type = amount > 0 ? 'restock' : 'adjustment';
      const response = await productService.updateStock(id, {
        quantity: amount,
        type,
        notes: `Penyesuaian stok manual dari Dashboard (${type})`
      });
      if (response.success) {
        await get().fetchProducts();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg });
    }
  }
}));
