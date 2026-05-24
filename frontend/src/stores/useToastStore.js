import { create } from 'zustand';

/**
 * Zustand store to control toast notifications globally.
 */
export const useToastStore = create((set) => ({
  toasts: [],

  /**
   * Adds a new toast notification. Automatically removes it after 3 seconds.
   * @param {string} message 
   * @param {'success'|'error'|'warning'|'info'} type 
   */
  showToast: (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    
    // Auto remove after 3s
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  /**
   * Manually removes a toast.
   * @param {string} id 
   */
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }
}));
