'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem, StockMovementItem, SaleRecord, CustomerRecord, EmployeeRecord, PurchaseRecord, SupplierRecord } from './mockData';
import { api } from './api';

export interface RepairJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei?: string;
  issue: string;
  estimatedCost: number;
  advancePaid: number;
  status: 'DIAGNOSING' | 'WAITING_PARTS' | 'IN_REPAIR' | 'READY' | 'DELIVERED';
  technicianName: string;
  partsUsed?: string;
  createdAt: string;
  deliveredAt?: string;
}

interface StoreContextType {
  // Products
  products: ProductItem[];
  addProduct: (product: Omit<ProductItem, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;

  // Inventory
  stockMovements: StockMovementItem[];
  adjustStock: (sku: string, quantity: number, type: StockMovementItem['type'], reason: string, actor: string) => Promise<boolean>;

  // Customers
  customers: CustomerRecord[];
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'outstandingBalance' | 'lastVisit'>) => Promise<CustomerRecord>;
  updateCustomer: (id: string, customer: Partial<CustomerRecord>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Employees
  employees: EmployeeRecord[];
  addEmployee: (employee: Omit<EmployeeRecord, 'id' | 'totalSalesMonth'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<EmployeeRecord>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  changeEmployeeRole: (id: string, role: EmployeeRecord['role']) => Promise<void>;
  markAttendance: (id: string, status: EmployeeRecord['todayAttendance']) => Promise<void>;

  // Sales
  sales: SaleRecord[];
  recordSale: (sale: Omit<SaleRecord, 'id' | 'invoiceNumber' | 'date'>, cartItems: { product: ProductItem; qty: number }[]) => Promise<SaleRecord>;
  deleteSale: (id: string) => Promise<void>;

  // Purchases & Suppliers
  purchases: PurchaseRecord[];
  suppliers: SupplierRecord[];
  addSupplier: (supplier: Omit<SupplierRecord, 'id' | 'payable'>) => Promise<SupplierRecord>;
  addPurchase: (purchase: { supplierName: string; supplierId?: string; total: number; paid: number; itemsCount: number }) => Promise<PurchaseRecord>;
  markPurchaseReceived: (id: string) => Promise<void>;

  // Repairs
  repairs: RepairJob[];
  addRepairJob: (job: Omit<RepairJob, 'id' | 'ticketNumber' | 'createdAt'>) => RepairJob;
  updateRepairStatus: (id: string, status: RepairJob['status'], notes?: string) => void;

  // Sync & Status
  isDbConnected: boolean;
  refreshFromDb: () => Promise<void>;
  resetToDefaultData: () => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
}

export interface StoreSettings {
  name: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  timezone: string;
  invoicePrefix: string;
}

const STORAGE_KEY = 'gupta_mobile_store_v2';

// Clean initial data for Gupta Mobile Centre (No dummy data - PostgreSQL DB is single source of truth)
const DEFAULT_PRODUCTS: ProductItem[] = [];

const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  { id: 'emp-1', code: 'EMP001', name: 'Sujal Kumar', role: 'Admin', phone: '9876543210', baseSalary: 65000, commissionRate: 2.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-2', code: 'EMP002', name: 'Neha Rani', role: 'Manager', phone: '9833445566', baseSalary: 35000, commissionRate: 1.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-3', code: 'EMP003', name: 'Rohan Sharma', role: 'Staff', phone: '9811223344', baseSalary: 22000, commissionRate: 1.5, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-4', code: 'EMP004', name: 'Amit Verma', role: 'Technician', phone: '9822334455', baseSalary: 28000, commissionRate: 5.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' }
];

const DEFAULT_CUSTOMERS: CustomerRecord[] = [];
const DEFAULT_REPAIRS: RepairJob[] = [];
const DEFAULT_SALES: SaleRecord[] = [];
const DEFAULT_MOVEMENTS: StockMovementItem[] = [];

const DEFAULT_SETTINGS: StoreSettings = {
  name: 'Gupta Mobile Centre',
  gstin: '06ABCDE1234F1Z5',
  phone: '9876543210',
  email: 'gupta.mobile@gmail.com',
  address: 'Shop No. 14, Main Market, Gurgaon - 122001, Haryana',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  invoicePrefix: 'GMC',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [stockMovements, setStockMovements] = useState<StockMovementItem[]>(DEFAULT_MOVEMENTS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEFAULT_CUSTOMERS);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(DEFAULT_EMPLOYEES);
  const [sales, setSales] = useState<SaleRecord[]>(DEFAULT_SALES);
  const [repairs, setRepairs] = useState<RepairJob[]>(DEFAULT_REPAIRS);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Sync from live Neon PostgreSQL Database
  const refreshFromDb = async () => {
    try {
      const res = await api.getStoreData();
      if (res.success && res.data) {
        setIsDbConnected(true);
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        }
        if (Array.isArray(res.data.customers)) {
          setCustomers(res.data.customers);
        }
        if (Array.isArray(res.data.employees)) {
          setEmployees(res.data.employees);
        }
        if (Array.isArray(res.data.stockMovements)) {
          setStockMovements(res.data.stockMovements);
        }
        if (Array.isArray(res.data.sales)) {
          setSales(res.data.sales);
        }
        if (Array.isArray(res.data.repairs)) {
          setRepairs(res.data.repairs);
        }
        if (Array.isArray(res.data.suppliers)) {
          setSuppliers(res.data.suppliers);
        }
        if (Array.isArray(res.data.purchases)) {
          setPurchases(res.data.purchases);
        }
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
      }
    } catch (err) {
      console.warn('Could not sync with live PostgreSQL database, using cached local store:', err);
    }
  };

