import React, { useState, useMemo, useEffect } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useProductStore } from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import { useToastStore } from '../../stores/useToastStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Select } from '../ui/Select';

const CATEGORY_OPTIONS = [
  { value: 'Semua', label: 'Semua Kategori' },
  { value: 'Minuman', label: 'Minuman' },
  { value: 'Makanan', label: 'Makanan' },
  { value: 'Snack', label: 'Snack' },
  { value: 'Kebutuhan Rumah', label: 'Kebutuhan Rumah' },
];

/**
 * ProductGrid component for POS page. Handles search and category filters with a premium custom styled select.
 * @returns {React.ReactElement}
 */
export function ProductGrid() {
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const addToCart = useCartStore((state) => state.addToCart);
  const { showToast } = useToastStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  // Filter products based on search query and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQ = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Semua' || p.category === category;
      return matchQ && matchCat;
    });
  }, [products, search, category]);

  /**
   * Safe cart insertion with toast notifications.
   * @param {Object} prod 
   */
  const handleAdd = (prod) => {
    const res = addToCart(prod);
    if (res && res.message) {
      showToast(res.message, res.type);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Search & Category Filter Row */}
      <div className="flex gap-2.5 mb-6 items-center shrink-0">
        <div className="relative flex-1">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 translate-y-[-50%] text-text-muted" />
          <input
            className="w-full border border-border rounded h-11 pl-10 pr-3.5 text-sm bg-surface text-text outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(217,119,6,0.1)] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk atau scan barcode..."
          />
        </div>
        
        {/* Custom Styled Dropdown */}
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          className="w-[170px]"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto pb-5 flex-1 content-start">
        {filteredProducts.map((p, index) => {
          const isOutOfStock = p.stock <= 0;
          let pillColor = 'g';
          if (isOutOfStock) pillColor = 'r';
          else if (p.stock <= p.min_stock) pillColor = 'a';

          return (
            <div
              key={p.id}
              onClick={() => !isOutOfStock && handleAdd(p)}
              style={{ animationDelay: `${Math.min(index * 40, 360)}ms` }}
              className={`bg-surface border border-border rounded-lg p-3.5 flex flex-col relative overflow-hidden transition-all duration-300 animate-fade-in-up ${
                isOutOfStock
                  ? 'opacity-50 cursor-not-allowed select-none'
                  : 'cursor-pointer hover:border-primary hover:translate-y-[-4px] hover:scale-[1.02] shadow-card hover:shadow-hover'
              }`}
            >
              {isOutOfStock && (
                <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <span className="bg-coral-mid/95 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded uppercase tracking-wider shadow-[0_2px_8px_rgba(244,63,94,0.3)] animate-pulse">Habis</span>
                </div>
              )}
              <div className="w-11 h-11 rounded bg-bg flex items-center justify-center text-2xl mb-2.5">{p.emoji}</div>
              <div className="text-[13.5px] font-bold text-text mb-1 truncate" title={p.name}>{p.name}</div>
              <div className="text-[12.5px] text-primary font-bold mb-3">{formatCurrency(p.sell_price)}</div>
              <div className="mt-auto">
                <span className={`pill ${pillColor}`}>Stok: {p.stock}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ProductGrid;
