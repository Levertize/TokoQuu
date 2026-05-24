import React from 'react';
import { IconBulb } from '@tabler/icons-react';

const promptsByPage = {
  dashboard: [
    { text: '💰 Pendapatan hari ini?', query: 'Berapa total pendapatan hari ini?' },
    { text: '⚠️ Produk kritis?', query: 'Stok produk mana saja yang sudah kritis hari ini?' },
    { text: '📈 Produk terlaris?', query: 'Produk apa yang paling laris minggu ini?' },
    { text: '⚡ Ringkasan Toko', query: 'Tolong berikan ringkasan performa toko hari ini berdasarkan data?' }
  ],
  pos: [
    { text: '💡 Rekomendasi Promosi', query: 'Berikan ide promo / diskon bundling menarik bagi pembeli di kasir saat ini' },
    { text: '🏷️ Tawarkan Produk Margin Besar', query: 'Produk apa yang margin keuntungannya paling besar untuk ditawarkan ke pelanggan?' },
    { text: '🛒 Trik Upselling Kasir', query: 'Bagaimana cara melakukan upselling produk tambahan secara halus di kasir?' },
    { text: '📦 Cek Stok Mie Goreng & Aqua', query: 'Apakah stok Aqua 600ml dan Mie Goreng aman untuk transaksi berikutnya?' }
  ],
  products: [
    { text: '📉 Produk lambat terjual?', query: 'Produk apa saja yang penjualannya lambat (slow-moving) dan bagaimana solusinya?' },
    { text: '⏰ Kapan harus restock Aqua?', query: 'Kapan estimasi saya harus memesan kembali Aqua 600ml berdasarkan tren?' },
    { text: '💰 Atur Margin Keuntungan', query: 'Bagaimana cara mengoptimalkan margin keuntungan produk catalog?' },
    { text: '⚠️ Batas minimum ideal', query: 'Berapa batas minimum stok (min stock) ideal untuk produk kategori Minuman?' }
  ],
  reports: [
    { text: '📅 Bandingkan minggu lalu', query: 'Bandingkan total penjualan minggu ini dengan minggu lalu' },
    { text: '🕐 Jam ramai pembeli', query: 'Jam berapa saja biasanya toko paling ramai pembeli dan strateginya?' },
    { text: '📊 Keuntungan kategori', query: 'Kategori mana yang menyumbang keuntungan bersih terbesar?' },
    { text: '📈 Tren produk meningkat', query: 'Tunjukkan tren produk yang penjualannya meningkat tajam bulan ini' }
  ]
};

/**
 * QuickPrompts component. Displays contextual quick suggestions.
 * @param {Object} props
 * @param {string} props.pageName Active page identifier
 * @param {Function} props.onSelect Handler when a prompt is clicked
 * @returns {React.ReactElement}
 */
export function QuickPrompts({ pageName, onSelect }) {
  const activePrompts = promptsByPage[pageName] || promptsByPage.dashboard;

  return (
    <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto pr-1">
      {activePrompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(p.query)}
          className="bg-surface border border-border border-l-4 border-l-purple/50 rounded py-2 px-2.5 text-[11px] text-left cursor-pointer text-text font-bold hover:border-purple hover:bg-purple-light/20 hover:translate-x-1 hover:shadow-sm transition-all duration-200 leading-snug flex items-start gap-1.5 group"
        >
          <IconBulb size={12} className="text-purple shrink-0 mt-0.5 group-hover:animate-bounce" />
          <span>{p.text}</span>
        </button>
      ))}
    </div>
  );
}
export default QuickPrompts;