  // Initial load: LocalStorage first, then background live Database sync
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Filter out any stale dummy sales (GMC-1001, GMC-1002) and legacy dummy repairs
        const cleanSales = (data.sales || []).filter(
          (s: any) => s.id !== 's-1' && s.id !== 's-2' && s.invoiceNumber !== 'GMC-1001' && s.invoiceNumber !== 'GMC-1002'
        );
        const cleanRepairs = (data.repairs || []).filter(
          (r: any) => !r.ticketNumber?.startsWith('GMC-REP-10')
        );
        const cleanMovements = (data.stockMovements || []).filter(
          (m: any) => !m.reason?.includes('GMC-1001') && !m.reason?.includes('GMC-1002')
        );

        if (data.products?.length) setProducts(data.products);
        setStockMovements(cleanMovements);
        if (data.customers?.length) setCustomers(data.customers);
        if (data.employees?.length) setEmployees(data.employees);
        setSales(cleanSales);
        setRepairs(cleanRepairs);
      }
    } catch (e) {
      console.error('Failed to load store data from localStorage', e);
    } finally {
      setIsLoaded(true);
      // Fetch live data from PostgreSQL immediately
      refreshFromDb();
    }
  }, []);

  // Multi-device real-time sync: poll database every 8 seconds so all devices (mobile, laptop, staff, technician) see identical data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFromDb();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage as resilient offline cache
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ products, stockMovements, customers, employees, sales, repairs })
      );
    } catch (e) {
      console.error('Failed to persist store data to localStorage', e);
    }
  }, [products, stockMovements, customers, employees, sales, repairs, isLoaded]);

  // Product Actions (Saving to Neon PostgreSQL)
  const addProduct = async (item: Omit<ProductItem, 'id'>) => {
    const tempId = `p-${Date.now()}`;
    const newProduct: ProductItem = { ...item, id: tempId };
    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.stock > 0) {
      setStockMovements(prev => [
        {
          id: `sm-${Date.now()}`,
          date: new Date().toLocaleString('en-IN'),
          sku: newProduct.sku,
          productName: newProduct.name,
          type: 'PURCHASE_RECEIPT',
          quantity: newProduct.stock,
          reason: 'Initial Product Stock Addition',
          actor: 'Manager/Admin'
        },
        ...prev
      ]);
    }

    try {
      const res = await api.createProduct(item);
      if (res.success && res.data) {
        setIsDbConnected(true);
        // Replace temp ID with real DB ID
        setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: res.data.id } : p));
      }
    } catch (err) {
      console.warn('Database save product failed, cached locally:', err);
    }
  };

  const updateProduct = async (id: string, updated: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    try {
      await api.updateProduct(id, updated);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database update product failed, cached locally:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.deleteProduct(id);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database delete product failed, cached locally:', err);
    }
  };

  const archiveProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    const newStatus = product?.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    try {
      await api.updateProduct(id, { status: newStatus });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database archive product failed, cached locally:', err);
    }
  };

  // Inventory Adjustment (Saving to Neon PostgreSQL)
  const adjustStock = async (sku: string, quantity: number, type: StockMovementItem['type'], reason: string, actor: string): Promise<boolean> => {
    const product = products.find(p => p.sku === sku);
    if (!product) return false;

    const delta = type === 'SALE' || type === 'DAMAGE' ? -Math.abs(quantity) : Math.abs(quantity);
    if (product.stock + delta < 0) return false;

    setProducts(prev => prev.map(p => p.sku === sku ? { ...p, stock: p.stock + delta } : p));
    setStockMovements(prev => [
      {
        id: `sm-${Date.now()}`,
        date: new Date().toLocaleString('en-IN'),
        sku,
        productName: product.name,
        type,
        quantity: delta,
        reason: reason || `Manual Stock ${type}`,
        actor: actor || 'Admin'
      },
      ...prev
    ]);

    try {
      await api.adjustInventory({ sku, quantity: delta, type, reason, actor });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database adjust stock failed, cached locally:', err);
    }

    return true;
  };

  // Customers (Saving to Neon PostgreSQL)
  const addCustomer = async (item: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'outstandingBalance' | 'lastVisit'>): Promise<CustomerRecord> => {
    const tempId = `c-${Date.now()}`;
    const newCustomer: CustomerRecord = {
      ...item,
      id: tempId,
      totalPurchases: 0,
      outstandingBalance: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);

    try {
      const res = await api.createCustomer(item);
      if (res.success && res.data) {
        setIsDbConnected(true);
        const savedCustomer = { ...newCustomer, id: res.data.id };
        setCustomers(prev => prev.map(c => c.id === tempId ? savedCustomer : c));
        return savedCustomer;
      }
    } catch (err) {
      console.warn('Database save customer failed, cached locally:', err);
    }

    return newCustomer;
  };

  const updateCustomer = async (id: string, updated: Partial<CustomerRecord>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    try {
      await api.updateCustomer(id, updated);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database update customer failed, cached locally:', err);
    }
  };

  const deleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    try {
      await api.deleteCustomer(id);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database delete customer failed, cached locally:', err);
    }
  };

  // Employees (Saving to Neon PostgreSQL)
  const addEmployee = async (item: Omit<EmployeeRecord, 'id' | 'totalSalesMonth'>) => {
    const tempId = `emp-${Date.now()}`;
    const newEmp: EmployeeRecord = {
      ...item,
      id: tempId,
      totalSalesMonth: 0
    };
    setEmployees(prev => [...prev, newEmp]);

    try {
      const res = await api.createEmployee(item);
      if (res.success && res.data) {
        setIsDbConnected(true);
        setEmployees(prev => prev.map(e => e.id === tempId ? { ...e, id: res.data.id } : e));
      }
    } catch (err) {
      console.warn('Database save employee failed, cached locally:', err);
    }
  };

  const updateEmployee = async (id: string, updated: Partial<EmployeeRecord>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    try {
      await api.updateEmployee(id, updated);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database update employee failed, cached locally:', err);
    }
  };

  const removeEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    try {
      await api.deleteEmployee(id);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database delete employee failed, cached locally:', err);
    }
  };

  const changeEmployeeRole = async (id: string, role: EmployeeRecord['role']) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, role } : e));
    try {
      await api.updateEmployee(id, { role });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database update role failed, cached locally:', err);
    }
  };

  const markAttendance = async (id: string, status: EmployeeRecord['todayAttendance']) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, todayAttendance: status } : e));
    try {
      await api.markAttendance({ employeeId: id, status });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database mark attendance failed, cached locally:', err);
    }
  };

  // Sales (POS) (Saving to Neon PostgreSQL)
  const recordSale = async (saleData: Omit<SaleRecord, 'id' | 'invoiceNumber' | 'date'>, cartItems: { product: ProductItem; qty: number }[]): Promise<SaleRecord> => {
    const invoiceNumber = `GMC-${1000 + sales.length + 1}`;
    const cogs = cartItems.reduce((sum, c) => sum + c.product.purchasePrice * c.qty, 0);
    const newSale: SaleRecord = {
      ...saleData,
      id: `s-${Date.now()}`,
      invoiceNumber,
      date: new Date().toLocaleString('en-IN'),
      cogs,
      items: cartItems.map(c => ({
        sku: c.product.sku,
        name: c.product.name,
        qty: c.qty,
        unitPrice: c.product.sellingPrice,
        unitCost: c.product.purchasePrice
      }))
    };

    setSales(prev => [newSale, ...prev]);

    // Decrement stock in UI
    const movementsToAdd: StockMovementItem[] = [];
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const inCart = cartItems.find(c => c.product.id === prod.id);
        if (inCart) {
          movementsToAdd.push({
            id: `sm-${Date.now()}-${prod.sku}`,
            date: new Date().toLocaleString('en-IN'),
            sku: prod.sku,
            productName: prod.name,
            type: 'SALE',
            quantity: -inCart.qty,
            reason: `Invoice ${invoiceNumber}`,
            actor: saleData.staffName || 'Staff'
          });
          return { ...prod, stock: Math.max(0, prod.stock - inCart.qty) };
        }
        return prod;
      });
    });

    setStockMovements(prev => [...movementsToAdd, ...prev]);

    // Send sale transaction to PostgreSQL
    try {
      const apiPayload = {
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        tax: saleData.tax,
        total: saleData.total,
        paidAmount: saleData.paidAmount,
        paymentMethod: saleData.paymentMethod,
        staffName: saleData.staffName,
        items: cartItems.map(c => ({
          sku: c.product.sku,
          qty: c.qty,
          unitPrice: c.product.sellingPrice
        }))
      };
      await api.recordSale(apiPayload);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database record sale failed, cached locally:', err);
    }

    return newSale;
  };

  const deleteSale = async (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    setSales(prev => prev.filter(s => s.id !== id));

    // If sale had items or related stock movements, restore stock
    if (saleToDelete) {
      if (saleToDelete.items && saleToDelete.items.length > 0) {
        setProducts(prevProducts => {
          return prevProducts.map(prod => {
            const item = saleToDelete.items?.find(i => i.sku === prod.sku);
            if (item) {
              return { ...prod, stock: prod.stock + item.qty };
            }
            return prod;
          });
        });
      } else {
        // Fallback: search stock movements for this invoice number
        const related = stockMovements.filter(m => m.reason?.includes(saleToDelete.invoiceNumber) && m.type === 'SALE');
        if (related.length > 0) {
          setProducts(prevProducts => {
            return prevProducts.map(prod => {
              const mv = related.find(m => m.sku === prod.sku);
              if (mv) {
                return { ...prod, stock: prod.stock + Math.abs(mv.quantity) };
              }
              return prod;
            });
          });
        }
      }

      // Add a customer return stock movement for transparency
      setStockMovements(prev => [
        {
          id: `sm-${Date.now()}-return`,
          date: new Date().toLocaleString('en-IN'),
          sku: 'RESTORE',
          productName: `Reversal of ${saleToDelete.invoiceNumber}`,
          type: 'CUSTOMER_RETURN',
          quantity: saleToDelete.itemsCount,
          reason: `Invoice ${saleToDelete.invoiceNumber} deleted by Admin`,
          actor: 'Admin'
        },
        ...prev
      ]);
    }

    try {
      await api.deleteSale(id);
      setIsDbConnected(true);
      // Re-sync after 1.5s
      setTimeout(() => {
        refreshFromDb();
      }, 1500);
    } catch (err) {
      console.warn('Database delete sale failed, cached locally:', err);
    }
  };

  // Repairs (Persisted to Neon PostgreSQL for multi-device cross-role sync)
  const addRepairJob = (jobData: Omit<RepairJob, 'id' | 'ticketNumber' | 'createdAt'>): RepairJob => {
    const ticketNumber = `GMC-REP-${100 + repairs.length + 1}`;
    const newJob: RepairJob = {
      ...jobData,
      id: `rep-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toLocaleString('en-IN')
    };
    setRepairs(prev => [newJob, ...prev]);

    // Asynchronously persist to Neon PostgreSQL
    api.createRepairJob(jobData).then((res) => {
      if (res.success && res.data) {
        setIsDbConnected(true);
        setRepairs(prev => prev.map(r => r.id === newJob.id ? res.data : r));
        refreshFromDb();
      }
    }).catch(err => {
      console.warn('Failed to save repair job to PostgreSQL:', err);
    });

    return newJob;
  };

  const updateRepairStatus = (id: string, status: RepairJob['status'], notes?: string) => {
    setRepairs(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          partsUsed: notes ? (r.partsUsed ? `${r.partsUsed}; ${notes}` : notes) : r.partsUsed,
          deliveredAt: status === 'DELIVERED' ? new Date().toLocaleString('en-IN') : r.deliveredAt
        };
      }
      return r;
    }));

    // Asynchronously persist status change to Neon PostgreSQL
    api.updateRepairJob(id, { status, notes }).then((res) => {
      if (res.success) {
        setIsDbConnected(true);
        refreshFromDb();
      }
    }).catch(err => {
      console.warn('Failed to update repair job status in PostgreSQL:', err);
    });
  };

  const resetToDefaultData = () => {
    setProducts([]);
    setStockMovements([]);
    setCustomers([]);
    setEmployees(DEFAULT_EMPLOYEES);
    setSales([]);
    setRepairs([]);
    setPurchases([]);
    setSuppliers([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    refreshFromDb();
  };

  // Purchases & Suppliers (saving to Neon PostgreSQL)
  const addSupplier = async (item: Omit<SupplierRecord, 'id' | 'payable'>): Promise<SupplierRecord> => {
    const tempId = `sup-${Date.now()}`;
    const newSupplier: SupplierRecord = { ...item, id: tempId, payable: 0 };
    setSuppliers(prev => [...prev, newSupplier]);

    try {
      const res = await api.createSupplier(item);
      if (res.success && res.data) {
        setIsDbConnected(true);
        const saved: SupplierRecord = {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone || '',
          gstin: res.data.gstin || '',
          city: item.city || '',
          payable: 0,
        };
        setSuppliers(prev => prev.map(s => s.id === tempId ? saved : s));
        return saved;
      }
    } catch (err) {
      console.warn('Database save supplier failed, cached locally:', err);
    }
    return newSupplier;
  };

  const addPurchase = async (item: { supplierName: string; supplierId?: string; total: number; paid: number; itemsCount: number }): Promise<PurchaseRecord> => {
    const tempId = `po-${Date.now()}`;
    const newPO: PurchaseRecord = {
      id: tempId,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierName: item.supplierName,
      date: new Date().toISOString().split('T')[0],
      total: item.total,
      paid: item.paid,
      due: Math.max(0, item.total - item.paid),
      status: 'ORDERED',
      itemsCount: item.itemsCount,
    };
    setPurchases(prev => [newPO, ...prev]);

    if (item.supplierId) {
      try {
        const res = await api.createPurchase({
          supplierId: item.supplierId,
          total: item.total,
          paid: item.paid,
          itemsCount: item.itemsCount,
        });
        if (res.success && res.data) {
          setIsDbConnected(true);
          const saved: PurchaseRecord = {
            id: res.data.id,
            poNumber: res.data.invoiceNumber || newPO.poNumber,
            supplierName: item.supplierName,
            date: newPO.date,
            total: item.total,
            paid: item.paid,
            due: Math.max(0, item.total - item.paid),
            status: 'ORDERED',
            itemsCount: item.itemsCount,
          };
          setPurchases(prev => prev.map(p => p.id === tempId ? saved : p));
          return saved;
        }
      } catch (err) {
        console.warn('Database save purchase failed, cached locally:', err);
      }
    }
    return newPO;
  };

  const markPurchaseReceived = async (id: string): Promise<void> => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'RECEIVED' } : p));
    try {
      await api.markPurchaseReceived(id);
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Database mark purchase received failed, cached locally:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      const res = await api.updateSettings(newSettings);
      if (res.success && res.data) {
        setSettings(res.data);
        setIsDbConnected(true);
        return true;
      }
    } catch (err) {
      console.warn('Database update settings failed, updated locally:', err);
    }
    return false;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        archiveProduct,
        stockMovements,
        adjustStock,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        employees,
        addEmployee,
        updateEmployee,
        removeEmployee,
        changeEmployeeRole,
        markAttendance,
        sales,
        recordSale,
        deleteSale,
        purchases,
        suppliers,
        addSupplier,
        addPurchase,
        markPurchaseReceived,
        repairs,
        addRepairJob,
        updateRepairStatus,
        isDbConnected,
        refreshFromDb,
        resetToDefaultData,
        settings,
        updateSettings
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
