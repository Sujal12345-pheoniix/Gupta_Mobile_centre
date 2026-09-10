'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { CustomerRecord } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function CustomersPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [form, setForm] = useState<Omit<CustomerRecord, 'id' | 'totalPurchases' | 'outstandingBalance' | 'lastVisit'>>({ name: '', phone: '', email: '', address: '' });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const openAdd = () => { setEditId(null); setForm({ name: '', phone: '', email: '', address: '' }); setShowModal(true); };
  const openEdit = (c: CustomerRecord) => {
    setEditId(c.id);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return alert('Name and phone required');
    if (editId) {
      updateCustomer(editId, form);
    } else {
      addCustomer(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this customer?')) {
      deleteCustomer(id);
    }
  };

  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0);

  return (
    <div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Revenue from Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(customers.reduce((s, c) => s + c.totalPurchases, 0))}</p>
        </div>
        <div className={`rounded-xl border p-5 ${totalOutstanding > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className={`text-2xl font-bold mt-1 ${totalOutstanding > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{formatINR(totalOutstanding)}</p>
          <p className="text-xs text-gray-400 mt-1">Across {customers.filter(c => c.outstandingBalance > 0).length} customers</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex gap-3">
          <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          {isManager && <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Customer</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition cursor-pointer" onClick={() => setSelectedCustomer(c)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.phone}</div>
                </div>
              </div>
              {c.outstandingBalance > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">Balance due</span>
              )}
            </div>
            {c.email && <div className="text-xs text-gray-500 mb-1">✉️ {c.email}</div>}
            {c.address && <div className="text-xs text-gray-500 mb-3">📍 {c.address}</div>}
            <div className="flex justify-between text-sm border-t pt-3">
              <div>
                <div className="text-xs text-gray-400">Total Purchases</div>
                <div className="font-semibold text-gray-900">{formatINR(c.totalPurchases)}</div>
              </div>
              {c.outstandingBalance > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-400">Outstanding</div>
                  <div className="font-semibold text-orange-600">{formatINR(c.outstandingBalance)}</div>
                </div>
              )}
              <div className="text-right">
                <div className="text-xs text-gray-400">Last Visit</div>
                <div className="text-xs text-gray-600">{c.lastVisit}</div>
              </div>
            </div>
            {isManager && (
              <div className="mt-3 flex gap-2">
                <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="flex-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 border border-blue-200 transition font-medium">Edit Details</button>
                {isAdmin && <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} className="flex-1 text-xs text-red-600 hover:bg-red-50 rounded-lg py-1.5 border border-red-200 transition font-medium">Delete</button>}
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No customers found.</div>}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedCustomer.name}</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedCustomer.phone}</span></div>
              {selectedCustomer.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selectedCustomer.email}</span></div>}
              {selectedCustomer.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedCustomer.address}</span></div>}
              <hr />
              <div className="flex justify-between font-semibold"><span>Total Purchases</span><span className="text-green-700">{formatINR(selectedCustomer.totalPurchases)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Outstanding Balance</span><span className={selectedCustomer.outstandingBalance > 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>{selectedCustomer.outstandingBalance > 0 ? formatINR(selectedCustomer.outstandingBalance) : 'Nil'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last Visit</span><span>{selectedCustomer.lastVisit}</span></div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {[['Name *', 'name'], ['Phone *', 'phone'], ['Email', 'email'], ['Address', 'address']].map(([label, field]) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={(form as Record<string,string>)[field] || ''}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editId ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

