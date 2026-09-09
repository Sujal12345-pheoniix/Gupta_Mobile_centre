'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[]; // which roles can see this item; empty = all
}

const ALL_ROLES = ['Admin', 'Manager', 'Staff', 'Technician'];

const navItems: NavItem[] = [
  { href: '/dashboard',            label: 'Dashboard',  icon: '📊', roles: ALL_ROLES },
  { href: '/dashboard/products',   label: 'Products',   icon: '📦', roles: ALL_ROLES },
  { href: '/dashboard/inventory',  label: 'Inventory',  icon: '📋', roles: ALL_ROLES },
  { href: '/dashboard/sales',      label: 'Sales',      icon: '💰', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/purchases',  label: 'Purchases',  icon: '🛒', roles: ['Admin', 'Manager'] },
  { href: '/dashboard/customers',  label: 'Customers',  icon: '👥', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/employees',  label: 'Employees',  icon: '👤', roles: ['Admin', 'Manager'] },
  { href: '/dashboard/reports',    label: 'Reports',    icon: '📈', roles: ['Admin', 'Manager'] },
  { href: '/dashboard/settings',   label: 'Settings',   icon: '⚙️',  roles: ['Admin'] },
];

const roleColors: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Staff: 'bg-green-100 text-green-700',
  Technician: 'bg-orange-100 text-orange-700',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center p-6 bg-slate-800/80 rounded-2xl shadow-xl border border-slate-700">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-300">
            {isLoading ? 'Verifying session...' : 'Redirecting to sign-in...'}
          </p>
        </div>
      </div>
    );
  }

  const userRole = user?.roles?.[0] || 'Staff';
  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
          <span className="text-2xl">☰</span>
        </button>
        <span className="font-semibold text-gray-900">Gupta Mobile Centre</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-5 py-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📱</span>
              <h1 className="text-lg font-bold text-gray-900">GMC Admin</h1>
            </div>
            <p className="text-xs text-gray-400">{user?.organizationName || 'Gupta Mobile Centre'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-0.5">
              {visibleNav.map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-base">{item.icon}</span>
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[userRole] || 'bg-gray-100 text-gray-500'}`}>
                  {userRole}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left font-medium"
            >
              ← Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
