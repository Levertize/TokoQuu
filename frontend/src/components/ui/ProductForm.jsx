import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../stores/useProductStore';
import { useToastStore } from '../../stores/useToastStore';
import { Select } from './Select';

const CATEGORIES = ['Minuman', 'Makanan', 'Snack', 'Kebutuhan Rumah'];

/**
 * ProductForm form fields handler for adding or editing products.
 * @param {Object} props
 * @param {Object} props.product active editing product (null for new product)
 * @param {Function} props.onSave Callback when saved
 * @param {Function} props.onCancel Callback when cancelled
 * @returns {React.ReactElement}
 */
export function ProductForm({ product, onSave, onCancel }) {
  const { addProduct, updateProduct } = useProductStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Minuman');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('10');

  // Fill form if editing
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setBuyPrice(product.buy_price.toString());
      setSellPrice(product.sell_price.toString());
      setEmoji(product.emoji || '📦');
      setStock(product.stock.toString());
      setMinStock(product.min_stock.toString());
    }
  }, [product]);

  // Calculate dynamic margin
  const marginPct = (() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    if (sell <= 0) return '0%';
    return Math.round(((sell - buy) / sell) * 100) + '%';
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama produk tidak boleh kosong!', 'error');
      return;
    }
    const buy = parseInt(buyPrice) || 0;
    const sell = parseInt(sellPrice) || 0;
    if (sell <= buy) {
      showToast('Harga jual harus lebih besar dari harga beli!', 'warning');
    }

    const payload = {
      name: name.trim(),
      category,
      buy_price: buy,
      sell_price: sell,
      emoji: emoji.trim() || '📦',
      stock: parseInt(stock) || 0,
      min_stock: parseInt(minStock) || 10
    };

    let res;
    if (product) {
      res = await updateProduct(product.id, payload);
      if (res.success) showToast('Produk berhasil diperbarui!', 'success');
    } else {
      res = await addProduct(payload);
      if (res.success) showToast('Produk baru ditambahkan!', 'success');
    }

    if (res.success) {
      onSave();
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-text">
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Nama Produk</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="cth: Kopi Susu" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Kategori</label>
          <Select
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
            buttonClassName="h-[38px] py-2 px-3 text-sm font-semibold rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Harga Beli (Rp)</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="cth: 3000" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Harga Jual (Rp)</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="cth: 5000" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Margin Keuntungan</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-bg text-teal-mid outline-none font-bold select-none cursor-default" type="text" value={marginPct} readOnly />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Emoji Representasi</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="text" value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="cth: ☕" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Stok Saat Ini</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="cth: 50" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-secondary">Minimum Stok (Alert)</label>
          <input className="border border-border rounded py-2 px-3 text-sm bg-surface text-text outline-none focus:border-primary" type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="cth: 10" required />
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-border">
        <button type="button" className="btn-secondary h-10 px-5 rounded border border-border bg-surface text-text-secondary hover:text-text hover:bg-bg text-xs font-bold active:scale-[0.98] transition-all" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn-primary h-10 px-5 rounded text-white bg-gradient-to-r from-primary to-primary-hover text-xs font-bold shadow-[0_3px_10px_rgba(217,119,6,0.1)] hover:shadow-[0_5px_15px_rgba(217,119,6,0.2)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.98] transition-all">Simpan Produk</button>
      </div>
    </form>
  );
}
export default ProductForm;
