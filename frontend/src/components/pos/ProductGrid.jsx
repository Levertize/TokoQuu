import React, { useState, useMemo } from 'react';
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
  const addToCart = useCartStore((state) => state.addToCart);
  const { showToast } = useToastStore();

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
        {filteredProducts.map((p) => {
          let pillColor = 'g';
          if (p.stock <= 0) pillColor = 'r';
          else if (p.stock <= p.min_stock) pillColor = 'a';

          return (
            <div
              key={p.id}
              onClick={() => handleAdd(p)}
              className="bg-surface border border-border rounded-lg p-3.5 cursor-pointer flex flex-col hover:border-primary hover:translate-y-[-2px] shadow-card hover:shadow-hover transition-all"
            >
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
