import { create } from 'zustand';
import { authService } from '../services/authService';

const savedToken = localStorage.getItem('token');

/**
 * Zustand store for authentication state management.
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,

  /**
   * Logs in a user by submitting credentials to the API.
   * Stores the JWT token in localStorage on success.
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{success: boolean, error?: string}>} Login outcome
   */
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(username, password);
      if (data.success) {
        localStorage.setItem('token', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true };
      } else {
        throw new Error(data.error || 'Gagal masuk!');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  /**
   * Logs out the current user and clears session tokens.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout, proceed with clearing frontend state
    }
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  /**
   * Verifies the saved token session with the backend and fetches user profile.
   * @returns {Promise<boolean>} Whether session is active
   */
  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }

    set({ loading: true });
    try {
      const data = await authService.me();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true, loading: false });
        return true;
      }
      throw new Error();
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
      return false;
    }
  }
}));
