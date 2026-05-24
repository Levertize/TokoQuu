import React, { useState } from 'react';
import { IconPrinter, IconLoader, IconDownload } from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
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
  const { storeName, storeAddress, receiptNotes } = useSettingsStore();

  if (!isOpen || !transaction) return null;

  const formattedDate = formatDate(transaction.created_at, 'dd/MM/yyyy HH:mm:ss');

  const subtotalVal = transaction.total_amount - transaction.tax + transaction.discount;
  const computedTaxPercent = subtotalVal > 0 ? Math.round((transaction.tax / subtotalVal) * 100) : 11;

  const centerText = (str, width = 42) => {
    const lines = str.split('\n');
    return lines.map(l => {
      const trimmed = l.trim();
      if (trimmed.length >= width) return trimmed.substring(0, width);
      const leftPad = Math.floor((width - trimmed.length) / 2);
      return ' '.repeat(leftPad) + trimmed;
    }).join('\n');
  };


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

  /**
   * Downloads receipt as a retro text file (.txt).
   */
  const handleDownloadTxt = () => {
    const line = '------------------------------------------\n';
    let txt = '';
    txt += centerText(storeName) + '\n';
    txt += centerText(storeAddress) + '\n';
    txt += line;
    txt += `No Invoice: ${transaction.invoice_number}\n`;
    txt += `Tanggal:    ${formattedDate}\n`;
    txt += `Kasir:      ${transaction.cashier_name || 'Admin'}\n`;
    txt += `Pelanggan:  ${transaction.customer_name || 'Umum'}\n`;
    txt += line;
    transaction.items.forEach(item => {
      const itemLine = `${item.product_name} x${item.quantity}`;
      const priceStr = formatCurrency(item.unit_price * item.quantity);
      const spaces = 42 - itemLine.length - priceStr.length;
      txt += `${itemLine}${' '.repeat(spaces > 0 ? spaces : 1)}${priceStr}\n`;
    });
    txt += line;
    
    txt += `Subtotal:   ${formatCurrency(subtotalVal)}\n`;
    const taxLabel = `PPN (${computedTaxPercent}%):`;
    const taxSpaces = 12 - taxLabel.length;
    txt += `${taxLabel}${' '.repeat(taxSpaces > 0 ? taxSpaces : 1)}${formatCurrency(transaction.tax)}\n`;
    txt += `Diskon:     -${formatCurrency(transaction.discount)}\n`;
    txt += line;
    txt += `TOTAL:      ${formatCurrency(transaction.total_amount)}\n`;
    
    if (transaction.payment_method === 'cash') {
      txt += `Bayar:      ${formatCurrency(transaction.payment_amount)}\n`;
      txt += `Kembali:    ${formatCurrency(transaction.change_amount)}\n`;
    } else {
      txt += `Metode:     ${transaction.payment_method.toUpperCase()}\n`;
    }
    txt += line;
    txt += centerText(receiptNotes) + '\n';
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Struk-${transaction.invoice_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Struk berhasil diunduh sebagai file teks!', 'success');
  };

  /**
   * Triggers native browser print dialog for the receipt block.
   */
  const handleRealPrint = () => {
    const printArea = document.getElementById('receipt-print-area');
    if (!printArea) return;
    
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Struk - ${transaction.invoice_number}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              width: 320px;
              margin: 0 auto;
              color: #000;
              font-size: 13px;
              line-height: 1.4;
            }
            .text-center { text-align: center; }
            .mb-3 { margin-bottom: 12px; }
            .my-2 { margin: 8px 0; border-top: 1px dashed #000; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 11px; }
            .mt-3 { margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="text-center font-bold mb-3">
            <div class="text-sm">${storeName}</div>
            <div class="text-xs" style="font-weight: normal;">${storeAddress}</div>
          </div>
          <div class="my-2"></div>
          <div class="flex justify-between"><span>No Invoice:</span><span>${transaction.invoice_number}</span></div>
          <div class="flex justify-between"><span>Tanggal:</span><span>${formattedDate}</span></div>
          <div class="flex justify-between"><span>Kasir:</span><span>${transaction.cashier_name || 'Admin'}</span></div>
          <div class="flex justify-between"><span>Pelanggan:</span><span>${transaction.customer_name || 'Umum'}</span></div>
          <div class="my-2"></div>
          ${transaction.items.map(item => `
            <div class="flex justify-between">
              <span>${item.product_name} x${item.quantity}</span>
              <span>${formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
          `).join('')}
          <div class="my-2"></div>
          <div class="flex justify-between"><span>Subtotal:</span><span>${formatCurrency(subtotalVal)}</span></div>
          <div class="flex justify-between"><span>PPN (${computedTaxPercent}%):</span><span>${formatCurrency(transaction.tax)}</span></div>
          <div class="flex justify-between"><span>Diskon:</span><span>-${formatCurrency(transaction.discount)}</span></div>
          <div class="my-2"></div>
          <div class="flex justify-between font-bold">
            <span>TOTAL BILL:</span>
            <span>${formatCurrency(transaction.total_amount)}</span>
          </div>
          ${transaction.payment_method === 'cash' ? `
            <div class="flex justify-between text-xs mt-1">
              <span>Tunai Diterima:</span>
              <span>${formatCurrency(transaction.payment_amount)}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span>Kembalian:</span>
              <span>${formatCurrency(transaction.change_amount)}</span>
            </div>
          ` : `
            <div class="flex justify-between text-xs mt-1">
              <span>Metode Bayar:</span>
              <span>${transaction.payment_method.toUpperCase()}</span>
            </div>
          `}
          <div class="my-2"></div>
          <div class="text-center text-xs mt-3" style="white-space: pre-line;">
            ${receiptNotes}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-[480px] shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Modal Head */}
        <div className="p-4 px-5 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
          <span className="text-sm font-bold text-text">Detail Transaksi — Struk Belanja</span>
          <button className="text-text-secondary hover:bg-bg hover:text-text text-xl w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          
          {/* Mock Receipt Container */}
          <div id="receipt-print-area" className="receipt-view border border-slate-300 p-5 rounded-sm text-[12.5px] leading-relaxed select-none max-h-[350px] overflow-y-auto">
            <div className="text-center font-bold mb-3.5">
              <h3 className="text-base tracking-wide">{storeName}</h3>
              <div className="text-[10px] font-normal text-slate-500 mt-0.5">{storeAddress}</div>
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2" />
            
            <div className="flex justify-between font-mono"><span>No Invoice:</span><span>{transaction.invoice_number}</span></div>
            <div className="flex justify-between font-mono"><span>Tanggal:</span><span>{formattedDate}</span></div>
            <div className="flex justify-between font-mono"><span>Kasir:</span><span>{transaction.cashier_name || 'Admin'}</span></div>
            <div className="flex justify-between font-mono"><span>Pelanggan:</span><span>{transaction.customer_name || 'Umum'}</span></div>
            
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
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotalVal)}</span></div>
              <div className="flex justify-between"><span>PPN ({computedTaxPercent}%):</span><span>{formatCurrency(transaction.tax)}</span></div>
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
            {transaction.payment_method !== 'cash' && (
              <div className="flex justify-between font-mono text-xs text-slate-500 mt-1">
                <span>Metode Bayar:</span>
                <span>{transaction.payment_method.toUpperCase()}</span>
              </div>
            )}

            <div className="border-t border-dashed border-slate-400 my-2" />
            
            <div className="text-center text-[10px] text-slate-500 mt-3 font-mono leading-normal whitespace-pre-line">
              {receiptNotes}
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
        <div className="p-4 px-5 border-t border-border flex justify-end flex-wrap gap-2 bg-[rgba(148,163,184,0.01)] shrink-0">
          <button className="btn-secondary h-10 px-4 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-[0.98] transition-all cursor-pointer mr-auto" onClick={onClose} disabled={isPrinting}>Tutup</button>
          
          <button className="h-10 px-4 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer" onClick={handleDownloadTxt}>
            <IconDownload size={14} /> Unduh (.txt)
          </button>
          
          <button className="h-10 px-4 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer" onClick={handleRealPrint}>
            <IconPrinter size={14} /> Cetak (Fisik/PDF)
          </button>

          <button className="btn-primary h-10 px-4 rounded text-white bg-gradient-to-r from-primary to-primary-hover text-xs font-bold flex items-center gap-1.5 shadow-[0_3px_10px_rgba(217,119,6,0.1)] hover:shadow-[0_5px_15px_rgba(217,119,6,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? <IconLoader size={14} className="spin" /> : <IconPrinter size={14} />} Simulasi Printer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
