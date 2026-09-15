'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ReportsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  // Pull real live data from the global store (connected to Neon PostgreSQL)
  const { products, sales, employees, purchases, repairs, isDbConnected } = useStore();

  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'staff' | 'profit'>('sales');

  // 1. Sales Analytics
  const completedSales = sales.filter(s => s.status === 'COMPLETED' || s.status === 'PAID');
  const salesRevenue = completedSales.reduce((s, x) => s + x.total, 0);
  const totalRevenue = salesRevenue;
  const totalDiscount = completedSales.reduce((s, x) => s + x.discount, 0);
  const totalTax = completedSales.reduce((s, x) => s + x.tax, 0);
  const avgOrderValue = completedSales.length > 0 ? salesRevenue / completedSales.length : 0;
  const paymentBreakdown = completedSales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  // 2. Cost of Goods Sold (COGS) for products sold
  const salesCOGS = completedSales.reduce((sum, s) => {
    if (s.cogs && s.cogs > 0) return sum + s.cogs;
    if (s.items && s.items.length > 0) {
      return sum + s.items.reduce((iSum, i) => iSum + i.qty * (i.unitCost || 0), 0);
    }
    return sum + Math.round(s.total * 0.78);
  }, 0);

  // 3. Repair Servicing Revenue & Spare Parts Costs
  const completedRepairs = repairs.filter(r => r.status === 'READY' || r.status === 'DELIVERED');
  const repairRevenue = completedRepairs.reduce((s, r) => s + r.estimatedCost, 0);
  const repairPartsCost = completedRepairs.reduce((sum, r) => {
    if (!r.partsUsed || r.partsUsed.trim() === '') return sum + Math.round(r.estimatedCost * 0.25);
    const matched = products.find(p => r.partsUsed?.toLowerCase().includes(p.name.toLowerCase()));
    return sum + (matched ? matched.purchasePrice : Math.round(r.estimatedCost * 0.35));
  }, 0);
  const techCommissions = completedRepairs.reduce((sum, r) => sum + Math.round(r.estimatedCost * 0.05), 0);

  // 4. Combined Business Revenue & True Gross Profit
  const totalCombinedRevenue = salesRevenue + repairRevenue;
  const totalCOGS = salesCOGS + repairPartsCost;
  const grossProfit = totalCombinedRevenue - totalCOGS;
  const grossMarginPct = totalCombinedRevenue > 0 ? ((grossProfit / totalCombinedRevenue) * 100).toFixed(1) : '0';

  // 5. Operating Expenses & Net Business Profit
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
  const staffSalesCommissions = activeEmployees.reduce((sum, e) => sum + (e.commissionRate / 100) * e.totalSalesMonth, 0);
  const staffBaseSalaries = activeEmployees.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalOperatingExpenses = staffBaseSalaries + staffSalesCommissions + techCommissions;
  const netBusinessProfit = grossProfit - totalOperatingExpenses;
  const netMarginPct = totalCombinedRevenue > 0 ? ((netBusinessProfit / totalCombinedRevenue) * 100).toFixed(1) : '0';

  // 6. Purchases (Capitalized Inventory Purchases)
  const totalPurchaseOrdersCost = purchases.reduce((s, p) => s + p.total, 0);

  // Staff performance — from real sales transactions
  const staffSales = sales.reduce((acc, s) => {
    acc[s.staffName] = (acc[s.staffName] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  // Product margins — from real product catalog
  const activeProducts = products.filter(p => p.status === 'ACTIVE');
  const productMargins = activeProducts
    .map(p => ({
      ...p,
      margin: p.purchasePrice > 0 ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100) : 0,
      profit: p.sellingPrice - p.purchasePrice,
    }))
    .sort((a, b) => b.margin - a.margin);

  // Inventory report
  const totalInventoryValue = activeProducts.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const lowStockItems = activeProducts.filter(p => p.stock <= p.minStock);
  const categoryBreakdown = activeProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { count: 0, value: 0 };
    acc[p.category].count += p.stock;
    acc[p.category].value += p.stock * p.purchasePrice;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const reports = [
    { id: 'sales', label: 'Sales Report', access: true },
    { id: 'profit', label: 'Profit & Loss Statement', access: isAdmin || isManager },
    { id: 'inventory', label: 'Inventory Report', access: true },
    { id: 'staff', label: 'Staff Performance', access: isAdmin || isManager },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business intelligence for Gupta Mobile Centre</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${isDbConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-green-500' : 'bg-amber-400'}`} />
          {isDbConnected ? 'Live Data — PostgreSQL Connected' : 'Cached Data — Offline Mode'}
        </div>
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
          {Object.keys(paymentBreakdown).length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">{method}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(0) : 0}%` }} />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-28 text-right">{formatINR(amount)}</div>
                    <div className="text-xs text-gray-400 w-12">{totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(0) : 0}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Recent Transactions ({sales.length} total)</div>
            {sales.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No sales recorded yet. Use POS to record your first sale.</div>
            ) : (
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
                  {sales.slice(0, 20).map(s => (
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
            )}
          </div>
        </div>
      )}

      {activeReport === 'profit' && (isAdmin || isManager) && (
        <div className="space-y-6">
          {/* Top 4 Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Combined Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalCombinedRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">Sales: {formatINR(salesRevenue)} · Repairs: {formatINR(repairRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Cost of Goods Sold (COGS)</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatINR(totalCOGS)}</p>
              <p className="text-xs text-gray-400 mt-1">Stock cost: {formatINR(salesCOGS)} · Parts: {formatINR(repairPartsCost)}</p>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">True Gross Profit</p>
              <p className={`text-2xl font-bold mt-1 ${grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatINR(grossProfit)}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">Margin: {grossMarginPct}%</p>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Net Business Profit</p>
              <p className={`text-2xl font-bold mt-1 ${netBusinessProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatINR(netBusinessProfit)}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Net Margin: {netMarginPct}%</p>
            </div>
          </div>

          {/* Educational Accounting Explanation Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
            <h4 className="font-bold text-sm text-blue-950">How Gross Profit & Net Profit are Calculated:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li><strong>Gross Profit</strong> = Combined Revenue ({formatINR(totalCombinedRevenue)}) − Cost of Goods Sold ({formatINR(totalCOGS)}) = <span className="font-bold text-blue-900">{formatINR(grossProfit)}</span>.</li>
              <li><strong>Cost of Goods Sold (COGS)</strong> includes only the purchase cost of the actual phones, accessories, and spare parts that were delivered/sold to customers.</li>
              <li><strong>Wholesale Stock Purchases ({formatINR(totalPurchaseOrdersCost)})</strong> are balance-sheet inventory assets, NOT deducted as one-day operating expenses.</li>
              <li><strong>Net Operating Profit</strong> = Gross Profit − Staff Base Salaries ({formatINR(staffBaseSalaries)}) − Staff Commissions ({formatINR(staffSalesCommissions)}) − Tech Commissions ({formatINR(techCommissions)}) = <span className="font-bold text-emerald-800">{formatINR(netBusinessProfit)}</span>.</li>
            </ul>
          </div>

          {/* Formal Income Statement Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b font-bold text-gray-900 text-sm">Income Statement (Profit & Loss Breakdown)</div>
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr className="bg-gray-50/70 font-semibold text-gray-700">
                  <td className="px-5 py-2.5" colSpan={2}>1. REVENUE (INCOME)</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">In-Store Product Sales (POS)</td>
                  <td className="px-5 py-2.5 text-right font-medium text-gray-900">{formatINR(salesRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Mobile Service & Repair Revenue</td>
                  <td className="px-5 py-2.5 text-right font-medium text-gray-900">{formatINR(repairRevenue)}</td>
                </tr>
                <tr className="bg-green-50/60 font-bold text-green-900">
                  <td className="px-5 py-3">Total Operating Revenue</td>
                  <td className="px-5 py-3 text-right text-base">{formatINR(totalCombinedRevenue)}</td>
                </tr>

                <tr className="bg-gray-50/70 font-semibold text-gray-700">
                  <td className="px-5 py-2.5" colSpan={2}>2. DIRECT COST OF GOODS SOLD (COGS)</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Cost of Products Sold (Wholesale Unit Cost)</td>
                  <td className="px-5 py-2.5 text-right font-medium text-orange-700">− {formatINR(salesCOGS)}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Cost of Spare Parts Consumed (Displays, Batteries, Flex)</td>
                  <td className="px-5 py-2.5 text-right font-medium text-orange-700">− {formatINR(repairPartsCost)}</td>
                </tr>
                <tr className="bg-orange-50/60 font-bold text-orange-900">
                  <td className="px-5 py-3">Total Cost of Goods Sold (COGS)</td>
                  <td className="px-5 py-3 text-right text-base">− {formatINR(totalCOGS)}</td>
                </tr>

                <tr className="bg-blue-50/80 font-black text-blue-950 text-base">
                  <td className="px-5 py-3.5">GROSS PROFIT (Margin: {grossMarginPct}%)</td>
                  <td className="px-5 py-3.5 text-right text-green-700">{formatINR(grossProfit)}</td>
                </tr>

                <tr className="bg-gray-50/70 font-semibold text-gray-700">
                  <td className="px-5 py-2.5" colSpan={2}>3. OPERATING EXPENSES (STAFF & PAYROLL)</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Staff Base Salaries ({activeEmployees.length} active staff)</td>
                  <td className="px-5 py-2.5 text-right font-medium text-red-600">− {formatINR(staffBaseSalaries)}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Staff Sales Commissions</td>
                  <td className="px-5 py-2.5 text-right font-medium text-red-600">− {formatINR(staffSalesCommissions)}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2.5 text-gray-600">Technician Repair Commissions (5.0%)</td>
                  <td className="px-5 py-2.5 text-right font-medium text-red-600">− {formatINR(techCommissions)}</td>
                </tr>
                <tr className="bg-red-50/60 font-bold text-red-900">
                  <td className="px-5 py-3">Total Operating Expenses (OpEx)</td>
                  <td className="px-5 py-3 text-right text-base">− {formatINR(totalOperatingExpenses)}</td>
                </tr>

                <tr className="bg-emerald-100 font-black text-emerald-950 text-lg">
                  <td className="px-5 py-4">NET BUSINESS PROFIT (Net Margin: {netMarginPct}%)</td>
                  <td className="px-5 py-4 text-right text-emerald-800">{formatINR(netBusinessProfit)}</td>
                </tr>

                <tr className="bg-slate-50 text-xs text-slate-500">
                  <td className="px-5 py-2.5">Capitalized Inventory Purchases (Balance Sheet Asset)</td>
                  <td className="px-5 py-2.5 text-right font-medium">{formatINR(totalPurchaseOrdersCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Product Profit Margins — Sorted by Margin %</div>
            {productMargins.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No products in catalog yet.</div>
            ) : (
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
                    {productMargins.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatINR(p.purchasePrice)}</td>
                        <td className="px-4 py-3 text-right">{formatINR(p.sellingPrice)}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{formatINR(p.profit)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.margin > 50 ? 'bg-green-100 text-green-700' : p.margin > 20 ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {p.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeProducts.length}</p>
              <p className="text-xs text-gray-400 mt-1">Active in catalog</p>
            </div>
            <div className={`rounded-xl border p-5 ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStockItems.length}</p>
              <p className="text-xs text-gray-400 mt-1">At or below reorder level</p>
            </div>
          </div>
          {Object.keys(categoryBreakdown).length > 0 && (
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
          )}
        </div>
      )}

      {activeReport === 'staff' && (isAdmin || isManager) && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-900">Staff Sales Performance</div>
            {employees.filter(e => e.status === 'ACTIVE').length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No active employees found.</div>
            ) : (
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
                  {employees.filter(e => e.status === 'ACTIVE').sort((a, b) => b.totalSalesMonth - a.totalSalesMonth).map(emp => {
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
            )}
          </div>
          {Object.keys(staffSales).length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Sales Contribution by Staff (from {sales.length} transactions)</h3>
              <div className="space-y-3">
                {Object.entries(staffSales).sort(([, a], [, b]) => b - a).map(([name, amount]) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-700 truncate">{name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(0) : 0}%` }} />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 w-28 text-right">{formatINR(amount)}</div>
                    <div className="text-xs text-gray-400 w-10">{totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(0) : 0}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
