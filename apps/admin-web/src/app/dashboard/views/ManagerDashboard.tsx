'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/api';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function ManagerDashboard({ user }: { user: AuthUser | null }) {
  const { products, sales, employees, stockMovements, markAttendance } = useStore();

  // Daily target
  const DAILY_TARGET = 75000;
  const todayRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const targetProgress = Math.min(100, Math.round((todayRevenue / DAILY_TARGET) * 100));

  // Staff on duty
  const staffMembers = employees.filter(e => e.role !== 'Admin');
  const presentCount = staffMembers.filter(e => e.todayAttendance === 'PRESENT').length;

  // Inventory issues
  const lowStock = products.filter(p => p.status === 'ACTIVE' && p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-cyan-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/20">
            🏬 Store Branch Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hello, {user?.name || 'Neha Rani'}</h1>
          <p className="text-blue-200 text-sm mt-1">Gupta Mobile Centre · Operations & Floor Management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory" className="px-4 py-2 bg-white text-blue-900 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow">
            📦 Stock Adjust
          </Link>
          <Link href="/dashboard/sales" className="px-4 py-2 bg-blue-500/40 text-white border border-blue-300/30 rounded-xl text-sm font-semibold hover:bg-blue-500/60 transition">
            🛒 Open POS
          </Link>
        </div>
      </div>

      {/* Target Progress Meter */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Today's Store Target</h2>
            <p className="text-xs text-gray-500">Daily store revenue milestone</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-blue-600">{formatINR(todayRevenue)}</span>
            <span className="text-xs text-gray-400"> / {formatINR(DAILY_TARGET)} ({targetProgress}%)</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${targetProgress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
            style={{ width: `${targetProgress}%` }}
          />
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff On Duty</span>
            <span className="p-2 rounded-lg bg-green-50 text-green-700 text-lg">👥</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">{presentCount} / {staffMembers.length} Present</div>
          <div className="text-xs text-gray-500 mt-1">Cashiers & Technicians active</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock SKUs</span>
            <span className="p-2 rounded-lg bg-red-50 text-red-700 text-lg">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">{lowStock.length} Products</div>
          <div className="text-xs text-gray-500 mt-1">Requires reorder from suppliers</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Stock Audits</span>
            <span className="p-2 rounded-lg bg-cyan-50 text-cyan-700 text-lg">📋</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stockMovements.length} Logs</div>
          <div className="text-xs text-gray-500 mt-1">Receipts & stock reductions</div>
        </div>
      </div>

      {/* Two Column: Staff Attendance Live Manager & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Staff Attendance Control */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Floor Staff Attendance</h2>
              <p className="text-xs text-gray-500">1-click attendance marking for today</p>
            </div>
            <Link href="/dashboard/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Full Roster →
            </Link>
          </div>
          <div className="divide-y">
            {staffMembers.map(emp => (
              <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{emp.name}</div>
                  <div className="text-xs text-gray-500">{emp.role} · Phone: {emp.phone}</div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => markAttendance(emp.id, 'PRESENT')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      emp.todayAttendance === 'PRESENT' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(emp.id, 'HALF_DAY')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      emp.todayAttendance === 'HALF_DAY' ? 'bg-amber-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Half Day
                  </button>
                  <button
                    onClick={() => markAttendance(emp.id, 'ABSENT')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      emp.todayAttendance === 'ABSENT' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement Feed */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Inventory Movements</h2>
              <p className="text-xs text-gray-500">Live sales reduction & stock entries</p>
            </div>
            <Link href="/dashboard/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Audit Logs →
            </Link>
          </div>
          {stockMovements.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No stock movements recorded yet.</div>
          ) : (
            <div className="divide-y">
              {stockMovements.slice(0, 5).map(sm => (
                <div key={sm.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{sm.productName}</div>
                    <div className="text-xs text-gray-400">{sm.date} · {sm.reason}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      sm.quantity < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity} units
                    </span>
                    <div className="text-[11px] text-gray-400 mt-0.5">By {sm.actor}</div>
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
