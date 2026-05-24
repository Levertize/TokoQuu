import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconCash, 
  IconReceipt, 
  IconStar, 
  IconCoin, 
  IconTrendingUp, 
  IconTrendingDown,
  IconLoader,
  IconEye,
  IconX,
  IconSearch
} from '@tabler/icons-react';
import { reportService } from '../services/reportService';
import { transactionService } from '../services/transactionService';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useToastStore } from '../stores/useToastStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatTime } from '../utils/formatDate';
import { ReceiptModal } from '../components/pos/ReceiptModal';

const catColors = {
  'Minuman': 'bg-primary',
  'Makanan': 'bg-blue',
  'Snack': 'bg-teal-mid',
  'Kebutuhan Rumah': 'bg-purple'
};

/**
 * Reports page component. Displays monthly summary, top products, categories and hourly peak charts.
 * Now contains recent transactions with print/download/void options.
 * @returns {React.ReactElement}
 */
export function Reports() {
  const { showToast } = useToastStore();
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const cancelTransaction = useTransactionStore((state) => state.cancelTransaction);

  const [monthly, setMonthly] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for preview & details
  const [activeTx, setActiveTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [monthlyRes, topRes, hourlyRes] = await Promise.all([
          reportService.getMonthlyReport(),
          reportService.getTopProducts({ limit: 5 }),
          reportService.getHourlyReport(),
          fetchTransactions()
        ]);
        if (active) {
          if (monthlyRes.success) setMonthly(monthlyRes.data);
          if (topRes.success) setTopProducts(topRes.data);
          if (hourlyRes.success) setHourly(hourlyRes.data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReports();
    return () => { active = false; };
  }, [fetchTransactions]);

  const processedTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const matchQuery = 
        tx.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.customer_name && tx.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = 
        statusFilter === 'all' || 
        tx.status === statusFilter;
      const matchDate = 
        !dateFilter || 
        tx.created_at.startsWith(dateFilter);
      return matchQuery && matchStatus && matchDate;
    });

    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'date-asc') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'total-desc') {
        return b.total_amount - a.total_amount;
      } else if (sortBy === 'total-asc') {
        return a.total_amount - b.total_amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, statusFilter, dateFilter, sortBy]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;

  const handleViewReceipt = async (id) => {
    try {
      setTxLoading(true);
      const res = await transactionService.getTransactionById(id);
      if (res.success) {
        setActiveTx(res.data);
        setIsReceiptOpen(true);
      } else {
        showToast(res.error || 'Gagal memuat detail transaksi', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Gagal memuat detail transaksi', 'error');
    } finally {
      setTxLoading(false);
    }
  };

  const handleCancelTx = async (id, invoiceNumber) => {
    if (window.confirm(`Apakah Anda yakin ingin membatalkan transaksi ${invoiceNumber}? Stok produk akan dikembalikan.`)) {
      const res = await cancelTransaction(id);
      if (res.success) {
        showToast(`Transaksi ${invoiceNumber} berhasil dibatalkan!`, 'success');
        const monthlyRes = await reportService.getMonthlyReport();
        if (monthlyRes.success) setMonthly(monthlyRes.data);
      } else {
        showToast(res.error || 'Gagal membatalkan transaksi', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <IconLoader size={32} className="spin text-primary" />
      </div>
    );
  }

  const summary = monthly?.summary || {};
  const categories = monthly?.categories || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Monthly Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ReportStatCard title="Pendapatan Bulan Ini" value={formatCurrency(summary.monthlyRevenue || 0)} trend={`${summary.revenueGrowthPct >= 0 ? '+' : ''}${summary.revenueGrowthPct || 0}% vs bulan lalu`} trendUp={(summary.revenueGrowthPct || 0) >= 0} icon={IconCash} color="primary" delayClass="delay-75" />
        <ReportStatCard title="Total Transaksi" value={summary.txCount || 0} trend={`${summary.txGrowthCount >= 0 ? '+' : ''}${summary.txGrowthCount || 0} transaksi`} trendUp={(summary.txGrowthCount || 0) >= 0} icon={IconReceipt} color="blue" delayClass="delay-100" />
        <ReportStatCard title="Produk Terlaris" value={summary.topProduct || 'N/A'} trend={`${summary.topProductQty || 0} terjual bulan ini`} trendUp={true} icon={IconStar} color="teal" delayClass="delay-150" />
        <ReportStatCard title="Rata-rata Transaksi" value={formatCurrency(summary.avgTx || 0)} trend="Per invoice" trendUp={true} icon={IconCoin} color="purple" delayClass="delay-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-200">
        {/* Top 5 Products */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-card">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px] mb-4">Top 5 Produk Terlaris</h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Terjual</th>
                <th>Total Nilai</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => (
                <TopProductRow key={idx} name={p.name} sold={p.sold} total={p.total} isUp={p.isUp} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Category Sales & Peak Hours */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-card flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px] mb-4">Penjualan per Kategori</h2>
            <div className="flex flex-col gap-4">
              {categories.map((cat, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-text-secondary">
                    <span>{cat.name}</span>
                    <span>{cat.pct}% ({formatCurrency(cat.val)})</span>
                  </div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${catColors[cat.name] || 'bg-primary'}`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px] mb-3.5">Distribusi Transaksi Jam Sibuk</h2>
            <div className="flex items-end gap-1.5 h-16">
              {hourly.map((hr, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      hr.active 
                        ? 'bg-primary' 
                        : 'bg-primary-light dark:bg-primary-pale'
                    }`} 
                    style={{ height: hr.pct }} 
                  />
                  <span className="text-[9px] text-text-muted font-bold shrink-0">{hr.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table - Memanjang di paling bawah */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-card animate-fade-in-up delay-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-border gap-3">
          <div>
            <h2 className="text-base font-bold text-text">Riwayat Transaksi Toko</h2>
            <p className="text-xs text-text-secondary mt-0.5">Daftar seluruh transaksi POS, cetak ulang struk, dan pembatalan</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px] sm:w-48">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Cari Invoice / Pelanggan..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 border border-border bg-bg text-xs font-semibold rounded text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Date Picker Input */}
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1.5 border border-border bg-bg text-xs font-semibold rounded text-text outline-none focus:border-primary cursor-pointer text-text-secondary"
              title="Filter Tanggal"
            />
            
            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-border bg-bg text-xs font-semibold rounded text-text outline-none focus:border-primary cursor-pointer text-text-secondary"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Lunas</option>
              <option value="cancelled">Batal</option>
            </select>

            {/* Sort Filter Dropdown */}
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-border bg-bg text-xs font-semibold rounded text-text outline-none focus:border-primary cursor-pointer text-text-secondary"
            >
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="total-desc">Total Terbesar</option>
              <option value="total-asc">Total Terkecil</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>No Invoice</th>
                <th>Pelanggan</th>
                <th>Kasir</th>
                <th>Metode</th>
                <th>Total</th>
                <th>Waktu</th>
                <th>Status</th>
                <th className="text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {processedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-text-secondary font-semibold">
                    Tidak ada data transaksi ditemukan
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg/40 transition-colors">
                    <td className="font-mono font-bold text-text-secondary">{tx.invoice_number}</td>
                    <td><b>{tx.customer_name}</b></td>
                    <td>{tx.cashier_name || 'Admin'}</td>
                    <td>
                      <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-bg border border-border">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="font-bold">{formatCurrency(tx.total_amount)}</td>
                    <td>{formatTime(tx.created_at)} &nbsp;<span className="text-text-muted text-[10px]">({formatDate(tx.created_at, 'dd MMM yyyy')})</span></td>
                    <td>
                      <span className={`pill ${tx.status === 'completed' ? 'g' : 'r'}`}>
                        {tx.status === 'completed' ? 'Lunas' : 'Batal'}
                      </span>
                    </td>
                    <td className="text-center flex justify-center gap-1">
                      <button
                        onClick={() => handleViewReceipt(tx.id)}
                        disabled={txLoading}
                        className="w-8 h-8 rounded hover:bg-bg text-text-secondary hover:text-primary active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                        title="Lihat Detail Struk"
                      >
                        <IconEye size={16} />
                      </button>
                      {tx.status === 'completed' && (
                        <button
                          onClick={() => handleCancelTx(tx.id, tx.invoice_number)}
                          className="w-8 h-8 rounded hover:bg-bg text-coral-mid hover:text-danger active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                          title="Batalkan Transaksi (Void)"
                        >
                          <IconX size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {processedTransactions.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t border-border bg-[rgba(148,163,184,0.01)] text-xs shrink-0 flex-wrap gap-2.5">
            <span className="text-text-secondary font-semibold">
              Menampilkan {Math.min(processedTransactions.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(processedTransactions.length, currentPage * itemsPerPage)} dari {processedTransactions.length} transaksi
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-text-secondary disabled:cursor-not-allowed font-bold active:scale-95 transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="text-text font-bold px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-text-secondary disabled:cursor-not-allowed font-bold active:scale-95 transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Receipt Modal dialog */}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        transaction={activeTx} 
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveTx(null);
        }} 
      />
    </div>
  );
}

/**
 * ReportStatCard sub-component.
 */
function ReportStatCard({ title, value, trend, trendUp, icon: Icon, color, delayClass = '' }) {
  const colorMap = {
    primary: 'bg-primary-light text-primary',
    blue: 'bg-blue-light text-blue',
    teal: 'bg-teal-light text-teal-mid',
    purple: 'bg-purple-light text-purple'
  };

  return (
    <div className={`bg-surface border border-border rounded-lg p-5 shadow-card hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-hover transition-all relative overflow-hidden animate-fade-in-up ${delayClass}`}>
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs text-text-secondary font-semibold">{title}</span>
        <div className={`w-[42px] h-[42px] rounded flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-[24px] font-extrabold tracking-tight mb-1.5 text-text leading-tight">{value}</div>
      <div className={`text-xs flex items-center gap-1 font-semibold ${trendUp ? 'up' : 'down'}`}>
        {trendUp ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />} {trend}
      </div>
    </div>
  );
}

/**
 * TopProductRow sub-component.
 */
function TopProductRow({ name, sold, total, isUp }) {
  return (
    <tr>
      <td><b>{name}</b></td>
      <td>{sold}</td>
      <td>{formatCurrency(total)}</td>
      <td className={isUp ? 'text-teal-mid font-semibold' : 'text-coral-mid font-semibold'}>
        <span className="flex items-center gap-0.5">
          {isUp ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />} {isUp ? 'Naik' : 'Turun'}
        </span>
      </td>
    </tr>
  );
}
