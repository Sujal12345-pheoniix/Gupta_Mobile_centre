'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { initialSales, initialProducts, initialEmployees, initialPurchases } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ReportsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'staff' | 'profit'>('sales');

  // Sales Analytics
  const totalRevenue = initialSales.reduce((s, x) => s + x.total, 0);
  const totalDiscount = initialSales.reduce((s, x) => s + x.discount, 0);
  const totalTax = initialSales.reduce((s, x) => s + x.tax, 0);
  const avgOrderValue = totalRevenue / initialSales.length;
  const paymentBreakdown = initialSales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  // Staff performance
  const staffSales = initialSales.reduce((acc, s) => {
    acc[s.staffName] = (acc[s.staffName] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  // Profit calc
  const totalPurchaseCost = initialPurchases.reduce((s, p) => s + p.total, 0);
  const grossProfit = totalRevenue - totalPurchaseCost;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Product margins
  const productMargins = initialProducts
    .filter(p => p.status === 'ACTIVE')
    .map(p => ({ name: p.name, margin: p.purchasePrice > 0 ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100) : 0, profit: p.sellingPrice - p.purchasePrice }))
    .sort((a, b) => b.margin - a.margin);

  // Inventory report
  const totalInventoryValue = initialProducts.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const lowStockItems = initialProducts.filter(p => p.stock <= p.minStock && p.status === 'ACTIVE');
  const categoryBreakdown = initialProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { count: 0, value: 0 };
    acc[p.category].count += p.stock;
    acc[p.category].value += p.stock * p.purchasePrice;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const reports = [
    { id: 'sales', label: '💰 Sales Report', access: true },
    { id: 'profit', label: '📈 Profit & Loss', access: isAdmin || isManager },
    { id: 'inventory', label: '📦 Inventory Report', access: true },
    { id: 'staff', label: '👤 Staff Performance', access: isAdmin || isManager },
  ];

  return (
    <div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Business intelligence for Gupta Mobile Centre</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {reports.filter(r => r.access).map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id as typeof activeReport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeReport === r.id ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:border-blue-300'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {activeReport === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatINR(totalRevenue), color: 'text-green-700' },
              { label: 'Avg Order Value', value: formatINR(Math.round(avgOrderValue)), color: 'text-blue-700' },
              { label: 'Total Discount Given', value: formatINR(totalDiscount), color: 'text-orange-600' },
              { label: 'GST Collected', value: formatINR(Math.round(totalTax)), color: 'text-purple-700' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border p-5">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">{method}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(amount / totalRevenue * 100).toFixed(0)}%` }} />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-28 text-right">{formatINR(amount)}</div>
                  <div className="text-xs text-gray-400 w-12">{(amount / totalRevenue * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Recent Transactions</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialSales.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{s.customerName}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(s.total)}</td>
                    <td className="px-4 py-3 text-center"><span className="text-xs bg-gray-100 rounded px-2 py-0.5">{s.paymentMethod}</span></td>
                    <td className="px-4 py-3 text-gray-600">{s.staffName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'profit' && (isAdmin || isManager) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: formatINR(totalRevenue), sub: 'From all sales', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
              { label: 'Total Purchase Cost', value: formatINR(totalPurchaseCost), sub: 'All purchase orders', color: 'bg-red-50 border-red-200', text: 'text-red-600' },
              { label: 'Gross Profit', value: formatINR(grossProfit), sub: `Margin: ${profitMargin}%`, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl border p-5 ${stat.color}`}>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Product Profit Margins (by margin %)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Purchase Price</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Selling Price</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Unit Profit</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {productMargins.map((p, i) => {
                    const prod = initialProducts.find(x => x.name === p.name)!;
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatINR(prod.purchasePrice)}</td>
                        <td className="px-4 py-3 text-right">{formatINR(prod.sellingPrice)}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{formatINR(p.profit)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.margin > 50 ? 'bg-green-100 text-green-700' : p.margin > 20 ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {p.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm text-gray-500">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalInventoryValue)}</p>
              <p className="text-xs text-gray-400 mt-1">At purchase price</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm text-gray-500">Total SKUs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{initialProducts.length}</p>
            </div>
            <div className={`rounded-xl border p-5 ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStockItems.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Stock by Category</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Units in Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(categoryBreakdown).map(([cat, data]) => (
                  <tr key={cat} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{data.count}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(data.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'staff' && (isAdmin || isManager) && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Staff Sales Performance — September 2026</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Sales This Month</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission Rate</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission Earned</th>
                  {isAdmin && <th className="text-right px-4 py-3 font-medium text-gray-600">Net Pay</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialEmployees.filter(e => e.status === 'ACTIVE').sort((a, b) => b.totalSalesMonth - a.totalSalesMonth).map(emp => {
                  const commission = (emp.commissionRate / 100) * emp.totalSalesMonth;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.role}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatINR(emp.totalSalesMonth)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{emp.commissionRate}%</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatINR(commission)}</td>
                      {isAdmin && <td className="px-4 py-3 text-right font-bold text-blue-700">{formatINR(emp.baseSalary + commission)}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Sales Contribution (from transactions)</h3>
            <div className="space-y-3">
              {Object.entries(staffSales).sort(([, a], [, b]) => b - a).map(([name, amount]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate">{name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(amount / totalRevenue * 100).toFixed(0)}%` }} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 w-28 text-right">{formatINR(amount)}</div>
                  <div className="text-xs text-gray-400 w-10">{(amount / totalRevenue * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

