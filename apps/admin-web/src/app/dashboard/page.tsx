'use client';

import { useAuth } from '@/lib/auth';
import { initialProducts, initialSales, initialEmployees, initialStockMovements } from '@/lib/mockData';
import Link from 'next/link';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function DashboardPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');

  const todaySales = initialSales.filter(s => s.date.includes('2026-09-09'));
  const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const monthRevenue = initialSales.reduce((s, x) => s + x.total, 0);
  const lowStockCount = initialProducts.filter(p => p.stock <= p.minStock && p.status === 'ACTIVE').length;
  const activeEmployees = initialEmployees.filter(e => e.status === 'ACTIVE' && e.todayAttendance === 'PRESENT').length;

  const stats = [
    { label: "Today's Sales", value: formatINR(todayRevenue), sub: `${todaySales.length} orders today`, icon: '💰', color: 'bg-green-50 text-green-700', link: '/dashboard/sales' },
    { label: 'Monthly Revenue', value: formatINR(monthRevenue), sub: 'September 2026', icon: '📊', color: 'bg-blue-50 text-blue-700', link: '/dashboard/reports' },
    { label: 'Low Stock', value: String(lowStockCount), sub: 'Items below threshold', icon: '⚠️', color: lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-700', link: '/dashboard/inventory' },
    { label: 'Staff Present', value: `${activeEmployees}/${initialEmployees.length}`, sub: 'Active today', icon: '👥', color: 'bg-purple-50 text-purple-700', link: '/dashboard/employees' },
  ];

  const quickLinks = [
    { href: '/dashboard/sales', icon: '🛒', label: 'New Sale', desc: 'Open POS checkout', bg: 'bg-green-600 hover:bg-green-700' },
    { href: '/dashboard/products', icon: '📦', label: 'Add Product', desc: 'Manage catalog & price', bg: 'bg-blue-600 hover:bg-blue-700' },
    { href: '/dashboard/purchases', icon: '🏭', label: 'Purchase Order', desc: 'Order from supplier', bg: 'bg-purple-600 hover:bg-purple-700' },
    { href: '/dashboard/reports', icon: '📈', label: 'View Reports', desc: 'Store performance & P&L', bg: 'bg-orange-600 hover:bg-orange-700' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Welcome back, {user?.name || 'User'} · Gupta Mobile Centre · Gurgaon</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.link} className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${stat.color} bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(q => (
            <Link key={q.href} href={q.href} className={`${q.bg} text-white rounded-xl p-4 transition text-center group shadow-sm`}>
              <div className="text-2xl mb-1">{q.icon}</div>
              <div className="font-semibold text-sm">{q.label}</div>
              <div className="text-xs text-white/75 mt-0.5">{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Sales</h2>
            <Link href="/dashboard/sales" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
          </div>
          {initialSales.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No sales recorded yet.</p>
              <Link href="/dashboard/sales" className="inline-block mt-3 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition">
                + Make First Sale
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {initialSales.slice(0, 4).map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{s.customerName}</div>
                    <div className="text-xs text-gray-400">{s.invoiceNumber} · {s.staffName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatINR(s.total)}</div>
                    <div className="text-xs text-gray-400">{s.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock + Stock Movements */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Stock Movements</h2>
              <Link href="/dashboard/inventory" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View inventory →</Link>
            </div>
            {initialStockMovements.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No stock movements yet. Adding inventory or sales will log ledger entries here.
              </div>
            ) : (
              <div className="divide-y">
                {initialStockMovements.slice(0, 4).map(m => (
                  <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-900 truncate max-w-[180px]">{m.productName}</div>
                      <div className="text-xs text-gray-400">{m.type.replace('_', ' ')} · {m.actor}</div>
                    </div>
                    <span className={`text-sm font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payroll Preview for Admin */}
      {isAdmin && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Staff Payroll & Earnings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Auto-calculated: Net Pay = Base Salary + (Commission % × Monthly Sales)</p>
            </div>
            <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage staff →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Monthly Sales</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Base Salary</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Commission Earned</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600 bg-blue-50">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialEmployees.filter(e => e.status === 'ACTIVE').map(emp => {
                  const comm = (emp.commissionRate / 100) * emp.totalSalesMonth;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">{emp.role}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatINR(emp.totalSalesMonth)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatINR(emp.baseSalary)}</td>
                      <td className="px-5 py-3 text-right text-green-600 font-medium">{formatINR(comm)} ({emp.commissionRate}%)</td>
                      <td className="px-5 py-3 text-right bg-blue-50 font-bold text-blue-900">{formatINR(emp.baseSalary + comm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
