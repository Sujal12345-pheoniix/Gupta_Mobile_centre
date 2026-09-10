'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore, RepairJob } from '@/lib/store';
import { AuthUser } from '@/lib/api';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function TechnicianDashboard({ user }: { user: AuthUser | null }) {
  const { repairs, products, addRepairJob, updateRepairStatus, employees } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceModel: '',
    imei: '',
    issue: '',
    estimatedCost: 1500,
    advancePaid: 0,
    technicianName: user?.name || 'Amit Verma',
    partsUsed: ''
  });

  // Calculate technician commission
  const techRecord = employees.find(e =>
    e.role === 'Technician' || e.name.toLowerCase().includes((user?.name || 'Amit').toLowerCase())
  ) || { commissionRate: 5.0 };

  const readyOrDelivered = repairs.filter(r => r.status === 'READY' || r.status === 'DELIVERED');
  const totalRepairRevenue = readyOrDelivered.reduce((sum, r) => sum + r.estimatedCost, 0);
  const techCommission = (techRecord.commissionRate / 100) * totalRepairRevenue;

  // Filter spare parts from store inventory
  const spareParts = products.filter(p =>
    p.status === 'ACTIVE' &&
    (p.category === 'Spare Parts' || p.category === 'Screen Guards' || p.category === 'Cables')
  );

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.deviceModel || !form.issue) {
      alert('Please fill customer name, phone, device model, and issue!');
      return;
    }
    addRepairJob({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      deviceModel: form.deviceModel,
      imei: form.imei,
      issue: form.issue,
      estimatedCost: Number(form.estimatedCost),
      advancePaid: Number(form.advancePaid),
      status: 'DIAGNOSING',
      technicianName: form.technicianName,
      partsUsed: form.partsUsed
    });
    setShowModal(false);
    setForm({
      customerName: '',
      customerPhone: '',
      deviceModel: '',
      imei: '',
      issue: '',
      estimatedCost: 1500,
      advancePaid: 0,
      technicianName: user?.name || 'Amit Verma',
      partsUsed: ''
    });
  };

  const stages: { key: RepairJob['status']; label: string; color: string; badgeBg: string }[] = [
    { key: 'DIAGNOSING', label: '1. Diagnosing Device', color: 'border-yellow-400', badgeBg: 'bg-yellow-100 text-yellow-800' },
    { key: 'WAITING_PARTS', label: '2. Waiting for Spare Parts', color: 'border-orange-400', badgeBg: 'bg-orange-100 text-orange-800' },
    { key: 'IN_REPAIR', label: '3. In Repair / Bench', color: 'border-blue-400', badgeBg: 'bg-blue-100 text-blue-800' },
    { key: 'READY', label: '4. Repaired & Ready for Pickup', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-800 to-orange-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/20">
            🔧 Mobile Repair & Service Bench
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hello, {user?.name || 'Amit Verma'}</h1>
          <p className="text-amber-200 text-sm mt-1">Gupta Mobile Centre · Hardware & Software Service Center</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-white text-orange-950 rounded-xl text-sm font-bold hover:bg-orange-50 transition shadow-lg flex items-center gap-2"
        >
          <span>📱</span> + New Repair Job Card
        </button>
      </div>

      {/* Technician Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Repair Work Orders</span>
          <div className="text-2xl font-extrabold text-orange-600 mt-2">
            {repairs.filter(r => r.status !== 'DELIVERED').length} Devices
          </div>
          <div className="text-xs text-gray-500 mt-1">On technician bench</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repaired & Ready</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {repairs.filter(r => r.status === 'READY').length} Ready for Pickup
          </div>
          <div className="text-xs text-gray-500 mt-1">Pending customer pickup</div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Repair Incentive</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">+{formatINR(techCommission)}</div>
          <div className="text-xs text-gray-500 mt-1">{techRecord.commissionRate}% commission on completed repairs</div>
        </div>
      </div>

      {/* Kanban / Multi-Stage Repair Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Repair Job Pipeline</h2>
          <span className="text-xs text-gray-500">Live service workbench tracking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map(stage => {
            const stageJobs = repairs.filter(r => r.status === stage.key);
            return (
              <div key={stage.key} className={`bg-white rounded-xl border-t-4 ${stage.color} border-x border-b shadow-sm p-4 flex flex-col`}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">{stage.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stage.badgeBg}`}>
                    {stageJobs.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageJobs.length === 0 ? (
                    <div className="p-6 text-center text-gray-300 text-xs italic">No devices in this stage</div>
                  ) : (
                    stageJobs.map(job => (
                      <div key={job.id} className="p-3.5 bg-gray-50 rounded-xl border hover:shadow transition space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</span>
                          <span className="text-xs font-bold text-gray-900">{formatINR(job.estimatedCost)}</span>
                        </div>
                        <div className="font-bold text-sm text-gray-900">{job.deviceModel}</div>
                        <div className="text-xs text-gray-600 bg-white p-2 rounded-lg border">
                          <span className="font-semibold text-gray-700">Issue:</span> {job.issue}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Customer: <span className="font-semibold text-gray-700">{job.customerName}</span> ({job.customerPhone})
                        </div>

                        {/* Action buttons to progress stage */}
                        <div className="pt-2 flex flex-wrap gap-1 border-t">
                          {job.status === 'DIAGNOSING' && (
                            <>
                              <button
                                onClick={() => updateRepairStatus(job.id, 'WAITING_PARTS')}
                                className="flex-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-[11px] font-semibold"
                              >
                                Need Parts →
                              </button>
                              <button
                                onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')}
                                className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                              >
                                Start Repair →
                              </button>
                            </>
                          )}

                          {job.status === 'WAITING_PARTS' && (
                            <button
                              onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')}
                              className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                            >
                              Parts Arrived → Start Repair
                            </button>
                          )}

                          {job.status === 'IN_REPAIR' && (
                            <button
                              onClick={() => updateRepairStatus(job.id, 'READY')}
                              className="w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                            >
                              ✓ Repaired & Ready
                            </button>
                          )}

                          {job.status === 'READY' && (
                            <button
                              onClick={() => updateRepairStatus(job.id, 'DELIVERED')}
                              className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded text-[11px] font-semibold"
                            >
                              📦 Deliver to Customer
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Spare Parts in Store Inventory */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Spare Parts In Stock</h2>
            <p className="text-xs text-gray-500">Available displays, batteries, and connectors in store inventory</p>
          </div>
          <Link href="/dashboard/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All Inventory →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {spareParts.map(sp => (
            <div key={sp.id} className="p-3.5 bg-gray-50 rounded-xl border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-gray-900">{sp.name}</div>
                <div className="text-xs text-gray-500">{sp.brand} · SKU: {sp.sku}</div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  sp.stock > 2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {sp.stock} in stock
                </span>
                <div className="text-xs font-bold text-gray-900 mt-1">{formatINR(sp.sellingPrice)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Repair Job Card Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">New Repair Job Card</h3>
            <p className="text-xs text-gray-500 mb-4">Accept customer device for diagnostics & repair</p>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={form.customerPhone}
                    onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Device Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 / Galaxy A54"
                    value={form.deviceModel}
                    onChange={e => setForm({ ...form, deviceModel: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">IMEI / Serial (Optional)</label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI"
                    value={form.imei}
                    onChange={e => setForm({ ...form, imei: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Reported Problem / Issue *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Broken display, touch not working, water damage"
                  value={form.issue}
                  onChange={e => setForm({ ...form, issue: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.estimatedCost}
                    onChange={e => setForm({ ...form, estimatedCost: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={form.advancePaid}
                    onChange={e => setForm({ ...form, advancePaid: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow"
                >
                  Create Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
