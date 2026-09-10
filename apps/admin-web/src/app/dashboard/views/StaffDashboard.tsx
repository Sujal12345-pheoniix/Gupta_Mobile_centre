'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/api';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function StaffDashboard({ user }: { user: AuthUser | null }) {
  const { products, sales, employees, addCustomer } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustModal, setShowCustModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [custMessage, setCustMessage] = useState('');

  // Find staff record for commission rate
  const staffRecord = employees.find(e =>
    e.name.toLowerCase().includes((user?.name || 'Rohan').toLowerCase())
  ) || { commissionRate: 1.5, totalSalesMonth: 0 };

  // Calculate staff's sales today
  const mySales = sales.filter(s =>
    s.staffName.toLowerCase().includes((user?.name || 'Rohan').toLowerCase())
  );
  const mySalesTotal = mySales.reduce((sum, s) => sum + s.total, 0);
  const myCommissionEarned = (staffRecord.commissionRate / 100) * mySalesTotal;

  // Filter products for fast price and stock lookup
  const searchResults = products.filter(p =>
    p.status === 'ACTIVE' &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) {
      alert('Customer Name and Phone are required!');
      return;
    }
    addCustomer(custForm);
    setCustMessage(`✓ Customer "${custForm.name}" registered successfully!`);
    setCustForm({ name: '', phone: '', email: '', address: '' });
    setTimeout(() => {
      setShowCustModal(false);
      setCustMessage('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header with POS Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-400/20">
            💳 Sales Counter & POS Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hello, {user?.name || 'Rohan Sharma'}</h1>
          <p className="text-emerald-100 text-sm mt-1">Gupta Mobile Centre · Fast Billing & Customer Counter</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustModal(true)}
            className="px-4 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-400/30 rounded-xl text-sm font-semibold transition"
          >
            + Add Customer
          </button>
          <Link
            href="/dashboard/sales"
            className="px-5 py-2.5 bg-white text-emerald-900 rounded-xl text-sm font-bold hover:bg-emerald-50 transition shadow-lg flex items-center gap-2"
          >
            <span>🛒</span> Open POS Checkout
          </Link>
        </div>
      </div>

      {/* Staff Personal Performance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Sales Today</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{formatINR(mySalesTotal)}</div>
          <div className="text-xs text-gray-500 mt-1">{mySales.length} bills completed today</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Commission Today</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-2">+{formatINR(myCommissionEarned)}</div>
          <div className="text-xs text-gray-500 mt-1">{staffRecord.commissionRate}% incentive on sales</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Catalog Items</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{products.filter(p => p.stock > 0).length} In Stock</div>
          <div className="text-xs text-gray-500 mt-1">Ready for checkout</div>
        </div>
      </div>

      {/* Fast Price & Stock Lookup Widget */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>🔍 Instant Price & Stock Lookup</span>
            </h2>
            <p className="text-xs text-gray-500">Quickly verify product price, discount, and available stock for walk-in customers</p>
          </div>
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search phone, charger, tempered glass..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y text-xs text-gray-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4 text-left">Product / Brand</th>
                <th className="py-2.5 px-4 text-left">SKU</th>
                <th className="py-2.5 px-4 text-right">Selling Price</th>
                <th className="py-2.5 px-4 text-right">MRP</th>
                <th className="py-2.5 px-4 text-center">Available Stock</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-800">
              {searchResults.slice(0, 6).map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{prod.name}</div>
                    <div className="text-xs text-gray-400">{prod.brand} · {prod.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{prod.sku}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatINR(prod.sellingPrice)}</td>
                  <td className="py-3 px-4 text-right text-xs text-gray-400 line-through">{formatINR(prod.mrp)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      prod.stock > 5 ? 'bg-green-100 text-green-700' :
                      prod.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href="/dashboard/sales"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Sell in POS
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Recent Sales Invoices */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">My Completed Invoices</h2>
            <p className="text-xs text-gray-500">Invoices billed by you today</p>
          </div>
          <Link href="/dashboard/sales" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Open Full POS →
          </Link>
        </div>
        {mySales.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            You haven't generated any bills yet today. Click "Open POS Checkout" to start selling!
          </div>
        ) : (
          <div className="divide-y">
            {mySales.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{s.customerName}</div>
                  <div className="text-xs text-gray-500">{s.invoiceNumber} · {s.date} · {s.itemsCount} items</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm">{formatINR(s.total)}</div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                    {s.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Customer Modal */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Add Customer</h3>
            <p className="text-xs text-gray-500 mb-4">Register a customer for digital WhatsApp invoicing</p>

            {custMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                {custMessage}
              </div>
            )}

            <form onSubmit={handleQuickAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={custForm.name}
                  onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Mobile Phone (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={custForm.phone}
                  onChange={e => setCustForm({ ...custForm, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={custForm.email}
                  onChange={e => setCustForm({ ...custForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 14, Gurgaon"
                  value={custForm.address}
                  onChange={e => setCustForm({ ...custForm, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
