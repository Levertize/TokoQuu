import React, { useState, useEffect } from 'react';
import { 
  IconCash, 
  IconReceipt, 
  IconStar, 
  IconCoin, 
  IconTrendingUp, 
  IconTrendingDown,
  IconLoader
} from '@tabler/icons-react';
import { reportService } from '../services/reportService';
import { formatCurrency } from '../utils/formatCurrency';

const catColors = {
  'Minuman': 'bg-primary',
  'Makanan': 'bg-blue',
  'Snack': 'bg-teal-mid',
  'Kebutuhan Rumah': 'bg-purple'
};

/**
 * Reports page component. Displays monthly summary, top products, categories and hourly peak charts.
 * @returns {React.ReactElement}
 */
export function Reports() {
  const [monthly, setMonthly] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [monthlyRes, topRes, hourlyRes] = await Promise.all([
          reportService.getMonthlyReport(),
          reportService.getTopProducts({ limit: 5 }),
          reportService.getHourlyReport()
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
  }, []);

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
    <div className="flex flex-col gap-6">
      {/* Monthly Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ReportStatCard title="Pendapatan Bulan Ini" value={formatCurrency(summary.monthlyRevenue || 0)} trend={`${summary.revenueGrowthPct >= 0 ? '+' : ''}${summary.revenueGrowthPct || 0}% vs bulan lalu`} trendUp={(summary.revenueGrowthPct || 0) >= 0} icon={IconCash} color="primary" />
        <ReportStatCard title="Total Transaksi" value={summary.txCount || 0} trend={`${summary.txGrowthCount >= 0 ? '+' : ''}${summary.txGrowthCount || 0} transaksi`} trendUp={(summary.txGrowthCount || 0) >= 0} icon={IconReceipt} color="blue" />
        <ReportStatCard title="Produk Terlaris" value={summary.topProduct || 'N/A'} trend={`${summary.topProductQty || 0} terjual bulan ini`} trendUp={true} icon={IconStar} color="teal" />
        <ReportStatCard title="Rata-rata Transaksi" value={formatCurrency(summary.avgTx || 0)} trend="Per invoice" trendUp={true} icon={IconCoin} color="purple" />
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
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      hr.active 
                        ? 'bg-primary' 
                        : 'bg-primary-light dark:bg-primary-pale'
                    }`} 
                    style={{ height: hr.pct }} 
                  />
                  <span className="text-[9px] text-text-muted font-bold">{hr.hour}</span>
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
