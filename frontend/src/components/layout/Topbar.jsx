import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IconRobot, IconBell } from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatDate } from '../../utils/formatDate';


/**
 * Topbar layout component. Displays page title, date, notifications, and AI panel toggle.
 * @param {Object} props
 * @param {boolean} props.aiPanelOpen
 * @param {Function} props.setAiPanelOpen
 * @returns {React.ReactElement}
 */
export function Topbar({ aiPanelOpen, setAiPanelOpen }) {
  const location = useLocation();
  const { showToast } = useToastStore();
  const [currentDateStr, setCurrentDateStr] = useState('');
  const storeName = useSettingsStore((state) => state.storeName);
  const user = useAuthStore((state) => state.user);

  const userInitials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'AD';

  // Update localized date string on mount
  useEffect(() => {
    setCurrentDateStr(formatDate(new Date()));
  }, []);

  /**
   * Resolves the current page title based on path.
   * @returns {string}
   */
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard Utama';
      case '/pos':
        return 'Point of Sale (Kasir)';
      case '/products':
        return 'Manajemen Produk & Stok';
      case '/reports':
        return 'Laporan & Analitik Toko';
      default:
        return 'Dashboard Utama';
    }
  };

  /**
   * Toggles the AI assistant panel state.
   */
  const toggleAIPanel = () => {
    const nextState = !aiPanelOpen;
    setAiPanelOpen(nextState);
    showToast(
      nextState ? 'Panel AI Assistant dibuka' : 'Panel AI Assistant ditutup',
      'info'
    );
  };

  return (
    <header className="h-[68px] bg-surface border-b border-border px-8 flex items-center justify-between shrink-0">
      <div className="flex flex-col">
        <h1 className="text-[18px] font-bold text-text leading-tight" id="ptitle">
          {getPageTitle()}
        </h1>
        <div className="text-xs text-text-secondary font-medium mt-0.5">
          {storeName} &nbsp;·&nbsp; {currentDateStr}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* AI Toggle Button */}
        <button
          onClick={toggleAIPanel}
          title="Buka/Tutup AI Assistant"
          className={`w-10 h-10 rounded border flex items-center justify-center transition-all relative ${
            aiPanelOpen
              ? 'bg-purple-light text-purple border-purple-pale shadow-[0_0_12px_rgba(109,40,217,0.25)]'
              : 'text-purple/80 border-purple/30 bg-purple-light/10 hover:bg-purple-light hover:text-purple hover:border-purple shadow-[0_0_8px_rgba(109,40,217,0.05)]'
          }`}
        >
          <IconRobot size={20} />
          {!aiPanelOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple"></span>
            </span>
          )}
        </button>

        {/* Notification Bell Button */}
        <button
          onClick={() => showToast('Belum ada notifikasi baru', 'info')}
          className="w-10 h-10 rounded border border-border flex items-center justify-center text-text-secondary hover:bg-bg hover:text-text relative"
        >
          <IconBell size={20} />
          <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-coral-mid rounded-full border-2 border-surface animate-[pulse-red_2s_infinite]" />
        </button>

        {/* Cashier profile avatar */}
        <div 
          title={user?.full_name || 'Admin'}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-primary-pale flex items-center justify-center text-xs font-bold text-primary ml-1.5 border border-border"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
export default Topbar;
