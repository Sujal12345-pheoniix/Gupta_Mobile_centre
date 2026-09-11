'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { StockMovementItem } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const typeColor: Record<string, string> = {
  SALE: 'bg-red-50 text-red-700',
  PURCHASE_RECEIPT: 'bg-green-50 text-green-700',
  CUSTOMER_RETURN: 'bg-blue-50 text-blue-700',
  ADJUSTMENT: 'bg-yellow-50 text-yellow-700',
  DAMAGE: 'bg-gray-100 text-gray-600',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const { products, stockMovements: movements, adjustStock } = useStore();
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjForm, setAdjForm] = useState({ sku: '', productName: '', quantity: 0, type: 'ADJUSTMENT' as StockMovementItem['type'], reason: '' });

  const lowStock = products.filter(p => p.stock <= p.minStock && p.status === 'ACTIVE');
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);

  const handleAdjSubmit = async () => {
    if (!adjForm.sku || adjForm.quantity === 0) return alert('Fill all fields');
    const success = await adjustStock(adjForm.sku, adjForm.quantity, adjForm.type, adjForm.reason, user?.name || 'Admin');
    if (!success) return alert('Insufficient stock or product not found');
    setShowAdjModal(false);
    setAdjForm({ sku: '', productName: '', quantity: 0, type: 'ADJUSTMENT', reason: '' });
  };

  return (
    <div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalValue)}</p>
          <p className="text-xs text-gray-400 mt-1">At purchase price</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total SKUs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.filter(p => p.status === 'ACTIVE').length}</p>
          <p className="text-xs text-gray-400 mt-1">Active products</p>
        </div>
        <div className={`rounded-xl border p-5 ${lowStock.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className={`text-2xl font-bold mt-1 ${lowStock.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStock.length}</p>
          <p className="text-xs text-gray-400 mt-1">Below reorder level</p>
        </div>
      </div>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Low Stock Alert ({lowStock.length} items)</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="bg-white border border-red-200 text-red-700 text-xs px-3 py-1 rounded-full">
                {p.name} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('stock')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'stock' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Stock Levels</button>
          <button onClick={() => setTab('movements')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'movements' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Movement History</button>
        </div>
        {isManager && (
          <button onClick={() => setShowAdjModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + New Adjustment
          </button>
        )}
      </div>

      {tab === 'stock' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Current Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Min Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock Value</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.filter(p => p.status === 'ACTIVE').map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition ${p.stock <= p.minStock ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.category}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : p.stock <= p.minStock * 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.minStock}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(p.stock * p.purchasePrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{p.trackingMode}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'movements' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{m.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{m.productName}</div>
                      <div className="text-xs text-gray-400 font-mono">{m.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[m.type] || 'bg-gray-100 text-gray-600'}`}>{m.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      <span className={m.quantity > 0 ? 'text-green-600' : 'text-red-600'}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{m.reason || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{m.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdjModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stock Adjustment</h2>
              <button onClick={() => setShowAdjModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Product SKU *</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={adjForm.sku}
                  onChange={e => { const p = products.find(x => x.sku === e.target.value); setAdjForm(f => ({ ...f, sku: e.target.value, productName: p?.name || '' })); }}>
                  <option value="">Select product...</option>
                  {products.filter(p => p.status === 'ACTIVE').map(p => <option key={p.id} value={p.sku}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type *</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={adjForm.type}
                  onChange={e => setAdjForm(f => ({ ...f, type: e.target.value as StockMovementItem['type'] }))}>
                  {isManager && <option value="ADJUSTMENT">Adjustment (correction)</option>}
                  {isManager && <option value="PURCHASE_RECEIPT">Purchase Receipt</option>}
                  {isManager && <option value="DAMAGE">Damage / Loss</option>}
                  <option value="SALE">Sale Reduction</option>
                  <option value="CUSTOMER_RETURN">Customer Return</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Quantity *</label>
                <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" value={adjForm.quantity}
                  onChange={e => setAdjForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Reason / Reference</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. PO #PO-904 received" value={adjForm.reason}
                  onChange={e => setAdjForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowAdjModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleAdjSubmit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Save Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

