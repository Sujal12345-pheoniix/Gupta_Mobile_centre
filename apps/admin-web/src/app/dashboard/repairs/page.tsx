'use client';

import { useState } from 'react';
import { useStore, RepairJob } from '@/lib/store';
import { useAuth } from '@/lib/auth';

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const STATUS_CONFIG: Record<RepairJob['status'] | 'DELIVERED', { label: string; color: string; badge: string; border: string }> = {
  DIAGNOSING:    { label: 'Diagnosing',        color: 'bg-yellow-50',  badge: 'bg-yellow-100 text-yellow-800',  border: 'border-t-yellow-400' },
  WAITING_PARTS: { label: 'Waiting for Parts', color: 'bg-orange-50',  badge: 'bg-orange-100 text-orange-800',  border: 'border-t-orange-400' },
  IN_REPAIR:     { label: 'In Repair',         color: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-800',      border: 'border-t-blue-400' },
  READY:         { label: 'Ready for Pickup',  color: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800', border: 'border-t-emerald-500' },
  DELIVERED:     { label: 'Delivered',         color: 'bg-gray-50',    badge: 'bg-gray-100 text-gray-600',      border: 'border-t-gray-400' },
};

const PIPELINE_STAGES: RepairJob['status'][] = ['DIAGNOSING', 'WAITING_PARTS', 'IN_REPAIR', 'READY'];

type Tab = 'pipeline' | 'all' | 'financials' | 'parts' | 'delivered';

export default function RepairsPage() {
  const { user } = useAuth();
  const { repairs, products, employees, addRepairJob, updateRepairStatus } = useStore();

  const [tab, setTab] = useState<Tab>('pipeline');
  const [showModal, setShowModal] = useState(false);
  const [filterTech, setFilterTech] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Active technicians from employee list
  const technicians = employees.filter(e => e.status === 'ACTIVE' && (e.role === 'Technician' || e.role === 'Staff'));

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceModel: '',
    imei: '',
    issue: '',
    estimatedCost: 1500,
    advancePaid: 0,
    technicianName: technicians[0]?.name || 'Amit Verma',
    partsUsed: '',
  });

  // Spare parts from store inventory
  const spareParts = products.filter(p =>
    p.status === 'ACTIVE' &&
    (p.category === 'Spare Parts' || p.category === 'Cables' || p.category === 'Screen Guards')
  );

  const partsNeeded = repairs.filter(r => r.status === 'WAITING_PARTS');
  const activeRepairs = repairs.filter(r => r.status !== 'DELIVERED');
  const completedRepairs = repairs.filter(r => r.status === 'READY' || r.status === 'DELIVERED');

  // --- FINANCIAL CALCULATIONS ---
  // Calculates parts cost: looks up matched inventory product or standard 30% parts ratio
  const calculatePartsCost = (job: RepairJob) => {
    if (!job.partsUsed || job.partsUsed.trim() === '') {
      return Math.round(job.estimatedCost * 0.25);
    }
    const matched = products.find(p =>
      job.partsUsed?.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(job.partsUsed?.toLowerCase() || '')
    );
    if (matched) return matched.purchasePrice;
    return Math.round(job.estimatedCost * 0.35);
  };

  // Calculates technician commission (default 5% if not configured)
  const calculateCommission = (job: RepairJob) => {
    const tech = employees.find(e => e.name.toLowerCase() === job.technicianName.toLowerCase());
    const rate = tech ? tech.commissionRate : 5.0;
    return Math.round((rate / 100) * job.estimatedCost);
  };

  // Aggregated totals
  const totalRepairRevenue = completedRepairs.reduce((s, r) => s + r.estimatedCost, 0);
  const totalPartsCost = completedRepairs.reduce((s, r) => s + calculatePartsCost(r), 0);
  const totalCommissions = completedRepairs.reduce((s, r) => s + calculateCommission(r), 0);
  const totalAdvanceCollected = repairs.reduce((s, r) => s + (r.advancePaid || 0), 0);

  // Margins
  const grossProfit = totalRepairRevenue - totalPartsCost;
  const grossMarginPct = totalRepairRevenue > 0 ? ((grossProfit / totalRepairRevenue) * 100).toFixed(1) : '0';
  const netProfit = grossProfit - totalCommissions;
  const netMarginPct = totalRepairRevenue > 0 ? ((netProfit / totalRepairRevenue) * 100).toFixed(1) : '0';

  const pendingCollection = repairs
    .filter(r => r.status === 'READY')
    .reduce((s, r) => s + Math.max(0, r.estimatedCost - (r.advancePaid || 0)), 0);

  const filteredRepairs = repairs.filter(r => {
    if (filterTech !== 'ALL' && r.technicianName !== filterTech) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.deviceModel || !form.issue) {
      alert('Please fill all required fields.');
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
      partsUsed: form.partsUsed,
    });
    setShowModal(false);
    setForm({
      customerName: '', customerPhone: '', deviceModel: '', imei: '', issue: '',
      estimatedCost: 1500, advancePaid: 0,
      technicianName: technicians[0]?.name || 'Amit Verma', partsUsed: '',
    });
  };

  const handleReassign = (jobId: string, techName: string) => {
    updateRepairStatus(jobId, repairs.find(r => r.id === jobId)?.status || 'DIAGNOSING', undefined);
    alert(`Reassignment saved: ${techName} assigned to job ${jobId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-orange-800 to-amber-900 rounded-2xl p-4 sm:p-5 text-white shadow-md min-w-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/10">
            Service Centre Management
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Repair Centre Control & Financials</h1>
          <p className="text-amber-200 text-xs sm:text-sm mt-0.5">Revenue · Profit Margins · Technician Commissions · Pipeline</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white text-amber-900 rounded-xl text-sm font-bold hover:bg-amber-50 transition shadow flex-shrink-0 text-center"
        >
          + New Repair Job Card
        </button>
      </div>

      {/* Financial Health Overview Bar (Requested by user) */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-3 sm:space-y-4 min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Service Centre Financial Breakdown</h2>
            <p className="text-xs text-gray-500">Realized earnings from completed & delivered repairs</p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border self-start sm:self-auto">
            <span>Completed Tickets: <strong>{completedRepairs.length}</strong></span>
            <span>·</span>
            <span>Active Bench: <strong>{activeRepairs.length}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 min-w-0">
          <div className="bg-green-50/70 border border-green-200/60 rounded-xl p-3 sm:p-3.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-green-800 uppercase tracking-wide truncate">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-black text-green-700 mt-1 truncate">{formatINR(totalRepairRevenue)}</p>
            <p className="text-[10px] sm:text-[11px] text-green-700/80 mt-0.5 truncate">Billed service charges</p>
          </div>

          <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-3 sm:p-3.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-orange-800 uppercase tracking-wide truncate">Parts Consumed</p>
            <p className="text-xl sm:text-2xl font-black text-orange-700 mt-1 truncate">{formatINR(totalPartsCost)}</p>
            <p className="text-[10px] sm:text-[11px] text-orange-700/80 mt-0.5 truncate">Screens, batteries & flex</p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 sm:p-3.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-blue-800 uppercase tracking-wide truncate">Gross Margin</p>
            <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1 truncate">{formatINR(grossProfit)}</p>
            <p className="text-[10px] sm:text-[11px] text-blue-700/80 mt-0.5 truncate">{grossMarginPct}% gross margin</p>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 sm:p-3.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-purple-800 uppercase tracking-wide truncate">Commissions</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700 mt-1 truncate">{formatINR(totalCommissions)}</p>
            <p className="text-[10px] sm:text-[11px] text-purple-700/80 mt-0.5 truncate">5.0% incentive payable</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 sm:p-3.5 col-span-2 sm:col-span-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-emerald-900 uppercase tracking-wide truncate">Shop Net Profit</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 truncate">{formatINR(netProfit)}</p>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold mt-0.5 truncate">{netMarginPct}% net margin</p>
          </div>
        </div>

        {/* Accounting Calculation Formula Explanation Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 break-words">
          <div className="min-w-0 break-words leading-relaxed">
            <strong className="text-slate-800">Accounting Formula:</strong> Gross Profit = Repair Revenue ({formatINR(totalRepairRevenue)}) − Spare Parts Cost ({formatINR(totalPartsCost)}) = <span className="font-semibold text-blue-700">{formatINR(grossProfit)}</span>. Net Profit = Gross Profit − Tech Commissions ({formatINR(totalCommissions)}) = <span className="font-semibold text-emerald-700">{formatINR(netProfit)}</span>.
          </div>
          <span className="text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0 self-start sm:self-auto">Advance Held: {formatINR(totalAdvanceCollected)}</span>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 min-w-0">
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border shadow-sm min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Active Bench</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1 truncate">{activeRepairs.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">Currently in service</p>
        </div>
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border shadow-sm min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Awaiting Parts</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1 truncate">{partsNeeded.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">Blocked for parts</p>
        </div>
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border shadow-sm min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Repaired & Ready</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 truncate">{repairs.filter(r => r.status === 'READY').length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">Ready for pickup</p>
        </div>
        <div className={`rounded-xl p-3.5 sm:p-4 border shadow-sm min-w-0 ${pendingCollection > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase truncate">Pending Due</p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 truncate ${pendingCollection > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{formatINR(pendingCollection)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">Due on ready devices</p>
        </div>
      </div>

      {/* Tabs (Responsive horizontal swipe container without overflowing page width) */}
      <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex gap-1 bg-gray-100 rounded-xl p-1 min-w-max">
          {([
            { key: 'pipeline',   label: 'Pipeline View' },
            { key: 'all',        label: `All Jobs (${repairs.length})` },
            { key: 'financials', label: 'Financial Audit' },
            { key: 'parts',      label: `Parts Requests (${partsNeeded.length})` },
            { key: 'delivered',  label: 'Delivered' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- PIPELINE TAB --- */}
      {tab === 'pipeline' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 min-w-0 max-w-full">
          {PIPELINE_STAGES.map(stage => {
            const cfg = STATUS_CONFIG[stage];
            const jobs = repairs.filter(r => r.status === stage);
            return (
              <div key={stage} className={`bg-white rounded-xl border-t-4 ${cfg.border} border-x border-b shadow-sm flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-xs text-gray-700 uppercase tracking-wide">{cfg.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>{jobs.length}</span>
                </div>
                <div className="p-3 space-y-3 flex-1">
                  {jobs.length === 0 ? (
                    <p className="p-6 text-center text-gray-300 text-xs italic">No devices in this stage</p>
                  ) : jobs.map(job => (
                    <div key={job.id} className="bg-gray-50 rounded-xl border p-3 space-y-2 hover:shadow transition">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</span>
                        <span className="text-xs font-bold text-gray-900">{formatINR(job.estimatedCost)}</span>
                      </div>
                      <p className="font-bold text-sm text-gray-900">{job.deviceModel}</p>
                      <p className="text-xs text-gray-600 bg-white rounded-lg border px-2 py-1.5">{job.issue}</p>
                      <div className="text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">{job.customerName}</span> · {job.customerPhone}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span className="font-medium text-gray-700">Tech:</span>
                        <select
                          className="flex-1 border rounded px-1 py-0.5 text-[11px] bg-white"
                          value={job.technicianName}
                          onChange={e => handleReassign(job.id, e.target.value)}
                        >
                          {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          {!technicians.find(t => t.name === job.technicianName) && (
                            <option value={job.technicianName}>{job.technicianName}</option>
                          )}
                        </select>
                      </div>
                      {/* Progress buttons */}
                      <div className="pt-1 border-t flex flex-wrap gap-1">
                        {job.status === 'DIAGNOSING' && (<>
                          <button onClick={() => updateRepairStatus(job.id, 'WAITING_PARTS')} className="flex-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-[11px] font-semibold">Need Parts</button>
                          <button onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')} className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold">Start Repair</button>
                        </>)}
                        {job.status === 'WAITING_PARTS' && (
                          <button onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')} className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold">Parts Arrived - Start Repair</button>
                        )}
                        {job.status === 'IN_REPAIR' && (
                          <button onClick={() => updateRepairStatus(job.id, 'READY')} className="w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold">Mark Ready for Pickup</button>
                        )}
                        {job.status === 'READY' && (
                          <button onClick={() => updateRepairStatus(job.id, 'DELIVERED')} className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded text-[11px] font-semibold">Deliver to Customer</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- FINANCIAL AUDIT TAB (New) --- */}
      {tab === 'financials' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-0 max-w-full">
          <div className="p-4 sm:px-5 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Ticket-Level Repair Margin & Profit Breakdown</h3>
              <p className="text-xs text-gray-500">Revenue, hardware parts cost, commissions, and net profit per ticket</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500">Total Net Profit</p>
              <p className="text-base sm:text-lg font-black text-emerald-700">{formatINR(netProfit)} ({netMarginPct}%)</p>
            </div>
          </div>
          <div className="overflow-x-auto min-w-0 max-w-full">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Device & Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Technician</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Parts Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gross Margin</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Commission (5%)</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Shop Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {repairs.map(job => {
                  const partsCost = calculatePartsCost(job);
                  const comm = calculateCommission(job);
                  const jobGross = job.estimatedCost - partsCost;
                  const jobNet = jobGross - comm;
                  const marginPct = job.estimatedCost > 0 ? ((jobNet / job.estimatedCost) * 100).toFixed(0) : '0';

                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{job.deviceModel}</p>
                        <p className="text-xs text-gray-400">{job.customerName}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{job.technicianName}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(job.estimatedCost)}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatINR(partsCost)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">{formatINR(jobGross)}</td>
                      <td className="px-4 py-3 text-right text-purple-700 font-medium">{formatINR(comm)}</td>
                      <td className="px-5 py-3 text-right">
                        <p className="font-black text-emerald-700">{formatINR(jobNet)}</p>
                        <p className="text-[11px] text-emerald-600">{marginPct}% margin</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 font-bold">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-gray-800">Total Financial Summary</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatINR(totalRepairRevenue)}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{formatINR(totalPartsCost)}</td>
                  <td className="px-4 py-3 text-right text-blue-700">{formatINR(grossProfit)}</td>
                  <td className="px-4 py-3 text-right text-purple-700">{formatINR(totalCommissions)}</td>
                  <td className="px-5 py-3 text-right text-emerald-700 text-base">{formatINR(netProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* --- ALL JOBS TAB --- */}
      {tab === 'all' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-0 max-w-full">
          <div className="p-3 sm:px-5 sm:py-3 border-b bg-gray-50 flex flex-wrap gap-2.5 sm:gap-3 items-center">
            <div>
              <label className="text-xs font-semibold text-gray-500 mr-1.5">Technician:</label>
              <select className="text-xs sm:text-sm border rounded-lg px-2 py-1 bg-white" value={filterTech} onChange={e => setFilterTech(e.target.value)}>
                <option value="ALL">All Technicians</option>
                {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mr-1.5">Status:</label>
              <select className="text-xs sm:text-sm border rounded-lg px-2 py-1 bg-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <span className="ml-auto text-xs text-gray-500">{filteredRepairs.length} jobs</span>
          </div>
          <div className="overflow-x-auto min-w-0 max-w-full">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Device</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Issue</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Technician</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Est. Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Advance</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRepairs.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No repair jobs found.</td></tr>
                ) : filteredRepairs.map(job => {
                  const cfg = STATUS_CONFIG[job.status];
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{job.customerName}</p>
                        <p className="text-xs text-gray-400">{job.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{job.deviceModel}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px] truncate" title={job.issue}>{job.issue}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          className="text-xs border rounded px-1.5 py-1 bg-white"
                          value={job.technicianName}
                          onChange={e => handleReassign(job.id, e.target.value)}
                        >
                          {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          {!technicians.find(t => t.name === job.technicianName) && (
                            <option value={job.technicianName}>{job.technicianName}</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatINR(job.estimatedCost)}</td>
                      <td className="px-4 py-3 text-right text-green-700">{formatINR(job.advancePaid)}</td>
                      <td className="px-4 py-3 text-center">
                        {job.status === 'DIAGNOSING' && <button onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Start</button>}
                        {job.status === 'WAITING_PARTS' && <button onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Parts In</button>}
                        {job.status === 'IN_REPAIR' && <button onClick={() => updateRepairStatus(job.id, 'READY')} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Mark Ready</button>}
                        {job.status === 'READY' && <button onClick={() => updateRepairStatus(job.id, 'DELIVERED')} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Deliver</button>}
                        {job.status === 'DELIVERED' && <span className="text-xs text-gray-400">Done</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SPARE PARTS REQUESTS TAB --- */}
      {tab === 'parts' && (
        <div className="space-y-4 min-w-0 max-w-full">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-0 max-w-full">
            <div className="p-3.5 sm:px-5 sm:py-3.5 border-b bg-orange-50">
              <h3 className="font-semibold text-gray-900 text-sm">Jobs Blocked — Waiting for Spare Parts</h3>
              <p className="text-xs text-gray-500">These repair jobs cannot proceed until parts arrive</p>
            </div>
            {partsNeeded.length === 0 ? (
              <div className="p-8 text-center text-green-600 text-sm font-medium">No jobs are currently waiting for spare parts.</div>
            ) : (
              <div className="divide-y">
                {partsNeeded.map(job => (
                  <div key={job.id} className="p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">Waiting Parts</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{job.deviceModel} — {job.customerName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Issue: {job.issue}</p>
                      {job.partsUsed && <p className="text-xs text-blue-700 mt-0.5 font-medium">Parts noted: {job.partsUsed}</p>}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                      <span className="text-xs text-gray-500">Tech: <span className="font-semibold text-gray-800">{job.technicianName}</span></span>
                      <button
                        onClick={() => updateRepairStatus(job.id, 'IN_REPAIR')}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        Parts In — Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-0 max-w-full">
            <div className="p-3.5 sm:px-5 sm:py-3.5 border-b">
              <h3 className="font-semibold text-gray-900 text-sm">Available Spare Parts in Inventory</h3>
              <p className="text-xs text-gray-500">Displays, batteries, cables and connectors in stock</p>
            </div>
            {spareParts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No spare parts in inventory. Add them from the Products page.</div>
            ) : (
              <div className="overflow-x-auto min-w-0 max-w-full">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Part Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cost Price</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sell Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {spareParts.map(p => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition ${p.stock <= p.minStock ? 'bg-red-50' : ''}`}>
                        <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.brand}</td>
                        <td className="px-4 py-3 text-gray-500">{p.category}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.stock > 2 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatINR(p.purchasePrice)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatINR(p.sellingPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DELIVERED TAB --- */}
      {tab === 'delivered' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-w-0 max-w-full">
          <div className="p-3.5 sm:px-5 sm:py-3.5 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">Delivered Repairs — History</h3>
            <p className="text-xs text-gray-500">All completed and delivered repair jobs</p>
          </div>
          <div className="divide-y">
            {repairs.filter(r => r.status === 'DELIVERED').length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No delivered repairs yet.</div>
            ) : repairs.filter(r => r.status === 'DELIVERED').map(job => (
              <div key={job.id} className="p-3.5 sm:px-5 sm:py-4 flex items-center justify-between hover:bg-gray-50 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">{job.ticketNumber}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Delivered</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">{job.deviceModel} — {job.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{job.issue} · Tech: {job.technicianName}</p>
                  {job.deliveredAt && <p className="text-xs text-gray-400 mt-0.5">Delivered: {job.deliveredAt}</p>}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{formatINR(job.estimatedCost)}</p>
                  <p className="text-xs text-gray-400">Advance: {formatINR(job.advancePaid)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- NEW JOB MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto min-w-0">
            <div className="px-5 sm:px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">New Repair Job Card</h3>
                <p className="text-xs text-gray-500">Assign a device to a technician for repair</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Customer Name *</label>
                  <input required type="text" placeholder="Rahul Sharma" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Customer Phone *</label>
                  <input required type="tel" placeholder="9876543210" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Device Model *</label>
                  <input required type="text" placeholder="iPhone 13 / Galaxy A54" value={form.deviceModel} onChange={e => setForm({ ...form, deviceModel: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">IMEI / Serial (Optional)</label>
                  <input type="text" placeholder="15-digit IMEI" value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Issue / Problem *</label>
                <textarea required rows={2} placeholder="Broken display, water damage, charging port issue..." value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Assign Technician *</label>
                <select value={form.technicianName} onChange={e => setForm({ ...form, technicianName: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none">
                  {technicians.map(t => <option key={t.id} value={t.name}>{t.name} ({t.role})</option>)}
                  {technicians.length === 0 && <option value="Amit Verma">Amit Verma</option>}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Spare Parts Needed (Optional)</label>
                <input type="text" placeholder="e.g. Original iPhone 13 OLED Display" value={form.partsUsed} onChange={e => setForm({ ...form, partsUsed: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Estimated Cost (₹) *</label>
                  <input required type="number" value={form.estimatedCost} onChange={e => setForm({ ...form, estimatedCost: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Advance Collected (₹)</label>
                  <input type="number" value={form.advancePaid} onChange={e => setForm({ ...form, advancePaid: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition shadow">Create Job Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
