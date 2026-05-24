import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  IconRobot, 
  IconEyeglass, 
  IconSend, 
  IconX, 
  IconSparkles, 
  IconBrain
} from '@tabler/icons-react';
import { useProductStore } from '../../stores/useProductStore';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { MessageBubble } from './MessageBubble';
import { QuickPrompts } from './QuickPrompts';
import { Select } from '../ui/Select';

const MODEL_OPTIONS = [
  '✨ Gemini 2.0 Flash',
  '🧠 Gemini 1.5 Pro',
  '🏠 Ollama (Lokal)'
];

const pageLabelMap = {
  '/': 'dashboard', '/dashboard': 'dashboard',
  '/pos': 'pos',
  '/products': 'products',
  '/reports': 'reports'
};

const pageNameMap = {
  dashboard: 'Dashboard Utama',
  pos: 'Point of Sale (Kasir)',
  products: 'Manajemen Produk',
  reports: 'Laporan & Analitik'
};

/**
 * AI Chat panel component. Manages conversational list and simulated responses.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @returns {React.ReactElement}
 */
export function ChatWindow({ open, onClose }) {
  const location = useLocation();
  const activePageLabel = pageLabelMap[location.pathname] || 'dashboard';
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Halo! Saya adalah AI Assistant toko Anda. 👋<br>Saya mendeteksi halaman aktif Anda secara real-time untuk memberikan saran yang relevan. Ajukan pertanyaan seputar data stok, transaksi, atau performa penjualan.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [model, setModel] = useState('✨ Gemini 2.0 Flash');
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Evaluates mockup query responses based on app state.
   */
  const evaluateResponse = (q) => {
    const lowerQ = q.toLowerCase();
    const products = useProductStore.getState().products;
    const transactions = useTransactionStore.getState().transactions;

    if (lowerQ.includes('laris') || lowerQ.includes('top')) {
      return `Berikut adalah <b>3 Produk Terlaris</b> minggu ini:<br>
      💧 Aqua 600ml (312 pcs)<br>
      🍵 Teh Botol (287 pcs)<br>
      🍜 Mie Goreng (251 pcs)<br>
      Mie Goreng memberikan profit margin terbesar (75%).`;
    }
    if (lowerQ.includes('stok') || lowerQ.includes('tipis') || lowerQ.includes('restock') || lowerQ.includes('kritis')) {
      const low = products.filter(p => p.stock <= p.min_stock);
      if (!low.length) return 'Semua stok produk saat ini dalam kondisi aman (di atas batas minimum).';
      return `Membaca data stok, ada <b>${low.length} produk</b> kritis:<br>` + 
        low.map(p => `• <b>${p.emoji} ${p.name}</b>: sisa ${p.stock} pcs (min: ${p.min_stock})`).join('<br>') +
        '<br>Rekomendasi: Segera restock produk di atas.';
    }
    if (lowerQ.includes('pendapatan') || lowerQ.includes('omset') || lowerQ.includes('toko hari ini')) {
      const today = new Date().toISOString().slice(0, 10);
      const todayTxs = transactions.filter(t => t.created_at.startsWith(today));
      const revenue = todayTxs.reduce((sum, t) => sum + t.total_amount, 0);
      return `Pendapatan hari ini: <b>Rp ${revenue.toLocaleString('id-ID')}</b> dari <b>${todayTxs.length} transaksi</b>.<br>Rata-rata belanja: Rp ${(todayTxs.length ? Math.round(revenue / todayTxs.length) : 0).toLocaleString('id-ID')}.`;
    }
    if (lowerQ.includes('margin') || lowerQ.includes('untung')) {
      const sorted = [...products].sort((a,b) => ((b.sell_price-b.buy_price)/b.sell_price) - ((a.sell_price-a.buy_price)/a.sell_price));
      if (!sorted.length) return 'Katalog kosong.';
      const top = sorted[0]; const btm = sorted[sorted.length-1];
      return `Margin Tertinggi: <b>${top.name} (${Math.round((top.sell_price-top.buy_price)/top.sell_price*100)}%)</b><br>Margin Terendah: <b>${btm.name} (${Math.round((btm.sell_price-btm.buy_price)/btm.sell_price*100)}%)</b>`;
    }
    if (lowerQ.includes('promo') || lowerQ.includes('bundling') || lowerQ.includes('upselling')) {
      return `Taktik promosi kasir:<br>1. **Paket Sarapan**: Roti Tawar 🍞 + Susu UHT 🥛 seharga Rp 17.000.<br>2. **Paket Segar**: Aqua 600ml 💧 + Teh Botol 🍵 seharga Rp 8.000.`;
    }
    if (lowerQ.includes('minggu') || lowerQ.includes('banding')) {
      return `Penjualan minggu ini Rp 15,3 Jt (+10.8% dibanding minggu lalu). Minuman berkontribusi tertinggi.`;
    }
    if (lowerQ.includes('ramai') || lowerQ.includes('jam')) {
      return `Jam sibuk utama: 11.00-13.00 (Makan siang) & 18.30-20.00 (Pulang kerja). Siapkan kasir cadangan di jam ini.`;
    }
    return `Pertanyaan Anda tentang "<em>${q}</em>" diterima. Integrasi Gemini 2.0 akan memproses SQLite di versi backend.`;
  };

  /**
   * Dispatches user message and triggers mock AI response.
   */
  const handleSend = (text = inputVal) => {
    const q = text.trim();
    if (!q) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q, timestamp: new Date().toISOString() };
    const typingId = 'typing-' + Date.now();
    const typingMsg = { id: typingId, sender: 'ai', isTyping: true, timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInputVal('');

    setTimeout(() => {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        const aiAnswer = {
          id: Date.now() + 1,
          sender: 'ai',
          text: evaluateResponse(q),
          timestamp: new Date().toISOString()
        };
        return [...filtered, aiAnswer];
      });
    }, 1000);
  };

  return (
    <aside className={`bg-surface flex flex-col overflow-hidden shrink-0 transition-all duration-300 z-[90] shadow-[-4px_0_20px_rgba(0,0,0,0.03)] ${
      open ? 'w-[340px] border-l border-border' : 'w-0 border-l-0'
    } h-screen`}>
      <div className="w-[340px] h-full flex flex-col overflow-hidden bg-gradient-to-b from-surface via-surface to-bg/20">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-purple-light/20 to-primary-light/10 dark:from-purple-pale/10 dark:to-primary-pale/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple to-indigo-600 rounded flex items-center justify-center text-white shadow-[0_0_12px_rgba(109,40,217,0.3)] animate-pulse">
              <IconRobot size={20} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-text flex items-center gap-1">
                AI Copilot <IconSparkles size={13} className="text-purple animate-pulse" />
              </div>
              <div className="text-[10px] text-teal-mid flex items-center gap-1 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-mid opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-mid"></span>
                </span>
                Gemini 2.0
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-secondary hover:bg-bg hover:text-text p-1.5 rounded-full transition-colors" 
            title="Sembunyikan AI Assistant"
          >
            <IconX size={16} />
          </button>
        </div>
        
        {/* Context Badge */}
        <div className="mx-4 mt-3 mb-1 p-2 px-3 bg-purple-light/20 dark:bg-purple-pale/10 border border-purple-pale/30 rounded text-[11px] font-bold text-purple flex items-center gap-1.5 shrink-0 shadow-sm">
          <IconEyeglass size={14} className="text-purple" />
          <span>Konteks: {pageNameMap[activePageLabel]}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
          <div ref={msgsEndRef} />
        </div>

        {/* Suggestions & Model Selection */}
        <div className="p-3.5 px-4 border-t border-border flex flex-col gap-3 bg-[rgba(148,163,184,0.01)] shrink-0">
          <div className="text-[10px] font-bold text-text-secondary tracking-wider uppercase flex items-center gap-1">
            <IconSparkles size={12} className="text-purple" /> Pertanyaan Cepat
          </div>
          <QuickPrompts pageName={activePageLabel} onSelect={handleSend} />
          
          <div className="flex flex-col gap-1 border-t border-border pt-2.5">
            <label className="text-[10px] font-bold text-text-secondary tracking-wider uppercase flex items-center gap-1">
              <IconBrain size={12} className="text-purple" /> Model AI
            </label>
            <Select
              options={MODEL_OPTIONS}
              value={model}
              onChange={setModel}
              className="w-full"
              buttonClassName="h-8 py-1 px-2.5 text-xs font-bold rounded bg-bg border border-border hover:border-purple focus:border-purple"
            />
          </div>
        </div>

        {/* Input */}
        <div className="p-3.5 px-4 border-t border-border bg-surface shrink-0">
          <div className="flex gap-2 border border-border focus-within:border-purple focus-within:ring-2 focus-within:ring-purple/10 rounded bg-bg p-1.5 items-center transition-all duration-200">
            <input 
              className="flex-1 bg-transparent text-xs text-text outline-none px-2"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Tanya AI seputar data toko..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()} 
              className="w-8 h-8 bg-gradient-to-br from-purple to-indigo-600 hover:from-purple-hover hover:to-indigo-700 text-white rounded flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(109,40,217,0.2)] hover:translate-y-[-1px] transition-transform"
            >
              <IconSend size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
export default ChatWindow;
