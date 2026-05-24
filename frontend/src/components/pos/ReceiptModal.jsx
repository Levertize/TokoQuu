import React, { useState } from 'react';
import { IconPrinter, IconLoader } from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

/**
 * ReceiptModal component for showing and printing the receipt of a successful purchase.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Object} props.transaction details of the checkout
 * @param {Function} props.onClose
 * @returns {React.ReactElement}
 */
export function ReceiptModal({ isOpen, transaction, onClose }) {
  const { showToast } = useToastStore();
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !transaction) return null;

  const formattedDate = formatDate(transaction.created_at, 'dd/MM/yyyy HH:mm:ss');

  /**
   * Simulates the printer connection delay.
   */
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      showToast('Perintah cetak terkirim ke printer thermal!', 'success');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-[480px] shadow-2xl flex flex-col max-h-[90vh] animate-[fade-in_0.2s_ease-out]">
        
        {/* Modal Head */}
        <div className="p-4 px-5 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
          <span className="text-sm font-bold text-text">Transaksi Sukses — Cetak Struk</span>
          <button className="text-text-secondary hover:bg-bg hover:text-text text-xl w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          
          {/* Mock Receipt Container */}
          <div className="receipt-view border border-slate-300 p-5 rounded-sm text-[12.5px] leading-relaxed select-none max-h-[350px] overflow-y-auto">
            <div className="text-center font-bold mb-3.5">
              <h3 className="text-base tracking-wide">TOKO MAJU JAYA</h3>
              <div className="text-[10px] font-normal text-slate-500 mt-0.5">Jl. Kemang Raya No. 42, Jakarta</div>
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2" />
            
            <div className="flex justify-between font-mono"><span>No Invoice:</span><span>{transaction.invoice_number}</span></div>
            <div className="flex justify-between font-mono"><span>Tanggal:</span><span>{formattedDate}</span></div>
            <div className="flex justify-between font-mono"><span>Kasir:</span><span>Admin (AD)</span></div>
            
            <div className="border-t border-dashed border-slate-400 my-2" />
            
            {/* Items */}
            <div className="flex flex-col gap-1.5 font-mono">
              {transaction.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />
            
            {/* Totals */}
            <div className="flex flex-col gap-1 font-mono">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(transaction.total_amount - transaction.tax + transaction.discount)}</span></div>
              <div className="flex justify-between"><span>PPN (11%):</span><span>{formatCurrency(transaction.tax)}</span></div>
              <div className="flex justify-between"><span>Diskon:</span><span>-{formatCurrency(transaction.discount)}</span></div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />
            
            <div className="flex justify-between font-bold font-mono text-sm">
              <span>TOTAL BILL:</span>
              <span>{formatCurrency(transaction.total_amount)}</span>
            </div>
            {transaction.payment_method === 'cash' && (
              <div className="flex justify-between font-mono text-xs text-slate-500 mt-1">
                <span>Tunai Diterima:</span>
                <span>{formatCurrency(transaction.payment_amount)}</span>
              </div>
            )}
            {transaction.payment_method === 'cash' && (
              <div className="flex justify-between font-mono text-xs text-slate-500">
                <span>Kembalian:</span>
                <span>{formatCurrency(transaction.change_amount)}</span>
              </div>
            )}

            <div className="border-t border-dashed border-slate-400 my-2" />
            
            <div className="text-center text-[10px] text-slate-500 mt-3 font-mono leading-normal">
              Terima Kasih Atas Kunjungan Anda<br />
              Barang yang sudah dibeli tidak dapat ditukar
            </div>
          </div>

          {/* Printer Connection Loader */}
          {isPrinting && (
            <div className="text-center font-bold text-xs text-teal-mid flex items-center justify-center gap-1.5 animate-pulse mt-2">
              <IconPrinter className="spin text-teal-mid" size={16} /> Menghubungkan ke printer thermal...
            </div>
          )}
        </div>

        {/* Modal Foot */}
        <div className="p-4 px-5 border-t border-border flex justify-end gap-2.5 bg-[rgba(148,163,184,0.01)] shrink-0">
          <button className="btn-secondary h-10 px-5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-[0.98] transition-all" onClick={onClose} disabled={isPrinting}>Tutup</button>
          <button className="btn-primary h-10 px-5 rounded text-white bg-gradient-to-r from-primary to-primary-hover text-xs font-bold flex items-center gap-1.5 shadow-[0_3px_10px_rgba(217,119,6,0.1)] hover:shadow-[0_5px_15px_rgba(217,119,6,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.98] transition-all" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? <IconLoader size={14} className="spin" /> : <IconPrinter size={14} />} Cetak Struk Belanja
          </button>
        </div>
      </div>
    </div>
  );
}
export default ReceiptModal;
