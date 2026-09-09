'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { initialPurchases, initialSuppliers, PurchaseRecord, SupplierRecord } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const statusColor: Record<string, string> = {
  RECEIVED: 'bg-green-50 text-green-700',
  ORDERED: 'bg-blue-50 text-blue-700',
  DRAFT: 'bg-gray-100 text-gray-600',
};

export default function PurchasesPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(initialPurchases);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(initialSuppliers);
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [poForm, setPoForm] = useState({ supplierName: '', itemsCount: 1, total: 0, paid: 0 });
  const [supForm, setSupForm] = useState({ name: '', phone: '', gstin: '', city: '', payable: 0 });

  const totalPending = purchases.reduce((sum, p) => sum + p.due, 0);
  const totalReceived = purchases.filter(p => p.status === 'RECEIVED').length;

  const handleCreatePO = () => {
    if (!poForm.supplierName || poForm.total <= 0) return alert('Fill all required fields');
    const newPO: PurchaseRecord = {
      id: `po-${Date.now()}`, poNumber: `PO-${904 + purchases.length}`,
      supplierName: poForm.supplierName, date: new Date().toISOString().split('T')[0],
      total: poForm.total, paid: poForm.paid, due: poForm.total - poForm.paid,
      status: 'ORDERED', itemsCount: poForm.itemsCount,
    };
    setPurchases(prev => [newPO, ...prev]);
    setShowPOModal(false);
    setPoForm({ supplierName: '', itemsCount: 1, total: 0, paid: 0 });
  };

  const handleAddSupplier = () => {
    if (!supForm.name || !supForm.phone) return alert('Name and phone required');
    setSuppliers(prev => [...prev, { ...supForm, id: `sup-${Date.now()}` }]);
    setShowSupplierModal(false);
    setSupForm({ name: '', phone: '', gstin: '', city: '', payable: 0 });
  };

  const markReceived = (id: string) =>
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'RECEIVED' } : p));

  return (
    <div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{purchases.length}</p>
          <p className="text-xs text-gray-400 mt-1">{totalReceived} received</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Purchased</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(purchases.reduce((s, p) => s + p.total, 0))}</p>
        </div>
        <div className={`rounded-xl border p-5 ${totalPending > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
          <p className="text-sm text-gray-500">Payable to Suppliers</p>
          <p className={`text-2xl font-bold mt-1 ${totalPending > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{formatINR(totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">Outstanding balance</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('orders')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Purchase Orders</button>
          <button onClick={() => setTab('suppliers')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'suppliers' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Suppliers</button>
        </div>
        {isManager && (
          <div className="flex gap-2">
            {tab === 'orders' && <button onClick={() => setShowPOModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New PO</button>}
            {tab === 'suppliers' && <button onClick={() => setShowSupplierModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Supplier</button>}
          </div>
        )}
      </div>

      {tab === 'orders' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">PO Number</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Due</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  {isManager && <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{p.poNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.supplierName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.date}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{p.itemsCount}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(p.total)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatINR(p.paid)}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-medium">{p.due > 0 ? formatINR(p.due) : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                    </td>
                    {isManager && (
                      <td className="px-4 py-3 text-center">
                        {p.status === 'ORDERED' && (
                          <button onClick={() => markReceived(p.id)} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition">Mark Received</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">GSTIN</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.gstin}</td>
                    <td className="px-4 py-3 text-gray-600">{s.city}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={s.payable > 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>{s.payable > 0 ? formatINR(s.payable) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPOModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Purchase Order</h2>
              <button onClick={() => setShowPOModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Supplier *</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={poForm.supplierName} onChange={e => setPoForm(f => ({ ...f, supplierName: e.target.value }))}>
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Number of Items</label>
                <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" value={poForm.itemsCount} onChange={e => setPoForm(f => ({ ...f, itemsCount: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Total Amount (₹) *</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={poForm.total} onChange={e => setPoForm(f => ({ ...f, total: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount Paid (₹)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={poForm.paid} onChange={e => setPoForm(f => ({ ...f, paid: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowPOModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleCreatePO} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Create PO</button>
            </div>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Supplier</h2>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {[['Name *', 'name', 'text'], ['Phone *', 'phone', 'tel'], ['GSTIN', 'gstin', 'text'], ['City', 'city', 'text']].map(([label, field, type]) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                  <input type={type} className="w-full border rounded-lg px-3 py-2 text-sm" value={(supForm as Record<string,string|number>)[field] as string}
                    onChange={e => setSupForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleAddSupplier} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Add Supplier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

