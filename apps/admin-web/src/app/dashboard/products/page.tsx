'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { ProductItem } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const CATEGORIES = ['All', 'Smartphones', 'Chargers', 'Screen Guards', 'Accessories', 'Spare Parts', 'Cables'];
const BRANDS = ['All', 'Apple', 'Samsung', 'OnePlus', 'Boat', 'Generic'];

const emptyProduct: Omit<ProductItem, 'id'> = {
  name: '', category: 'Smartphones', brand: 'Apple', sku: '', barcode: '',
  purchasePrice: 0, sellingPrice: 0, mrp: 0, stock: 0, minStock: 5,
  taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const { products, addProduct, updateProduct, deleteProduct, archiveProduct } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ProductItem, 'id'>>(emptyProduct);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchBrand = brandFilter === 'All' || p.brand === brandFilter;
    return matchSearch && matchCat && matchBrand;
  });

  const openAdd = () => { setEditId(null); setForm(emptyProduct); setShowModal(true); };
  const openEdit = (p: ProductItem) => { const { id, ...rest } = p; setEditId(id); setForm(rest); setShowModal(true); };
  const handleSave = () => {
    if (!form.name || !form.sku) return alert('Name and SKU are required');
    if (editId) {
      updateProduct(editId, form);
    } else {
      addProduct(form);
    }
    setShowModal(false);
  };
  const handleArchive = (id: string) => archiveProduct(id);
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const profit = (p: ProductItem) => p.sellingPrice - p.purchasePrice;
  const margin = (p: ProductItem) => p.purchasePrice > 0 ? ((profit(p) / p.purchasePrice) * 100).toFixed(1) : '0';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.filter(p => p.status === 'ACTIVE').length} active · {products.filter(p => p.stock <= p.minStock).length} low stock</p>
        </div>
        {isManager && (
          <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Add Product
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl border p-4 mb-4 flex flex-wrap gap-3">
        <input className="flex-1 min-w-[180px] px-3 py-2 border rounded-lg text-sm" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="px-3 py-2 border rounded-lg text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="px-3 py-2 border rounded-lg text-sm" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          {BRANDS.map(b => <option key={b}>{b}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} results</span>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Selling</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Margin</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                {isManager && <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-[220px] truncate" title={p.name}>{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category} · {p.brand}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatINR(p.purchasePrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatINR(p.sellingPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-600 font-medium">{margin(p)}%</span>
                    <div className="text-xs text-gray-400">{formatINR(profit(p))}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : p.stock <= p.minStock * 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock <= p.minStock && '⚠️ '}{p.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition">Edit</button>
                        {isAdmin && <button onClick={() => handleArchive(p.id)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition">{p.status === 'ACTIVE' ? 'Archive' : 'Restore'}</button>}
                        {isAdmin && <button onClick={() => handleDelete(p.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition">Delete</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No products found.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Product Name *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">SKU *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Barcode</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Brand</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
                  {BRANDS.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Purchase Price (₹)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Selling Price (₹)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">MRP (₹)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tax Rate (%)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Opening Stock</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Min. Stock (Reorder Level)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tracking Mode</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.trackingMode} onChange={e => setForm(f => ({ ...f, trackingMode: e.target.value as ProductItem['trackingMode'] }))}>
                  <option value="NONE">None (count-based)</option>
                  <option value="SERIAL">Serial Number</option>
                  <option value="BATCH">Batch</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editId ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

