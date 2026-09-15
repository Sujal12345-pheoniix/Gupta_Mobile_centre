'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/api';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function AdminDashboard({ user }: { user: AuthUser | null }) {
  const { products, sales, employees, repairs, purchases, stockMovements, isDbConnected, refreshFromDb } = useStore();

  // Auto-refresh every 30 seconds to reflect real changes made by any user/device
  const refreshRef = useRef(refreshFromDb);
  refreshRef.current = refreshFromDb;
  useEffect(() => {
    const interval = setInterval(() => refreshRef.current(), 30000);
    return () => clearInterval(interval);
  }, []);

  // === LIVE COMPUTED METRICS — derived entirely from reactive store state ===

  const activeProducts = products.filter(p => p.status === 'ACTIVE');
  const completedSales = sales.filter(s => s.status === 'COMPLETED' || s.status === 'PAID');

  // 1. Sales Financials & COGS
  const salesRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
  const totalDiscount = completedSales.reduce((sum, s) => sum + (s.discount || 0), 0);
  const avgOrderValue = completedSales.length > 0 ? salesRevenue / completedSales.length : 0;

  const salesCOGS = completedSales.reduce((sum, s) => {
    if (s.cogs && s.cogs > 0) return sum + s.cogs;
    if (s.items && s.items.length > 0) {
      return sum + s.items.reduce((iSum, i) => iSum + i.qty * (i.unitCost || 0), 0);
    }
    return sum + Math.round(s.total * 0.78);
  }, 0);

  // 2. Repair Financials & Spare Parts Cost
  const completedRepairs = repairs.filter(r => r.status === 'READY' || r.status === 'DELIVERED');
  const repairRevenue = completedRepairs.reduce((sum, r) => sum + r.estimatedCost, 0);
  const repairPartsCost = completedRepairs.reduce((sum, r) => {
    if (!r.partsUsed || r.partsUsed.trim() === '') return sum + Math.round(r.estimatedCost * 0.25);
    const matched = products.find(p => r.partsUsed?.toLowerCase().includes(p.name.toLowerCase()));
    return sum + (matched ? matched.purchasePrice : Math.round(r.estimatedCost * 0.35));
  }, 0);
  const techCommissions = completedRepairs.reduce((sum, r) => sum + Math.round(r.estimatedCost * 0.05), 0);

  // 3. Combined Store Revenue & True Gross Profit
  // Gross Profit = Total Revenue (Sales + Repairs) - Cost of Goods Sold (COGS + Parts)
  const totalRevenue = salesRevenue + repairRevenue;
  const totalCOGS = salesCOGS + repairPartsCost;
  const grossProfit = totalRevenue - totalCOGS;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // 4. Inventory Value & Safety Thresholds
  const inventoryValue = activeProducts.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
  const inventorySRP = activeProducts.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);
  const potentialProfit = inventorySRP - inventoryValue;
  const lowStockItems = activeProducts.filter(p => p.stock <= p.minStock);
  const outOfStockItems = activeProducts.filter(p => p.stock === 0);

  // 5. Staff & Payroll
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
  const totalStaffSalesCommission = activeEmployees.reduce((sum, e) => sum + (e.commissionRate / 100) * e.totalSalesMonth, 0);
  const totalStaffPayroll = activeEmployees.reduce((sum, e) => sum + e.baseSalary + (e.commissionRate / 100) * e.totalSalesMonth, 0);
  const presentStaff = activeEmployees.filter(e => e.todayAttendance === 'PRESENT').length;

  // 6. Net Operating Profit
  const netProfit = grossProfit - (totalStaffPayroll + techCommissions);
  const netMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Active repairs
  const pendingRepairs = repairs.filter(r => r.status !== 'DELIVERED').length;
  const readyRepairs = repairs.filter(r => r.status === 'READY').length;

  // Today's activity
  const todaySales = completedSales.slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl p-5 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/10">
            Administrator — Full Access
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name || 'Admin'}</h1>
          <p className="text-blue-200 text-sm mt-0.5">Gupta Mobile Centre · Head Office, Gurgaon</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isDbConnected ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-green-400' : 'bg-amber-400'}`} />
            {isDbConnected ? 'Live' : 'Offline'}
          </div>
          <Link href="/dashboard/sales" className="px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow">
            Open POS
          </Link>
          <Link href="/dashboard/repairs" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition shadow">
            Repairs
          </Link>
          <Link href="/dashboard/products" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/20 transition">
            Add Product
          </Link>
        </div>
      </div>

      {/* Financial Accounting Info Bar */}
      <div className="bg-white rounded-xl border p-3.5 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div>
          <strong className="text-gray-900">Gross Profit Calculation:</strong> Combined Revenue ({formatINR(totalRevenue)} = Sales {formatINR(salesRevenue)} + Repairs {formatINR(repairRevenue)}) − COGS ({formatINR(totalCOGS)} = Product Cost {formatINR(salesCOGS)} + Parts {formatINR(repairPartsCost)}) = <span className="font-bold text-green-700">{formatINR(grossProfit)} ({grossMarginPct}%)</span>.
        </div>
        <div className="text-[11px] text-gray-500">
          Net Profit after Staff & Tech Payroll: <span className="font-bold text-emerald-700">{formatINR(netProfit)} ({netMarginPct}%)</span>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Sales: {formatINR(salesRevenue)} · Repairs: {formatINR(repairRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">True Gross Profit</p>
          <p className={`text-2xl font-bold mt-1 ${grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatINR(grossProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">Margin: {grossMarginPct}% · COGS: {formatINR(totalCOGS)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Asset Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(inventoryValue)}</p>
          <p className="text-xs text-gray-400 mt-1">{activeProducts.length} SKUs · Potential profit {formatINR(potentialProfit)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Business Profit</p>
          <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatINR(netProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">After payroll ({formatINR(totalStaffPayroll + techCommissions)})</p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Products', value: activeProducts.length, sub: `${outOfStockItems.length} out of stock`, alert: outOfStockItems.length > 0 },
          { label: 'Low Stock Alerts', value: lowStockItems.length, sub: 'At or below reorder level', alert: lowStockItems.length > 0 },
          { label: 'Active Repairs', value: pendingRepairs, sub: `${readyRepairs} ready for pickup`, alert: readyRepairs > 0 },
          { label: 'Purchase Orders', value: purchases.length, sub: `${purchases.filter(p => p.status === 'ORDERED').length} pending receipt`, alert: false },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-xl p-4 border shadow-sm ${kpi.alert ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.alert ? 'text-red-600' : 'text-gray-900'}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main content: Recent Sales + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Recent Sales</h2>
              <p className="text-xs text-gray-500">Latest POS transactions</p>
            </div>
            <Link href="/dashboard/sales" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          {completedSales.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No sales yet. Open POS to record first sale.</div>
          ) : (
            <div className="divide-y">
              {todaySales.slice(0, 6).map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.customerName}</p>
                    <p className="text-xs text-gray-400">{s.invoiceNumber} · {s.staffName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatINR(s.total)}</p>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{s.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                Low Stock Alerts
                {lowStockItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{lowStockItems.length}</span>
                )}
              </h2>
              <p className="text-xs text-gray-500">Products near or below safety threshold</p>
            </div>
            <Link href="/dashboard/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage</Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-green-600 text-sm font-medium">All products have healthy stock levels</div>
          ) : (
            <div className="divide-y">
              {lowStockItems.slice(0, 6).map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand} · {p.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{p.stock} left</p>
                    <p className="text-xs text-gray-400">Min: {p.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employee Performance */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-3.5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Staff Performance & Payroll</h2>
            <p className="text-xs text-gray-500">Live salary and commission breakdown</p>
          </div>
          <Link href="/dashboard/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage Staff</Link>
        </div>
        {activeEmployees.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No active employees.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Sales This Month</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Commission</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeEmployees.map(emp => {
                  const commission = Math.round((emp.commissionRate / 100) * emp.totalSalesMonth);
                  const netPay = emp.baseSalary + commission;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{emp.role}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.todayAttendance === 'PRESENT' ? 'bg-green-100 text-green-700' : emp.todayAttendance === 'ABSENT' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {emp.todayAttendance || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatINR(emp.totalSalesMonth)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatINR(commission)}</td>
                      <td className="px-5 py-3 text-right font-bold text-blue-700">{formatINR(netPay)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-sm font-bold text-gray-700">Total Monthly Payroll Liability</td>
                  <td className="px-5 py-3 text-right font-black text-gray-900 text-base">{formatINR(totalStaffPayroll)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/sales', label: 'Open POS', sub: 'Record a sale', color: 'bg-green-600 hover:bg-green-700' },
          { href: '/dashboard/products', label: 'Add Product', sub: 'Update catalog', color: 'bg-blue-600 hover:bg-blue-700' },
          { href: '/dashboard/employees', label: 'Staff & Payroll', sub: 'Salaries & attendance', color: 'bg-purple-600 hover:bg-purple-700' },
          { href: '/dashboard/reports', label: 'P&L Reports', sub: 'Profit & margins', color: 'bg-amber-600 hover:bg-amber-700' },
        ].map(a => (
          <Link key={a.href} href={a.href} className={`${a.color} text-white rounded-xl p-4 transition shadow-sm`}>
            <p className="font-bold text-sm">{a.label}</p>
            <p className="text-xs text-white/70 mt-0.5">{a.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
