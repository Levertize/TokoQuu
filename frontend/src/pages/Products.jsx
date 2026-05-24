import React, { useState, useMemo } from 'react';
import { IconSearch, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useProductStore } from '../stores/useProductStore';
import { useToastStore } from '../stores/useToastStore';
import { Modal } from '../components/ui/Modal';
import { ProductForm } from '../components/ui/ProductForm';
import { formatCurrency } from '../utils/formatCurrency';
import { Select } from '../components/ui/Select';

const CATEGORY_OPTIONS = [
  { value: 'Semua', label: 'Semua Kategori' },
  { value: 'Minuman', label: 'Minuman' },
  { value: 'Makanan', label: 'Makanan' },
  { value: 'Snack', label: 'Snack' },
  { value: 'Kebutuhan Rumah', label: 'Kebutuhan Rumah' },
];

/**
 * Products management page component. Displays products in a table and handles CRUD modals.
 * @returns {React.ReactElement}
 */
export function Products() {
  const products = useProductStore((state) => state.products);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQ = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Semua' || p.category === category;
      return matchQ && matchCat;
    });
  }, [products, search, category]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}" secara permanen?`)) {
      const res = await deleteProduct(id);
      if (res.success) {
        showToast(`Produk "${name}" berhasil dihapus!`, 'success');
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filters Row */}
      <div className="flex justify-between items-center shrink-0 flex-wrap gap-3">
        <div className="flex gap-2.5 items-center">
          <div className="relative w-[260px]">
            <IconSearch size={16} className="absolute left-3.5 top-1/2 translate-y-[-50%] text-text-muted" />
            <input
              className="w-full border border-border rounded h-11 pl-10 pr-3.5 text-sm bg-surface text-text outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(217,119,6,0.1)] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk..."
            />
          </div>
          
          {/* Custom Dropdown select */}
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            className="w-[170px]"
          />
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-primary to-primary-hover text-white rounded px-5 h-11 text-sm font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(217,119,6,0.15)] hover:shadow-[0_6px_16px_rgba(217,119,6,0.25)] hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0 transition-all"
        >
          <IconPlus size={16} /> Tambah Produk Baru
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-card">
        <table className="tbl">
          <thead>
            <tr>
              <th className="text-center w-16">Emoji</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga Beli</th>
              <th>Harga Jual</th>
              <th>Margin Untung</th>
              <th>Stok</th>
              <th>Status Stok</th>
              <th className="w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              let stockClass = 'g';
              let statusText = 'Normal';
              if (p.stock <= 0) {
                stockClass = 'r';
                statusText = 'Habis';
              } else if (p.stock <= p.min_stock) {
                stockClass = 'a';
                statusText = 'Rendah';
              }

              const marginPct = p.sell_price > 0 
                ? Math.round(((p.sell_price - p.buy_price) / p.sell_price) * 100) + '%'
                : '0%';

              return (
                <tr key={p.id}>
                  <td className="text-2xl text-center">{p.emoji || '📦'}</td>
                  <td><b>{p.name}</b></td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.buy_price)}</td>
                  <td>{formatCurrency(p.sell_price)}</td>
                  <td className="text-teal-mid font-bold">{marginPct}</td>
                  <td className="font-bold">{p.stock}</td>
                  <td><span className={`pill ${stockClass}`}>{statusText}</span></td>
                  <td className="text-center flex justify-center gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      className="w-8 h-8 rounded hover:bg-bg flex items-center justify-center text-text-secondary hover:text-text active:scale-90 transition-all"
                      title="Edit"
                    >
                      <IconEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id, p.name)}
                      className="w-8 h-8 rounded hover:bg-bg flex items-center justify-center text-coral-mid hover:text-red-600 active:scale-90 transition-all"
                      title="Hapus"
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal wrapper */}
      <Modal 
        isOpen={isModalOpen} 
        title={editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'} 
        onClose={() => setIsModalOpen(false)}
      >
        <ProductForm 
          product={editingProduct} 
          onSave={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
export default Products;
