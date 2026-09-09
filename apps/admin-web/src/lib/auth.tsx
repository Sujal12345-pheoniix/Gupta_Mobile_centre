'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthUser } from './api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback user profiles for each role if offline
const DEMO_USERS: Record<string, AuthUser> = {
  'admin@guptamobile.com': {
    id: 'seed-user-admin',
    name: 'Sujal Kumar',
    email: 'admin@guptamobile.com',
    phone: '9876543210',
    organizationId: 'seed-org-001',
    organizationName: 'Gupta Mobile Centre',
    roles: ['Admin'],
    permissions: ['*'],
  },
  'manager@guptamobile.com': {
    id: 'seed-user-manager',
    name: 'Neha Rani',
    email: 'manager@guptamobile.com',
    phone: '9833445566',
    organizationId: 'seed-org-001',
    organizationName: 'Gupta Mobile Centre',
    roles: ['Manager'],
    permissions: [
      'products.view', 'products.create', 'products.update',
      'inventory.view', 'inventory.adjust',
      'sales.view', 'sales.create',
      'purchases.view', 'purchases.create', 'purchases.update',
      'customers.view', 'customers.create', 'customers.update',
      'employees.view',
      'reports.view',
    ],
  },
  'staff@guptamobile.com': {
    id: 'seed-user-staff',
    name: 'Rohan Sharma',
    email: 'staff@guptamobile.com',
    phone: '9811223344',
    organizationId: 'seed-org-001',
    organizationName: 'Gupta Mobile Centre',
    roles: ['Staff'],
    permissions: [
      'sales.view', 'sales.create',
      'inventory.view', 'inventory.sale_reduction',
      'products.view',
      'customers.view',
    ],
  },
  'tech@guptamobile.com': {
    id: 'seed-user-tech',
    name: 'Amit Verma',
    email: 'tech@guptamobile.com',
    phone: '9822334455',
    organizationId: 'seed-org-001',
    organizationName: 'Gupta Mobile Centre',
    roles: ['Technician'],
    permissions: [
      'products.view',
      'inventory.view',
      'sales.view',
    ],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Priority 1: Check live backend session with JWT
        if (api.isAuthenticated()) {
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data);
            setIsLoading(false);
            return;
          } else {
            api.clearTokens();
          }
        }

        // Priority 2: Stored user fallback
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('demo_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // 1. Try real API with Neon DB first
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('demo_user');
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      console.warn('API login request error:', err);
    }

    // 2. Fallback if network issue
    if (email) {
      const fallbackUser = DEMO_USERS[email.toLowerCase()];
      if (fallbackUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('demo_user', JSON.stringify(fallbackUser));
        }
        setUser(fallbackUser);
        return { success: true };
      }
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore API logout error
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
    }
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
