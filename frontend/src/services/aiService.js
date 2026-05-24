import api from './api';

/**
 * Service to interact with the AI assistant API.
 */
export const aiService = {
  /**
   * Submits a question along with conversation history to the AI agent.
   * @param {string} message - User query
   * @param {Array<{role: string, text: string}>} [history] - Previous dialog items
   * @returns {Promise<Object>} API response data
   */
  chat: async (message, history = []) => {
    const res = await api.post('/ai/chat', { message, history });
    return res.data;
  },

  /**
   * Retrieves quick query recommendations based on the database state.
   * @returns {Promise<Object>} API response data
   */
  getSuggestions: async () => {
    const res = await api.get('/ai/suggestions');
    return res.data;
  }
};
