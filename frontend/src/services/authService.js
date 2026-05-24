import api from './api';

/**
 * Service to manage authentication sessions and user profiles.
 */
export const authService = {
  /**
   * Submits credentials to exchange for a JWT token.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} API response data
   */
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  /**
   * Logs out the user on the server.
   * @returns {Promise<Object>} API response data
   */
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  /**
   * Checks token validity and gets user profile.
   * @returns {Promise<Object>} API response data
   */
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};
