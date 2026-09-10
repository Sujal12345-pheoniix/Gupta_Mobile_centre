'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/api';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function AdminDashboard({ user }: { user: AuthUser | null }) {
  const { products, sales, employees, repairs } = useStore();

  // Metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + s.itemsCount, 0);

  // Inventory value & low stock
  const activeProducts = products.filter(p => p.status === 'ACTIVE');
  const inventoryValue = activeProducts.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
  const lowStockItems = activeProducts.filter(p => p.stock <= p.minStock);

  // Payroll calculations
  const totalStaffPayroll = employees.filter(e => e.status === 'ACTIVE').reduce((sum, e) => {
    const commission = (e.commissionRate / 100) * e.totalSalesMonth;
    return sum + e.baseSalary + commission;
  }, 0);
  const presentStaff = employees.filter(e => e.todayAttendance === 'PRESENT').length;

  // Active repairs
  const pendingRepairs = repairs.filter(r => r.status !== 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-purple-400/20">
            👑 Store Owner & Administrator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name || 'Sujal Kumar'}</h1>
          <p className="text-purple-200 text-sm mt-1">Gupta Mobile Centre · Head Office, Gurgaon · Complete Business Overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/products" className="px-4 py-2 bg-white text-purple-900 rounded-xl text-sm font-semibold hover:bg-purple-50 transition shadow">
            + Add Product
          </Link>
          <Link href="/dashboard/sales" className="px-4 py-2 bg-purple-500/40 text-white border border-purple-300/30 rounded-xl text-sm font-semibold hover:bg-purple-500/60 transition">
            🛒 Open POS
          </Link>
        </div>
      </div>

      {/* Top 4 Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</span>
            <span className="p-2 rounded-lg bg-green-50 text-green-700 text-lg">💰</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{formatINR(totalRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">{sales.length} completed transactions</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Asset Value</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700 text-lg">📦</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{formatINR(inventoryValue)}</div>
          <div className="text-xs text-gray-500 mt-1">{activeProducts.length} active catalog SKUs</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff & Payroll</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-700 text-lg">👥</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{formatINR(totalStaffPayroll)}</div>
          <div className="text-xs text-green-600 mt-1 font-medium">{presentStaff}/{employees.length} employees on duty today</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Repairs</span>
            <span className="p-2 rounded-lg bg-orange-50 text-orange-700 text-lg">🔧</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-2">{pendingRepairs} Devices</div>
          <div className="text-xs text-gray-500 mt-1">In diagnostics / service center</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Owner Control Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/sales" className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 transition shadow-sm text-center">
            <div className="text-2xl mb-1">🛒</div>
            <div className="font-semibold text-sm">POS Terminal</div>
            <div className="text-xs text-green-100">Sell phones & accessories</div>
          </Link>
          <Link href="/dashboard/products" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 transition shadow-sm text-center">
            <div className="text-2xl mb-1">📦</div>
            <div className="font-semibold text-sm">Manage Products</div>
            <div className="text-xs text-blue-100">Stock, cost & selling price</div>
          </Link>
          <Link href="/dashboard/employees" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 transition shadow-sm text-center">
            <div className="text-2xl mb-1">👤</div>
            <div className="font-semibold text-sm">Payroll & Attendance</div>
            <div className="text-xs text-purple-100">Salaries & staff commissions</div>
          </Link>
          <Link href="/dashboard/reports" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl p-4 transition shadow-sm text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="font-semibold text-sm">P&L Reports</div>
            <div className="text-xs text-amber-100">Profit, margin & taxes</div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Sales & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Store Sales */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Customer Sales</h2>
              <p className="text-xs text-gray-500">Real-time point of sale transactions</p>
            </div>
            <Link href="/dashboard/sales" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All POS →
            </Link>
          </div>
          {sales.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No sales recorded yet. Click POS to make your first sale!
            </div>
          ) : (
            <div className="divide-y">
              {sales.slice(0, 5).map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{s.customerName}</div>
                    <div className="text-xs text-gray-500">{s.invoiceNumber} · {s.date} · By {s.staffName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">{formatINR(s.total)}</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-700">
                      {s.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>⚠️ Low Stock & Reorder Alerts</span>
                {lowStockItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {lowStockItems.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">Products near or below safety threshold</p>
            </div>
            <Link href="/dashboard/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage Inventory →
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-green-600 text-sm">
              ✓ All products have healthy stock levels!
            </div>
          ) : (
            <div className="divide-y">
              {lowStockItems.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.brand} · SKU: {p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{p.stock} units left</div>
                    <div className="text-xs text-gray-400">Min safety: {p.minStock}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
