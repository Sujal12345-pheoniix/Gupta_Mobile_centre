'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const ROLE_ACCOUNTS = [
  {
    role: 'Admin',
    name: 'Sujal Kumar (Owner)',
    email: 'admin@guptamobile.com',
    password: 'Admin@123',
    color: 'bg-purple-600 hover:bg-purple-700 border-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    icon: '👑',
    desc: 'Full access — products, inventory, payroll, reports, settings',
  },
  {
    role: 'Manager',
    name: 'Neha Rani (Manager)',
    email: 'manager@guptamobile.com',
    password: 'Manager@123',
    color: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    icon: '🧑‍💼',
    desc: 'Inventory, sales, purchases, customers, reports',
  },
  {
    role: 'Staff',
    name: 'Rohan Sharma (Staff)',
    email: 'staff@guptamobile.com',
    password: 'Staff@123',
    color: 'bg-green-600 hover:bg-green-700 border-green-700',
    badge: 'bg-green-100 text-green-700',
    icon: '🧑‍🔧',
    desc: 'POS sales only & stock reduction',
  },
  {
    role: 'Technician',
    name: 'Amit Verma (Technician)',
    email: 'tech@guptamobile.com',
    password: 'Tech@123',
    color: 'bg-orange-600 hover:bg-orange-700 border-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    icon: '🔧',
    desc: 'Repair jobs & parts access',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@guptamobile.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const doLogin = async (emailToUse: string, passwordToUse: string, roleLabel?: string) => {
    setError('');
    setIsLoading(true);
    if (roleLabel) setLoadingRole(roleLabel);
    try {
      const result = await login(emailToUse, passwordToUse);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials or database connection failed');
      }
    } catch {
      setError('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-4 text-2xl font-bold">
            📱
          </div>
          <h1 className="text-2xl font-bold text-white">Gupta Mobile Centre</h1>
          <p className="text-sm text-blue-200/70 mt-1">Retail & Repairing Management System</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Connected to Neon PostgreSQL Cloud DB
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* 1-Click Role Login */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              ⚡ Sign In by Role (Instant 1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_ACCOUNTS.map(r => (
                <button
                  key={r.role}
                  onClick={() => doLogin(r.email, r.password, r.role)}
                  disabled={isLoading}
                  className={`relative text-left p-3 rounded-xl text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${r.color}`}
                >
                  {loadingRole === r.role && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-xs">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{r.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{r.role}</span>
                  </div>
                  <div className="text-xs font-medium opacity-90 truncate">{r.name}</div>
                  <div className="text-[11px] opacity-75 mt-0.5 leading-tight line-clamp-2">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Login Form */}
          <div className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Or Sign In with Email & Password
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50 text-sm"
                  placeholder="admin@guptamobile.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading && !loadingRole ? 'Verifying with Database...' : 'Sign In'}
              </button>
            </form>

            {/* Credentials reference table */}
            <div className="mt-5 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Live Database Accounts:</p>
              <div className="space-y-1.5">
                {ROLE_ACCOUNTS.map(r => (
                  <div key={r.role} className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${r.badge}`}>{r.role}</span>
                    <span className="text-gray-600 font-mono text-[11px]">{r.email} / {r.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-blue-200/50">
          Gupta Mobile Centre • Production-Ready Retail & Repair System
        </div>
      </div>
    </div>
  );
}
