'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { initialEmployees, EmployeeRecord } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const roleColor: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Staff: 'bg-green-100 text-green-700',
  Technician: 'bg-orange-100 text-orange-700',
};

const attendanceColor: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-yellow-100 text-yellow-700',
  HALF_DAY: 'bg-orange-100 text-orange-700',
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isManager = roles.includes('Manager') || isAdmin;

  const [employees, setEmployees] = useState<EmployeeRecord[]>(initialEmployees);
  const [tab, setTab] = useState<'roster' | 'payroll'>('roster');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EmployeeRecord, 'id' | 'totalSalesMonth'>>({
    code: '', name: '', role: 'Staff', phone: '', baseSalary: 0, commissionRate: 1.5, status: 'ACTIVE', todayAttendance: 'PRESENT'
  });

  const calcCommission = (emp: EmployeeRecord) => (emp.commissionRate / 100) * emp.totalSalesMonth;
  const calcNetPay = (emp: EmployeeRecord) => emp.baseSalary + calcCommission(emp);

  const totalPayroll = employees.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + calcNetPay(e), 0);
  const totalSales = employees.reduce((s, e) => s + e.totalSalesMonth, 0);
  const presentToday = employees.filter(e => e.todayAttendance === 'PRESENT').length;

  const openAdd = () => {
    setEditId(null);
    setForm({ code: `EMP00${employees.length + 1}`, name: '', role: 'Staff', phone: '', baseSalary: 22000, commissionRate: 1.5, status: 'ACTIVE', todayAttendance: 'PRESENT' });
    setShowModal(true);
  };
  const openEdit = (e: EmployeeRecord) => {
    setEditId(e.id);
    setForm({ code: e.code, name: e.name, role: e.role, phone: e.phone, baseSalary: e.baseSalary, commissionRate: e.commissionRate, status: e.status, todayAttendance: e.todayAttendance });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name || !form.phone) return alert('Name and phone required');
    if (editId) setEmployees(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e));
    else setEmployees(prev => [...prev, { ...form, id: `emp-${Date.now()}`, totalSalesMonth: 0 }]);
    setShowModal(false);
  };
  const markAttendance = (id: string, att: EmployeeRecord['todayAttendance']) =>
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, todayAttendance: att } : e));

  return (
    <div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Present Today</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{presentToday}/{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Monthly Sales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalSales)}</p>
        </div>
        {isAdmin && (
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm text-gray-500">Monthly Payroll</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalPayroll)}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('roster')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'roster' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Staff Roster</button>
          {isAdmin && <button onClick={() => setTab('payroll')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'payroll' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Payroll</button>}
        </div>
        {isAdmin && <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Employee</button>}
      </div>

      {tab === 'roster' && (
        <div className="space-y-3">
          {employees.map(emp => (
            <div key={emp.id} className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${emp.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{emp.name}</div>
                  <div className="text-xs text-gray-400">{emp.code} · {emp.phone}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[emp.role]}`}>{emp.role}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${attendanceColor[emp.todayAttendance]}`}>{emp.todayAttendance}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Base Salary</div>
                  <div className="font-medium">{formatINR(emp.baseSalary)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Commission</div>
                  <div className="font-medium">{emp.commissionRate}%</div>
                </div>
              </div>
              {isManager && (
                <div className="flex gap-2">
                  <select className="text-xs border rounded px-2 py-1" value={emp.todayAttendance}
                    onChange={e => markAttendance(emp.id, e.target.value as EmployeeRecord['todayAttendance'])}>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                  {isAdmin && <button onClick={() => openEdit(emp)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition">Edit</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'payroll' && isAdmin && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Monthly Payroll Summary — September 2026</h2>
            <p className="text-xs text-gray-400 mt-1">Commission = (Commission Rate × Monthly Sales)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monthly Sales</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Base Salary</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Commission Rate</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission Earned</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 bg-blue-50">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.filter(e => e.status === 'ACTIVE').map(emp => {
                  const commission = calcCommission(emp);
                  const netPay = calcNetPay(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.code}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[emp.role]}`}>{emp.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatINR(emp.totalSalesMonth)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatINR(emp.baseSalary)}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{emp.commissionRate}%</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatINR(commission)}</td>
                      <td className="px-4 py-3 text-right bg-blue-50 font-bold text-blue-900">{formatINR(netPay)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(totalSales)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(employees.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + e.baseSalary, 0))}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{formatINR(employees.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + calcCommission(e), 0))}</td>
                  <td className="px-4 py-3 text-right bg-blue-50 font-bold text-blue-900 text-lg">{formatINR(totalPayroll)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Employee Code</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Role</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as EmployeeRecord['role'] }))}>
                    <option>Admin</option><option>Manager</option><option>Staff</option><option>Technician</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Base Salary (₹/mo)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Commission Rate (%)</label>
                  <input type="number" step="0.5" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editId ? 'Save Changes' : 'Add Employee'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

