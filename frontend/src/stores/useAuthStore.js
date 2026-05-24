import { create } from 'zustand';

/**
 * Zustand store for authentication state management.
 */
export const useAuthStore = create((set) => ({
  user: { username: 'admin', full_name: 'Admin Toko', role: 'admin' },
  token: 'mock-jwt-token',
  isAuthenticated: true,
  loading: false,
  error: null,

  /**
   * Logs in a user with username and password.
   * @param {string} username 
   * @param {string} password 
   */
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      // Simulator delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (username === 'admin' && password === 'admin') {
        const user = { username: 'admin', full_name: 'Admin Toko', role: 'admin' };
        set({ user, token: 'mock-jwt-token', isAuthenticated: true, loading: false });
        return { success: true };
      } else {
        throw new Error('Username atau password salah!');
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /**
   * Logs out the current user.
   */
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
