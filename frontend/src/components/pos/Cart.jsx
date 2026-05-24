import React from 'react';
import { IconShoppingCart, IconShoppingCartOff, IconCreditCard } from '@tabler/icons-react';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * POS Cart panel component. Shows active items and summary calculations.
 * @param {Object} props
 * @param {Function} props.onCheckout Triggered when checking out
 * @returns {React.ReactElement}
 */
export function Cart({ onCheckout }) {
  const cart = useCartStore((state) => state.cart);
  const adjustQty = useCartStore((state) => state.adjustQty);
  const getSummary = useCartStore((state) => state.getSummary);
  const { showToast } = useToastStore();

  const keys = Object.keys(cart);
  const summary = getSummary();

  /**
   * Adjusts item quantity safely.
   */
  const handleAdjust = (id, offset) => {
    const res = adjustQty(id, offset);
    if (res && res.message) {
      showToast(res.message, res.type);
    }
  };

  /**
   * Initiates payment checkout screen.
   */
  const handlePay = () => {
    if (!keys.length) {
      showToast('Keranjang Anda masih kosong!', 'warning');
      return;
    }
    onCheckout();
  };

  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col overflow-hidden shadow-card h-full">
      {/* Header */}
      <div className="p-3.5 px-4 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
        <span className="text-sm font-bold text-text flex items-center gap-2">
          <IconShoppingCart size={20} className="text-primary" /> Keranjang
        </span>
        <span key={summary.itemCount} className="pill a animate-pop-in" id="cart-count">{summary.itemCount} item</span>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-2">
        {!keys.length ? (
          <div className="text-center py-12 px-3 text-text-secondary">
            <IconShoppingCartOff size={40} className="text-text-muted mx-auto mb-2.5" />
            <div className="font-bold text-sm text-text">Keranjang belanja kosong</div>
            <div className="text-xs mt-1 text-text-secondary">Pilih produk di kiri untuk menambahkan</div>
          </div>
        ) : (
          keys.map((k) => {
            const item = cart[k];
            return (
              <div key={k} className="flex items-center gap-2.5 p-2.5 px-4 border-b border-dotted border-border last:border-b-0 cart-item-anim">
                <div className="flex-1">
                  <div className="text-[12.5px] font-bold text-text mb-0.5">{item.name}</div>
                  <div className="text-[11px] text-text-secondary font-medium">{formatCurrency(item.price)} / pcs</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleAdjust(item.id, -1)} className="w-6.5 h-6.5 rounded-full border border-border bg-bg text-text text-xs font-bold flex items-center justify-center hover:bg-primary-light hover:border-primary hover:text-primary active:scale-90 transition-all">−</button>
                  <span className="text-[13.5px] font-bold min-w-[24px] text-center text-text">{item.qty}</span>
                  <button onClick={() => handleAdjust(item.id, 1)} className="w-6.5 h-6.5 rounded-full border border-border bg-bg text-text text-xs font-bold flex items-center justify-center hover:bg-primary-light hover:border-primary hover:text-primary active:scale-90 transition-all">+</button>
                </div>
                <div className="text-[12.5px] font-bold min-w-[70px] text-right text-text shrink-0">{formatCurrency(item.price * item.qty)}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-4 border-t border-border bg-[rgba(148,163,184,0.01)] shrink-0">
        <div className="flex justify-between text-[12.5px] mb-1.5 text-text-secondary font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex justify-between text-[12.5px] mb-1.5 text-text-secondary font-medium">
          <span>Pajak PPN (11%)</span>
          <span>{formatCurrency(summary.tax)}</span>
        </div>
        <div className="flex justify-between text-[12.5px] mb-1.5 text-text-secondary font-medium">
          <span>Diskon Promosi</span>
          <span className="text-coral-mid">-{formatCurrency(summary.discount)}</span>
        </div>
        <div className="flex justify-between text-base font-extrabold mt-2.5 pt-2.5 border-t border-border text-text">
          <span>Total Tagihan</span>
          <span className="text-primary">{formatCurrency(summary.total)}</span>
        </div>
        
        <button
          onClick={handlePay}
          className="w-full mt-3 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(217,119,6,0.15)] hover:shadow-[0_6px_14px_rgba(217,119,6,0.25)] hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0 transition-all"
        >
          <IconCreditCard size={16} /> Proses Pembayaran
        </button>
      </div>
    </div>
  );
}
export default Cart;
