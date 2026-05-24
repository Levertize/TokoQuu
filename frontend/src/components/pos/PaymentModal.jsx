import React, { useState, useEffect } from 'react';
import { 
  IconCash, 
  IconQrcode, 
  IconCreditCard, 
  IconLoader, 
  IconCircleCheck, 
  IconCopy 
} from '@tabler/icons-react';
import { useCartStore } from '../../stores/useCartStore';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * PaymentModal handles the POS checkout options (Cash, QRIS, Bank Transfer).
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess
 * @returns {React.ReactElement}
 */
export function PaymentModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToastStore();
  const checkout = useTransactionStore((state) => state.checkout);
  const cartStore = useCartStore();
  
  const [method, setMethod] = useState('cash');
  const [cash, setCash] = useState('');
  const [senderName, setSenderName] = useState('');
  const [qrisStatus, setQrisStatus] = useState('waiting'); // waiting, scanned

  const summary = cartStore.getSummary();
  const diff = (parseFloat(cash) || 0) - summary.total;

  // Simulate QRIS scanning process
  useEffect(() => {
    let t;
    if (isOpen && method === 'qris') {
      setQrisStatus('waiting');
      t = setTimeout(() => {
        setQrisStatus('scanned');
        showToast('Pembayaran QRIS berhasil discan oleh pelanggan!', 'success');
      }, 3000);
    }
    return () => clearTimeout(t);
  }, [isOpen, method]);

  if (!isOpen) return null;

  const handleQuickCash = (amt) => {
    setCash(amt === 0 ? summary.total : amt);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1310012345678');
    showToast('Nomor rekening berhasil disalin!', 'success');
  };

  const handleConfirm = async () => {
    if (method === 'cash' && diff < 0) {
      showToast('Uang yang diterima masih kurang!', 'error');
      return;
    }
    if (method === 'bank' && !senderName.trim()) {
      showToast('Nama pengirim / referensi transfer harus diisi!', 'warning');
      return;
    }

    const cartParams = {
      cart: cartStore.cart,
      paymentMethod: method,
      cashReceived: method === 'cash' ? cash : summary.total,
      bankRef: senderName,
      getSummary: cartStore.getSummary
    };

    const res = await checkout(cartParams, 'Umum');
    if (res.success) {
      showToast('Pembayaran berhasil dikonfirmasi!', 'success');
      cartStore.clearCart();
      onSuccess(res.transaction);
      onClose();
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-[550px] shadow-2xl flex flex-col max-h-[85vh] animate-[fade-in_0.2s_ease-out]">
        
        {/* Modal Head */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
          <span className="text-base font-bold text-text">Kasir — Proses Pembayaran</span>
          <button className="text-text-secondary hover:bg-bg hover:text-text text-xl w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2.5">
            <button className={`border-2 rounded p-3.5 flex flex-col items-center gap-2 font-bold text-xs active:scale-95 hover:border-primary/50 transition-all cursor-pointer ${method === 'cash' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`} onClick={() => setMethod('cash')}><IconCash size={20} />Tunai (Cash)</button>
            <button className={`border-2 rounded p-3.5 flex flex-col items-center gap-2 font-bold text-xs active:scale-95 hover:border-primary/50 transition-all cursor-pointer ${method === 'qris' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`} onClick={() => setMethod('qris')}><IconQrcode size={20} />QRIS Dinamis</button>
            <button className={`border-2 rounded p-3.5 flex flex-col items-center gap-2 font-bold text-xs active:scale-95 hover:border-primary/50 transition-all cursor-pointer ${method === 'bank' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`} onClick={() => setMethod('bank')}><IconCreditCard size={20} />Transfer Bank</button>
          </div>

          {/* Billing Info */}
          <div className="border-b-2 border-border pb-3 text-sm flex flex-col gap-1.5 font-semibold text-text">
            <div className="flex justify-between"><span>Total Belanja</span><span>{formatCurrency(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span>Pajak PPN (11%)</span><span>{formatCurrency(summary.tax)}</span></div>
            <div className="flex justify-between text-base font-extrabold text-primary pt-1.5 border-t border-border mt-1"><span>Total Tagihan</span><span>{formatCurrency(summary.total)}</span></div>
          </div>

          {/* CASH OPTION */}
          {method === 'cash' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary">Uang Diterima (Rp)</label>
                <input className="w-full border border-border rounded py-2.5 px-3.5 text-sm bg-surface text-text outline-none focus:border-primary" type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="Masukkan jumlah nominal tunai..." />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-bg border border-border py-2 px-3 text-xs font-bold rounded hover:border-primary hover:text-primary hover:bg-primary-light/10 active:scale-95 transition-all text-text" onClick={() => handleQuickCash(0)}>Uang Pas</button>
                {[10000, 20000, 50000, 100000, 200000].map(v => (
                  <button key={v} className="bg-bg border border-border py-2 px-3 text-xs font-bold rounded hover:border-primary hover:text-primary hover:bg-primary-light/10 active:scale-95 transition-all text-text" onClick={() => handleQuickCash(v)}>{formatCurrency(v)}</button>
                ))}
              </div>
              <div className="flex justify-between bg-bg p-3.5 rounded border border-border mt-1 text-sm font-bold">
                <span className="text-text-secondary">Uang Kembalian</span>
                <span style={{ color: diff >= 0 ? 'var(--green)' : 'var(--danger)' }}>{diff >= 0 ? formatCurrency(diff) : `Kurang ${formatCurrency(Math.abs(diff))}`}</span>
              </div>
            </div>
          )}

          {/* QRIS OPTION */}
          {method === 'qris' && (
            <div className="flex flex-col items-center gap-3 py-3 text-center">
              <div className="w-[160px] h-[160px] bg-white border-4 border-border p-1.5 rounded flex items-center justify-center">
                <svg width="130" height="130" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                  <path d="M0 0h30v5H0zm35 0h10v5H35zm15 0h10v5H50zm15 0h35v5H65zM0 10h5v15H0zm10 0h5v5H10zm10 0h10v5H20zm15 0h5v15H35zm15 0h10v10H50zm25 0h5v10h-5zm10 0h15v5H85zm-15 15h5v5h-5zm15 0h5v10h-5zm10 0h5v5h-5zM0 35h15v5H0zm25 0h5v5H25zm15 0h5v5H40zm10 0h15v5H50zm20 0h10v10H70zm15 0h15v5H85zm-85 10h10v5H0zm15 0h5v10h-5zm10 0h5v5H25zm20 0h5v5H45zm25 0h10v5H70zm20 0h10v5H90zM0 65h35v5H0zm40 0h15v5H40zm25 0h5v5h-5zm10 0h10v5H75zm15 0h10v5H90zm-80 10h5v15H10zm10 0h15v5H20zm20 0h5v5H40zm10 0h5v5H50zm15 0h15v5H65zm25 0h10v5H90zM0 85h5v15H0zm10 0h5v5H10zm25 0h10v5H35zm15 0h10v5H50zm15 0h10v10H65zm15 0h5v5H80zm10 0h10v5H90zm-65 10h5v5h-5zm10 0h5v5H35zm15 0h5v5H50zm25 0h5v5H75z" fill="var(--text)" />
                  <rect x="3" y="3" width="10" height="10" fill="none" stroke="var(--text)" strokeWidth="2"/>
                  <rect x="3" y="87" width="10" height="10" fill="none" stroke="var(--text)" strokeWidth="2"/>
                  <rect x="87" y="3" width="10" height="10" fill="none" stroke="var(--text)" strokeWidth="2"/>
                  <rect x="42" y="42" width="16" height="16" fill="var(--primary)"/>
                </svg>
              </div>
              <div className="font-bold text-[13px] flex items-center gap-1">
                {qrisStatus === 'waiting' ? (
                  <><IconLoader className="spin text-primary" size={16} /> Menunggu scan dari pembayar...</>
                ) : (
                  <><IconCircleCheck className="text-green" size={16} /> QRIS Terdeteksi! Siap konfirmasi.</>
                )}
              </div>
              <div className="text-[11px] text-text-secondary leading-tight">Scan QRIS di atas dengan Gopay, OVO, Dana, LinkAja, atau Mobile Banking</div>
            </div>
          )}

          {/* TRANSFER BANK OPTION */}
          {method === 'bank' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary">Rekening Toko (Tujuan Transfer)</label>
                <div className="bg-bg p-3.5 rounded border border-border flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-text-secondary font-bold">BANK MANDIRI</div>
                    <div className="text-sm font-extrabold font-mono mt-0.5">131-00-1234567-8</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">a/n CV TOKO MAJU JAYA</div>
                  </div>
                  <button className="h-8 px-3 rounded text-xs font-bold bg-surface border border-border text-text-secondary hover:text-text hover:bg-bg active:scale-95 transition-all flex items-center gap-1" onClick={handleCopyAccount}><IconCopy size={12} />Salin</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary">Nomor Referensi Transfer / Nama Pengirim</label>
                <input className="w-full border border-border rounded py-2 px-3.5 text-sm bg-surface text-text outline-none focus:border-primary" type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="cth: Mandiri - Budi Sudrajat" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Foot */}
        <div className="p-4 px-6 border-t border-border flex justify-end gap-2.5 bg-[rgba(148,163,184,0.01)] shrink-0">
          <button className="btn-secondary h-10 px-5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-[0.98] transition-all" onClick={onClose}>Batal</button>
          <button className="btn-primary h-10 px-5 rounded text-white bg-gradient-to-r from-primary to-primary-hover text-xs font-bold shadow-[0_3px_10px_rgba(217,119,6,0.1)] hover:shadow-[0_5px_15px_rgba(217,119,6,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.98] transition-all" onClick={handleConfirm}>Konfirmasi Pembayaran</button>
        </div>
      </div>
    </div>
  );
}
export default PaymentModal;
