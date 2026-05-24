import React, { useState } from 'react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { Cart } from '../components/pos/Cart';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';

/**
 * POS page component. Orchestrates POS layout, shopping cart, and transaction finalization.
 * @returns {React.ReactElement}
 */
export function POS() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  /**
   * Success handler when transaction completes successfully.
   * @param {Object} tx Completed transaction object
   */
  const handlePaymentSuccess = (tx) => {
    setLastTransaction(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-[calc(100vh-146px)] overflow-hidden">
      {/* Left panel: Catalog grid */}
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col overflow-hidden">
        <ProductGrid />
      </div>

      {/* Right panel: Active Cart */}
      <div className="flex flex-col overflow-hidden h-full">
        <Cart onCheckout={() => setIsPaymentOpen(true)} />
      </div>

      {/* Checkout Payment dialog */}
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />

      {/* Checkout success receipt dialog */}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        transaction={lastTransaction} 
        onClose={() => setIsReceiptOpen(false)} 
      />
    </div>
  );
}
export default POS;
