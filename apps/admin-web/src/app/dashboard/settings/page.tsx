'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');

  const [orgSettings, setOrgSettings] = useState({
    name: 'Gupta Mobile Centre',
    gstin: '06ABCDE1234F1Z5',
    phone: '9876543210',
    email: 'gupta.mobile@gmail.com',
    address: 'Shop No. 14, Main Market, Gurgaon - 122001, Haryana',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    invoicePrefix: 'GMC',
  });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'org' | 'roles'>('org');

  const roles_list = [
    { name: 'Admin', permissions: ['Full administrative control', 'Manage catalog, pricing & stock thresholds', 'Process POS sales & approve returns', 'Manage staff, attendance & view payroll calculations', 'Access all financial reports & store settings'], color: 'bg-purple-100 text-purple-700' },
    { name: 'Manager', permissions: ['Inventory management & stock adjustments', 'Process POS sales & order receipts', 'Manage customer accounts & suppliers', 'View store reports', 'Restricted: Cannot delete records or modify store payroll/settings'], color: 'bg-blue-100 text-blue-700' },
    { name: 'Staff', permissions: ['Process sales via Point of Sale (POS)', 'Record real-time stock deduction on customer checkout', 'Search products & check stock availability', 'Restricted: No access to store financial margins, reports, or payroll'], color: 'bg-green-100 text-green-700' },
    { name: 'Technician', permissions: ['View and update mobile repair job orders', 'Check and record spare parts used in repairs', 'Restricted: No access to store revenue or employee payroll'], color: 'bg-orange-100 text-orange-700' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage store profile and role-based permissions</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {[['org', 'Organisation Profile'], ['roles', 'Roles & Permissions']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'org' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Store Information</h2>
            {[
              ['Business Name', 'name', 'text'],
              ['GSTIN Number', 'gstin', 'text'],
              ['Phone Number', 'phone', 'tel'],
              ['Email Address', 'email', 'email'],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                <input type={type} disabled={!isAdmin}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  value={(orgSettings as Record<string, string>)[field]}
                  onChange={e => setOrgSettings(s => ({ ...s, [field]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Store Address</label>
              <textarea rows={2} disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.address}
                onChange={e => setOrgSettings(s => ({ ...s, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Currency</label>
                <select disabled={!isAdmin} className={`w-full border rounded-lg px-3 py-2 text-sm ${!isAdmin ? 'bg-gray-50' : ''}`} value={orgSettings.currency} onChange={e => setOrgSettings(s => ({ ...s, currency: e.target.value }))}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Invoice Prefix</label>
                <input disabled={!isAdmin} className={`w-full border rounded-lg px-3 py-2 text-sm ${!isAdmin ? 'bg-gray-50' : ''}`} value={orgSettings.invoicePrefix} onChange={e => setOrgSettings(s => ({ ...s, invoicePrefix: e.target.value }))} />
              </div>
            </div>
            {isAdmin && (
              <button onClick={handleSave} className={`px-6 py-2 rounded-lg text-sm font-medium transition ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            )}
            {!isAdmin && (
              <p className="text-xs text-gray-400">Only Admin can modify organisation settings.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            ℹ️ Role-Based Access Control (RBAC) enforces granular permissions across Gupta Mobile Centre. Roles determine accessible sidebar modules and action buttons.
          </div>
          {roles_list.map(role => (
            <div key={role.name} className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${role.color}`}>{role.name}</span>
              </div>
              <ul className="space-y-1">
                {role.permissions.map((perm, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
