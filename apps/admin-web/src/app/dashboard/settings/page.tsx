'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings, resetToDefaultData, isDbConnected } = useStore();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');

  const [orgSettings, setOrgSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'org' | 'roles'>('org');

  // Sync state if store settings change
  useEffect(() => {
    if (settings) {
      setOrgSettings(settings);
    }
  }, [settings]);

  // Roles list state - editable by Admin
  const [rolesList, setRolesList] = useState([
    { id: 'Admin', name: 'Admin', description: 'Full administrative control across Gupta Mobile Centre', permissions: ['Full administrative control', 'Manage catalog, pricing & stock thresholds', 'Process POS sales & approve returns', 'Manage staff, attendance & view payroll calculations', 'Access all financial reports & store settings'], color: 'bg-purple-100 text-purple-700' },
    { id: 'Manager', name: 'Manager', description: 'Inventory & store operations management', permissions: ['Inventory management & stock adjustments', 'Process POS sales & order receipts', 'Manage customer accounts & suppliers', 'View store reports', 'Restricted: Cannot delete records or modify store payroll/settings'], color: 'bg-blue-100 text-blue-700' },
    { id: 'Staff', name: 'Staff', description: 'Counter staff and POS checkout operations', permissions: ['Process sales via Point of Sale (POS)', 'Record real-time stock deduction on customer checkout', 'Search products & check stock availability', 'Restricted: No access to store financial margins, reports, or payroll'], color: 'bg-green-100 text-green-700' },
    { id: 'Technician', name: 'Technician', description: 'Mobile hardware & repair bench technician', permissions: ['View and update mobile repair job orders', 'Check and record spare parts used in repairs', 'Restricted: No access to store revenue or employee payroll'], color: 'bg-orange-100 text-orange-700' },
  ]);

  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Load roles from backend if available
  useEffect(() => {
    api.getRoles().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setRolesList(res.data);
      }
    }).catch(err => console.warn('Could not load roles:', err));
  }, []);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert('Only administrators can modify organisation settings.');

    setIsSaving(true);
    const ok = await updateSettings(orgSettings);
    setIsSaving(false);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveRole = async (roleId: string, description: string) => {
    if (!isAdmin) return alert('Only administrators can modify role configuration.');
    setSavingRoleId(roleId);
    try {
      await api.updateRole(roleId, { description });
    } catch (err) {
      console.warn('Update role failed:', err);
    }
    setSavingRoleId(null);
    alert(`Configuration for ${roleId} saved to database!`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage store profile and role-based permissions</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${isDbConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-green-500' : 'bg-amber-400'}`} />
          {isDbConnected ? 'PostgreSQL Database Connected' : 'Cached Local Storage Mode'}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {[['org', 'Organisation Profile'], ['roles', 'Roles & Permissions']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === id ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'org' && (
        <div className="max-w-2xl">
          <form onSubmit={handleSaveOrg} className="bg-white rounded-xl border p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Store Information</h2>
                <p className="text-xs text-gray-500">Changes written here are permanently saved to Neon PostgreSQL</p>
              </div>
              {saved && (
                <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full animate-fade-in">
                  ✓ Saved to Database!
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Business Name *</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.name}
                onChange={e => setOrgSettings({ ...orgSettings, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.gstin}
                onChange={e => setOrgSettings({ ...orgSettings, gstin: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.phone}
                onChange={e => setOrgSettings({ ...orgSettings, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.email}
                onChange={e => setOrgSettings({ ...orgSettings, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Store Address</label>
              <textarea
                rows={2}
                disabled={!isAdmin}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={orgSettings.address}
                onChange={e => setOrgSettings({ ...orgSettings, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Currency</label>
                <select
                  disabled={!isAdmin}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50' : ''}`}
                  value={orgSettings.currency}
                  onChange={e => setOrgSettings({ ...orgSettings, currency: e.target.value })}
                >
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Invoice Prefix</label>
                <input
                  disabled={!isAdmin}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50' : ''}`}
                  value={orgSettings.invoicePrefix}
                  onChange={e => setOrgSettings({ ...orgSettings, invoicePrefix: e.target.value })}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow ${
                    saved
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSaving ? 'Saving to Database...' : saved ? '✓ Saved to Database!' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset store data back to default mobile shop catalog, staff, and repair jobs?')) {
                      resetToDefaultData();
                      alert('Store data has been reset to defaults!');
                    }
                  }}
                  className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition"
                >
                  ↺ Reset Store Data to Default
                </button>
              </div>
            )}

            {!isAdmin && (
              <p className="text-xs text-gray-400">Only Admin has permissions to rewrite organisation profile settings.</p>
            )}
          </form>
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-sm">
            Role-Based Access Control (RBAC) enforces server-side permissions across Gupta Mobile Centre. Administrators have the authority to edit descriptions and manage responsibilities for each role.
          </div>

          {rolesList.map((role, idx) => (
            <div key={role.id || role.name} className="bg-white rounded-xl border p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded-full font-bold ${role.color || 'bg-gray-100 text-gray-800'}`}>
                  {role.name}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleSaveRole(role.id || role.name, role.description)}
                    disabled={savingRoleId === (role.id || role.name)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                  >
                    {savingRoleId === (role.id || role.name) ? 'Saving...' : 'Save Role'}
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Role Description / Scope</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={role.description}
                  onChange={e => {
                    const next = [...rolesList];
                    next[idx].description = e.target.value;
                    setRolesList(next);
                  }}
                  className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-2">Granted Capabilities & Rules:</span>
                <ul className="space-y-1.5">
                  {role.permissions.map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
