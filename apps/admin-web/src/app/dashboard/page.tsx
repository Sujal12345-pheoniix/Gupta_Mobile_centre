'use client';

import { useAuth } from '@/lib/auth';
import AdminDashboard from './views/AdminDashboard';
import ManagerDashboard from './views/ManagerDashboard';
import StaffDashboard from './views/StaffDashboard';
import TechnicianDashboard from './views/TechnicianDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];

  if (roles.includes('Admin')) {
    return <AdminDashboard user={user} />;
  }

  if (roles.includes('Manager')) {
    return <ManagerDashboard user={user} />;
  }

  if (roles.includes('Technician')) {
    return <TechnicianDashboard user={user} />;
  }

  // Default to Staff Dashboard for Sales/Cashier roles
  return <StaffDashboard user={user} />;
}
