import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IconBuildingStore, 
  IconLayoutDashboard, 
  IconCashRegister, 
  IconBox, 
  IconChartBar, 
  IconSun, 
  IconMoon,
  IconSettings,
  IconLogout,
  IconMapPin,
  IconPercentage,
  IconReceipt,
  IconAlertTriangle,
  IconX,
  IconLoader
} from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

/**
 * Sidebar layout component. Handles theme toggling, settings configuration, and custom animated logout.
 * @returns {React.ReactElement}
 */
export function Sidebar() {
  const { showToast } = useToastStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Settings store & form state
  const settings = useSettingsStore();
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [receiptNotes, setReceiptNotes] = useState(settings.receiptNotes);

  // Sync settings when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setStoreName(settings.storeName);
      setStoreAddress(settings.storeAddress);
      setTaxRate(settings.taxRate);
      setReceiptNotes(settings.receiptNotes);
    }
  }, [isSettingsOpen, settings.storeName, settings.storeAddress, settings.taxRate, settings.receiptNotes]);

  // Sync theme to body element
  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * Toggles the global dark/light theme.
   */
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    
    // Add transitioning class to body for seamless HMR-free visual fade
    document.body.classList.add('theme-transitioning');
    
    setTheme(nextTheme);
    showToast(
      nextTheme === 'dark' ? 'Mengaktifkan Mode Gelap Premium' : 'Mengaktifkan Mode Terang', 
      'info'
    );

    // Clean up class after transition completes
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 350);
  };

  const handleSaveSettings = () => {
    if (!storeName.trim()) {
      showToast('Nama toko tidak boleh kosong!', 'warning');
      return;
    }
    if (!storeAddress.trim()) {
      showToast('Alamat toko tidak boleh kosong!', 'warning');
      return;
    }
    if (taxRate === '' || taxRate < 0 || taxRate > 100) {
      showToast('Pajak harus antara 0% dan 100%!', 'warning');
      return;
    }

    settings.updateSettings({
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim(),
      taxRate: parseInt(taxRate),
      receiptNotes: receiptNotes
    });

    showToast('Pengaturan toko berhasil disimpan!', 'success');
    setIsSettingsOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast('Logout berhasil! Sesi kasir diakhiri.', 'success');
      setIsLogoutConfirmOpen(false);
    } catch (err) {
      showToast('Gagal logout!', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { to: '/', icon: IconLayoutDashboard, label: 'Dashboard', tooltip: 'Dashboard' },
    { to: '/pos', icon: IconCashRegister, label: 'Kasir / POS', tooltip: 'Kasir / POS' },
    { to: '/products', icon: IconBox, label: 'Produk & Stok', tooltip: 'Produk & Stok' },
    { to: '/reports', icon: IconChartBar, label: 'Laporan', tooltip: 'Laporan' },
  ];

  return (
    <>
      <nav className="w-[72px] bg-surface border-r border-border flex flex-col items-center py-5 gap-2 shrink-0 z-[100] shadow-[2px_0_10px_rgba(0,0,0,0.01)] h-screen">
        {/* Store Logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded flex items-center justify-center mb-5 shrink-0 shadow-[0_4px_12px_rgba(217,119,6,0.25)]">
          <IconBuildingStore size={24} className="text-white" />
        </div>

        {/* Navigation Buttons */}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `w-12 h-12 rounded flex items-center justify-center relative shrink-0 transition-all group ${
                isActive ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-bg hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} />
                {/* Tooltip */}
                <span className="absolute left-16 bg-surface border border-border px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-5px] group-hover:translate-x-0 transition-all duration-150 shadow-toast text-text z-[999]">
                  {item.tooltip}
                </span>
                {/* Active Indicator dot */}
                {isActive && (
                  <div className="absolute right-1 w-1 h-4 bg-primary rounded-[4px]" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Sidebar Bottom Controls */}
        <div className="mt-auto flex flex-col items-center gap-3 w-100">
          {/* Theme Toggle Button */}
          <button 
            onClick={handleToggleTheme}
            title="Ganti Tema"
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary hover:bg-bg hover:text-text transition-transform hover:rotate-[15deg]"
          >
            {theme === 'light' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>

          {/* Profile Avatar */}
          <div 
            onClick={() => setIsSettingsOpen(true)}
            title={`Profil & Pengaturan Toko (${user?.full_name || 'Admin'})`}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-primary-pale flex items-center justify-center text-xs font-bold text-primary cursor-pointer border-2 border-border hover:scale-105 transition-transform"
          >
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
          </div>
        </div>
      </nav>

      {/* Settings & Profile Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-[540px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            {/* Modal Head */}
            <div className="p-4 px-5 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
              <div className="flex items-center gap-2">
                <IconSettings className="text-primary spin" style={{ animationDuration: '6s' }} size={20} />
                <span className="text-sm font-bold text-text">Pengaturan Toko & Profil</span>
              </div>
              <button 
                className="text-text-secondary hover:bg-bg hover:text-text text-xl w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer" 
                onClick={() => setIsSettingsOpen(false)}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              
              {/* Profile Card Section */}
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Akun Aktif</h4>
                <div className="bg-bg border border-border p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-primary-pale flex items-center justify-center text-base font-bold text-primary border border-border shrink-0">
                      {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
                    </div>
                    <div>
                      <div className="font-bold text-text text-sm leading-snug">{user?.full_name || 'Admin'}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                        <span className="bg-primary-light text-primary text-[10px] py-0.5 px-2 rounded-full font-bold uppercase tracking-wide">
                          {user?.role || 'cashier'}
                        </span>
                        <span>@{user?.username || 'admin'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="h-9 px-3 text-xs font-bold text-coral bg-coral-light/20 hover:bg-coral hover:text-white rounded border border-coral/30 hover:border-coral flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <IconLogout size={14} />
                    Keluar Sesi
                  </button>
                </div>
              </div>

              <div className="border-b border-border" />

              {/* Store Configurations */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Pengaturan Detail Toko</h4>
                
                {/* Store Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    <IconBuildingStore size={14} className="text-text-muted" /> Nama Toko / Perusahaan
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Masukkan nama toko..."
                    className="w-full h-10 px-3 rounded border border-border bg-surface text-text text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Store Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    <IconMapPin size={14} className="text-text-muted" /> Alamat Toko
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Masukkan alamat fisik toko..."
                    className="w-full h-10 px-3 rounded border border-border bg-surface text-text text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Tax Rate (PPN) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    <IconPercentage size={14} className="text-text-muted" /> Pajak Pertambahan Nilai (PPN)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="Masukkan tarif PPN (%)..."
                      className="w-full h-10 pl-3 pr-8 rounded border border-border bg-surface text-text text-sm focus:border-primary focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 text-xs font-bold text-text-secondary">%</span>
                  </div>
                </div>

                {/* Receipt Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                    <IconReceipt size={14} className="text-text-muted" /> Catatan Kaki Struk Belanja
                  </label>
                  <textarea
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                    placeholder="Pesan ucapan terima kasih di struk..."
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm focus:border-primary focus:outline-none transition-colors font-mono resize-none h-20 leading-relaxed"
                  />
                </div>
              </div>

            </div>

            {/* Modal Foot */}
            <div className="p-4 px-5 border-t border-border flex justify-end gap-2 bg-[rgba(148,163,184,0.01)] shrink-0">
              <button 
                type="button"
                className="h-10 px-4 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-95 transition-all cursor-pointer" 
                onClick={() => setIsSettingsOpen(false)}
              >
                Batal
              </button>
              
              <button 
                type="button"
                onClick={handleSaveSettings}
                className="h-10 px-5 rounded text-white bg-gradient-to-r from-primary to-primary-hover text-xs font-bold shadow-[0_3px_10px_rgba(217,119,6,0.1)] hover:shadow-[0_5px_15px_rgba(217,119,6,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Animated Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-[380px] shadow-2xl p-6 flex flex-col items-center text-center animate-pop-in relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-mid to-coral" />
            
            {/* Warning Circle Icon */}
            <div className="w-16 h-16 rounded-full bg-coral-light/20 text-coral-mid flex items-center justify-center mb-4 border border-coral-mid/20 relative shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <IconAlertTriangle size={32} />
            </div>

            {/* Confirmation Title & Text */}
            <h3 className="text-base font-bold text-text mb-2">Konfirmasi Keluar</h3>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun kasir Anda? Semua data transaksi yang belum diproses akan hilang.
            </p>

            {/* Decision Buttons */}
            <div className="flex w-full gap-3">
              <button 
                type="button" 
                disabled={isLoggingOut}
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 h-10 px-4 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                Batal
              </button>
              
              <button 
                type="button" 
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 h-10 px-4 rounded text-white bg-gradient-to-r from-coral-mid to-coral text-xs font-bold shadow-[0_3px_10px_rgba(244,63,94,0.1)] hover:shadow-[0_5px_15px_rgba(244,63,94,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoggingOut ? <IconLoader size={14} className="spin" /> : <IconLogout size={14} />}
                {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

