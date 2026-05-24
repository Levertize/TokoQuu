import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IconBuildingStore, 
  IconLayoutDashboard, 
  IconCashRegister, 
  IconBox, 
  IconChartBar, 
  IconSun, 
  IconMoon 
} from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';
import { useAuthStore } from '../../stores/useAuthStore';

/**
 * Sidebar layout component. Handles theme toggling and page routing.
 * @returns {React.ReactElement}
 */
export function Sidebar() {
  const { showToast } = useToastStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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

  const navItems = [
    { to: '/', icon: IconLayoutDashboard, label: 'Dashboard', tooltip: 'Dashboard' },
    { to: '/pos', icon: IconCashRegister, label: 'Kasir / POS', tooltip: 'Kasir / POS' },
    { to: '/products', icon: IconBox, label: 'Produk & Stok', tooltip: 'Produk & Stok' },
    { to: '/reports', icon: IconChartBar, label: 'Laporan', tooltip: 'Laporan' },
  ];

  return (
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
          onClick={async () => {
            if (window.confirm('Apakah Anda yakin ingin keluar?')) {
              await logout();
              showToast('Logout berhasil!', 'success');
            }
          }}
          title={`Keluar (${user?.full_name || 'Admin'})`}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-primary-pale flex items-center justify-center text-xs font-bold text-primary cursor-pointer border-2 border-border"
        >
          {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
        </div>
      </div>
    </nav>
  );
}
export default Sidebar;
