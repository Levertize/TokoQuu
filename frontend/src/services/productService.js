import api from './api';

/**
 * Service to manage products through API communication.
 */
export const productService = {
  /**
   * Fetches the products catalog with optional queries: search, category, low_stock.
   * @param {Object} [params]
   * @param {string} [params.search]
   * @param {string} [params.category]
   * @param {boolean|string} [params.low_stock]
   * @returns {Promise<Object>} API response data
   */
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  /**
   * Fetches a single product by ID.
   * @param {number|string} id
   * @returns {Promise<Object>} API response data
   */
  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  /**
   * Creates a new product catalog item.
   * @param {Object} productData
   * @returns {Promise<Object>} API response data
   */
  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  /**
   * Updates an existing product catalog item.
   * @param {number|string} id
   * @param {Object} productData
   * @returns {Promise<Object>} API response data
   */
  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  /**
   * Performs soft deletion of a product by ID.
   * @param {number|string} id
   * @returns {Promise<Object>} API response data
   */
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  /**
   * Updates/restocks product quantity and posts to audit logs.
   * @param {number|string} id
   * @param {Object} stockPayload
   * @param {number} stockPayload.quantity
   * @param {string} stockPayload.type - 'restock' | 'adjustment'
   * @param {string} [stockPayload.notes]
   * @returns {Promise<Object>} API response data
   */
  updateStock: async (id, stockPayload) => {
    const res = await api.patch(`/products/${id}/stock`, stockPayload);
    return res.data;
  }
};
