import React, { useMemo } from 'react';
import { 
  IconCash, 
  IconReceipt, 
  IconStar, 
  IconCoin, 
  IconTrendingUp, 
  IconTrendingDown 
} from '@tabler/icons-react';
import { useTransactionStore } from '../stores/useTransactionStore';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Reports page component. Displays monthly summary and charts.
 * @returns {React.ReactElement}
 */
export function Reports() {
  const transactions = useTransactionStore((state) => state.transactions);

  // Sum today's dynamic revenue to add to baseline
  const dynamicRevenue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = transactions.filter(t => t.created_at.startsWith(today) && t.status === 'completed');
    return todayTxs.reduce((sum, t) => sum + t.total_amount, 0);
  }, [transactions]);

  const stats = {
    monthlyRevenue: 48250000 + dynamicRevenue,
    txCount: 1247 + transactions.length - 4, // baseline plus new checkouts
    topProduct: 'Aqua 600ml',
    avgTx: 38600
  };

  const categories = [
    { name: 'Minuman', pct: 52, val: 'Rp 25,08jt', color: 'bg-primary' },
    { name: 'Makanan', pct: 28, val: 'Rp 13,51jt', color: 'bg-blue' },
    { name: 'Snack', pct: 12, val: 'Rp 5,79jt', color: 'bg-teal-mid' },
    { name: 'Kebutuhan Rumah', pct: 8, val: 'Rp 3,87jt', color: 'bg-purple' }
  ];

  const peakHours = [
    { hour: '07.00', pct: '20%', active: false },
    { hour: '09.00', pct: '40%', active: false },
    { hour: '11.00', pct: '65%', active: false },
    { hour: '13.00', pct: '90%', active: true },
    { hour: '15.00', pct: '70%', active: false },
    { hour: '17.00', pct: '50%', active: false },
    { hour: '19.00', pct: '85%', active: true },
    { hour: '21.00', pct: '30%', active: false }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Monthly Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ReportStatCard title="Pendapatan Bulan Ini" value={formatCurrency(stats.monthlyRevenue)} trend="+18% vs bulan lalu" trendUp={true} icon={IconCash} color="primary" />
        <ReportStatCard title="Total Transaksi" value={stats.txCount} trend="+203 transaksi" trendUp={true} icon={IconReceipt} color="blue" />
        <ReportStatCard title="Produk Terlaris" value={stats.topProduct} trend="312 terjual bulan ini" trendUp={true} icon={IconStar} color="teal" />
        <ReportStatCard title="Rata-rata Transaksi" value={formatCurrency(stats.avgTx)} trend="+Rp 4.200" trendUp={true} icon={IconCoin} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <TopProductRow name="Aqua 600ml" sold={312} total={1248000} isUp={true} />
              <TopProductRow name="Teh Botol" sold={287} total={1435000} isUp={true} />
              <TopProductRow name="Mie Goreng" sold={251} total={878500} isUp={false} />
              <TopProductRow name="Chitato" sold={198} total={1584000} isUp={true} />
              <TopProductRow name="Roti Tawar" sold={143} total={1716000} isUp={true} />
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
                    <span>{cat.pct}% ({cat.val})</span>
                  </div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.8px] mb-3.5">Distribusi Transaksi Jam Sibuk</h2>
            <div className="flex items-end gap-1.5 h-16">
              {peakHours.map((hour, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      hour.active 
                        ? 'bg-primary' 
                        : 'bg-primary-light dark:bg-primary-pale'
                    }`} 
                    style={{ height: hour.pct }} 
                  />
                  <span className="text-[9px] text-text-muted font-bold">{hour.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ReportStatCard sub-component.
 */
function ReportStatCard({ title, value, trend, trendUp, icon: Icon, color }) {
  const colorMap = {
    primary: 'bg-primary-light text-primary',
    blue: 'bg-blue-light text-blue',
    teal: 'bg-teal-light text-teal-mid',
    purple: 'bg-purple-light text-purple'
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 shadow-card hover:translate-y-[-2px] hover:shadow-hover transition-all relative overflow-hidden">
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
