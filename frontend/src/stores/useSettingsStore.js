import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand store for persisting application-wide store configurations
 * such as shop name, address, tax rate, and receipt footer notes.
 */
export const useSettingsStore = create(
  persist(
    (set) => ({
      storeName: 'Toko Maju Jaya',
      storeAddress: 'Jl. Kemang Raya No. 42, Jakarta',
      receiptNotes: 'Terima Kasih Atas Kunjungan Anda\nBarang yang sudah dibeli tidak dapat ditukar',
      taxRate: 11, // Tax percentage (e.g. 11 for 11%)

      /**
       * Updates the store settings.
       * @param {Object} newSettings Partial settings object
       */
      updateSettings: (newSettings) => {
        set((state) => ({
          ...state,
          ...newSettings,
        }));
      },
    }),
    {
      name: 'tokoquu-settings', // unique key for localStorage persistence
    }
  )
);

export default useSettingsStore;
