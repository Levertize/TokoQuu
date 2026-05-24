import api from './api';

/**
 * Service to retrieve analytics and business reports from API.
 */
export const reportService = {
  /**
   * Retrieves summary indicators for today vs yesterday and inventory warnings.
   * @returns {Promise<Object>} API response data
   */
  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data;
  },

  /**
   * Retrieves daily sales and transaction counts.
   * @param {Object} [params]
   * @param {number} [params.days] - Number of days to return
   * @returns {Promise<Object>} API response data
   */
  getDailyReport: async (params) => {
    const res = await api.get('/reports/daily', { params });
    return res.data;
  },

  /**
   * Retrieves monthly performance dashboard statistics.
   * @returns {Promise<Object>} API response data
   */
  getMonthlyReport: async () => {
    const res = await api.get('/reports/monthly');
    return res.data;
  },

  /**
   * Retrieves list of top products sold.
   * @param {Object} [params]
   * @param {number} [params.limit]
   * @param {string} [params.period] - 'today' | 'week' | 'month' | 'all'
   * @returns {Promise<Object>} API response data
   */
  getTopProducts: async (params) => {
    const res = await api.get('/reports/top-products', { params });
    return res.data;
  },

  /**
   * Retrieves list of active products with stock below threshold.
   * @returns {Promise<Object>} API response data
   */
  getLowStockProducts: async () => {
    const res = await api.get('/reports/low-stock');
    return res.data;
  },

  /**
   * Retrieves hourly transaction distribution data.
   * @returns {Promise<Object>} API response data
   */
  getHourlyReport: async () => {
    const res = await api.get('/reports/hourly');
    return res.data;
  }
};
