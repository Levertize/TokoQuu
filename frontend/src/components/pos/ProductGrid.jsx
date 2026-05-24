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
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Nama (A-Z)' },
    { value: 'name-desc', label: 'Nama (Z-A)' },
    { value: 'price-desc', label: 'Harga Termahal' },
    { value: 'price-asc', label: 'Harga Termurah' },
    { value: 'stock-desc', label: 'Stok Terbanyak' },
    { value: 'stock-asc', label: 'Stok Tersedikit' }
  ];

  // Filter products based on search query and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQ = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Semua' || p.category === category;
      return matchQ && matchCat;
    });
  }, [products, search, category]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'price-desc') {
        return b.sell_price - a.sell_price;
      } else if (sortBy === 'price-asc') {
        return a.sell_price - b.sell_price;
      } else if (sortBy === 'stock-desc') {
        return b.stock - a.stock;
      } else if (sortBy === 'stock-asc') {
        return a.stock - b.stock;
      }
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortBy]);

  // Pagination
  const itemsPerPage = 12;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

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
      <div className="flex gap-2.5 mb-6 items-center shrink-0 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 translate-y-[-50%] text-text-muted" />
          <input
            className="w-full border border-border rounded h-11 pl-10 pr-3.5 text-sm bg-surface text-text outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(217,119,6,0.1)] transition-all"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama produk atau scan barcode..."
          />
        </div>
        
        {/* Custom Styled Dropdown Kategori */}
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={handleCategoryChange}
          className="w-[150px] shrink-0"
        />

        {/* Custom Styled Dropdown Sortir */}
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={handleSortChange}
          className="w-[150px] shrink-0"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto pb-5 flex-1 content-start">
        {paginatedProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary font-semibold">
            Tidak ada produk ditemukan
          </div>
        ) : (
          paginatedProducts.map((p, index) => {
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
          })
        )}
      </div>

      {/* Pagination Footer */}
      {sortedProducts.length > 0 && (
        <div className="flex justify-between items-center py-3 border-t border-border bg-surface px-4 mt-auto text-xs shrink-0 rounded-b-lg">
          <span className="text-text-secondary font-semibold">
            Menampilkan {Math.min(sortedProducts.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(sortedProducts.length, currentPage * itemsPerPage)} dari {sortedProducts.length} produk
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-text-secondary disabled:cursor-not-allowed font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              Sebelumnya
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded border font-bold text-xs flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-[0_2px_6px_rgba(217,119,6,0.2)]'
                      : 'border-border text-text-secondary hover:bg-bg hover:text-text'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-text-secondary disabled:cursor-not-allowed font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductGrid;
