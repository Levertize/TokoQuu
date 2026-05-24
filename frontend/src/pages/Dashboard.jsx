import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconCash, 
  IconReceipt, 
  IconUsers, 
  IconAlertTriangle, 
  IconTrendingUp, 
  IconTrendingDown,
  IconPackage,
  IconCheckbox
} from '@tabler/icons-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useProductStore } from '../stores/useProductStore';
import { useTransactionStore } from '../stores/useTransactionStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatTime } from '../utils/formatDate';

/**
 * Dashboard page component. Shows shop performance overview.
 * @returns {React.ReactElement}
 */
export function Dashboard() {
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const transactions = useTransactionStore((state) => state.transactions);

  // Compute live statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = transactions.filter(t => t.created_at.startsWith(today) && t.status === 'completed');
    const todayRevenue = todayTxs.reduce((sum, t) => sum + t.total_amount, 0);
    const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;
    
    return {
      revenue: todayRevenue + 2317500, // mockup baseline + today's checkouts
      txCount: todayTxs.length + 43, // mockup baseline + today's checkouts
      customers: 39,
      lowStock: lowStockCount
    };
  }, [products, transactions]);

  // Dynamic Chart Data based on live transactions
  const chartData = useMemo(() => {
    const baseline = [1800000, 2100000, 1500000, 2400000, 2900000, 3200000];
    return [
      { name: 'Sen', revenue: baseline[0] },
      { name: 'Sel', revenue: baseline[1] },
      { name: 'Rab', revenue: baseline[2] },
      { name: 'Kam', revenue: baseline[3] },
      { name: 'Jum', revenue: baseline[4] },
      { name: 'Sab', revenue: baseline[5] },
      { name: 'Min', revenue: stats.revenue },
    ];
  }, [stats.revenue]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.min_stock).slice(0, 4);
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Pendapatan Hari Ini" value={formatCurrency(stats.revenue)} trend="+12% vs kemarin" trendUp={true} icon={IconCash} color="primary" />
        <StatCard title="Total Transaksi" value={stats.txCount} trend="+8 hari ini" trendUp={true} icon={IconReceipt} color="blue" />
        <StatCard title="Pelanggan Baru" value={stats.customers} trend="+5 baru" trendUp={true} icon={IconUsers} color="teal" />
        <StatCard title="Stok Menipis" value={stats.lowStock} trend="Perlu restock" trendUp={false} icon={IconAlertTriangle} color="coral" />
      </div>

      {/* Graphs and Alert Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 shadow-card hover:shadow-hover transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px]">Pendapatan 7 Hari Terakhir</h2>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.00}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}jt`} />
                <Tooltip formatter={val => [formatCurrency(val), 'Pendapatan']} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: 'var(--radius)' }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fill="url(#chartGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-card">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px] mb-4">Stok Perlu Perhatian</h2>
          <div className="flex flex-col gap-2.5">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-text-secondary text-xs font-semibold">
                <IconCheckbox size={24} className="text-green mx-auto mb-1.5" />
                Semua stok produk aman & melimpah!
              </div>
            ) : (
              lowStockProducts.map(p => {
                const isCritical = p.stock <= 3;
                return (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded border border-border bg-bg ${isCritical ? 'critical-pulse' : ''}`}>
                    <div className="w-9 h-9 bg-primary-light rounded flex items-center justify-center text-primary shrink-0"><IconPackage size={18} /></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-text">{p.name}</div>
                      <div className="text-[11px] text-text-secondary">Sisa {p.stock} pcs (min: {p.min_stock})</div>
                    </div>
                    <span className={`pill ${isCritical ? 'r' : 'a'}`}>{isCritical ? 'Kritis' : 'Rendah'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-card">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-sm font-bold text-text">Transaksi Terakhir</h2>
          <button onClick={() => navigate('/reports')} className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1">Lihat Laporan →</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>#ID Invoice</th>
              <th>Pelanggan</th>
              <th>Metode Bayar</th>
              <th>Total</th>
              <th>Waktu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 4).map((tx) => (
              <tr key={tx.id}>
                <td className="text-text-secondary font-mono font-bold">{tx.invoice_number}</td>
                <td>{tx.customer_name}</td>
                <td>{tx.payment_method.toUpperCase()}</td>
                <td className="font-bold">{formatCurrency(tx.total_amount)}</td>
                <td>{formatTime(tx.created_at)}</td>
                <td>
                  <span className={`pill ${tx.status === 'completed' ? 'g' : 'a'}`}>
                    {tx.status === 'completed' ? 'Lunas' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * StatCard sub-component.
 */
function StatCard({ title, value, trend, trendUp, icon: Icon, color }) {
  const colorMap = {
    primary: 'bg-primary-light text-primary',
    blue: 'bg-blue-light text-blue',
    teal: 'bg-teal-light text-teal-mid',
    coral: 'bg-coral-light text-coral-mid'
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 shadow-card hover:translate-y-[-2px] hover:shadow-hover transition-all relative overflow-hidden">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs text-text-secondary font-semibold">{title}</span>
        <div className={`w-[42px] h-[42px] rounded flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-[28px] font-extrabold tracking-tight mb-1.5 text-text">{value}</div>
      <div className={`text-xs flex items-center gap-1 font-semibold ${trendUp ? 'up' : 'down'}`}>
        {trendUp ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />} {trend}
      </div>
    </div>
  );
}
