import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ChatWindow from './components/chat/ChatWindow';
import Toast from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import { Reports } from './pages/Reports';
import Login from './pages/Login';
import { useAuthStore } from './stores/useAuthStore';
import { IconLoader } from '@tabler/icons-react';

/**
 * Root App component. Integrates layout wrappers, routes, global notifications, and AI Chat context.
 * Performs auth verification on mount.
 * @returns {React.ReactElement}
 */
export function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecking(false);
    };
    initAuth();
  }, [checkAuth]);

  if (authChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <IconLoader size={36} className="spin text-primary" />
          <span className="text-xs font-bold text-text-secondary">Memuat Sesi...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toast />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-bg text-text antialiased">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Middle Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header Topbar */}
          <Topbar aiPanelOpen={aiPanelOpen} setAiPanelOpen={setAiPanelOpen} />

          {/* Dynamic View Scrollable Box */}
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Right Collapsible AI Chat Sidebar */}
        <ChatWindow open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

        {/* Global Floating Notification Toast Component */}
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default App;
