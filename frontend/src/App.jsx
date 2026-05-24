import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ChatWindow from './components/chat/ChatWindow';
import Toast from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import { Reports } from './pages/Reports';

/**
 * Root App component. Integrates layout wrappers, routes, global notifications, and AI Chat context.
 * @returns {React.ReactElement}
 */
export function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

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
