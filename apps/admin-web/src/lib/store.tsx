'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem, StockMovementItem, SaleRecord, CustomerRecord, EmployeeRecord, PurchaseRecord } from './mockData';

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
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateProduct: (id: string, product: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  archiveProduct: (id: string) => void;

  // Inventory
  stockMovements: StockMovementItem[];
  adjustStock: (sku: string, quantity: number, type: StockMovementItem['type'], reason: string, actor: string) => boolean;

  // Customers
  customers: CustomerRecord[];
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'outstandingBalance' | 'lastVisit'>) => CustomerRecord;
  updateCustomer: (id: string, customer: Partial<CustomerRecord>) => void;
  deleteCustomer: (id: string) => void;

  // Employees
  employees: EmployeeRecord[];
  addEmployee: (employee: Omit<EmployeeRecord, 'id' | 'totalSalesMonth'>) => void;
  updateEmployee: (id: string, employee: Partial<EmployeeRecord>) => void;
  removeEmployee: (id: string) => void;
  changeEmployeeRole: (id: string, role: EmployeeRecord['role']) => void;
  markAttendance: (id: string, status: EmployeeRecord['todayAttendance']) => void;

  // Sales
  sales: SaleRecord[];
  recordSale: (sale: Omit<SaleRecord, 'id' | 'invoiceNumber' | 'date'>, cartItems: { product: ProductItem; qty: number }[]) => SaleRecord;

  // Repairs
  repairs: RepairJob[];
  addRepairJob: (job: Omit<RepairJob, 'id' | 'ticketNumber' | 'createdAt'>) => RepairJob;
  updateRepairStatus: (id: string, status: RepairJob['status'], notes?: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'gupta_mobile_store_v2';

// Realistic pre-seeded store catalog for Gupta Mobile Centre
const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: 'p-1', name: 'Apple iPhone 15 (128GB - Black)', category: 'Smartphones', brand: 'Apple', sku: 'IPH15-128-BLK', barcode: '194253408215', purchasePrice: 62000, sellingPrice: 69900, mrp: 79900, stock: 8, minStock: 3, taxRate: 18, trackingMode: 'SERIAL', status: 'ACTIVE' },
  { id: 'p-2', name: 'Samsung Galaxy S24 (256GB - Onyx Black)', category: 'Smartphones', brand: 'Samsung', sku: 'SAM-S24-256', barcode: '880609501234', purchasePrice: 66000, sellingPrice: 74999, mrp: 84999, stock: 5, minStock: 2, taxRate: 18, trackingMode: 'SERIAL', status: 'ACTIVE' },
  { id: 'p-3', name: 'OnePlus 12R (16GB RAM / 256GB)', category: 'Smartphones', brand: 'OnePlus', sku: 'OP-12R-256', barcode: '692181562301', purchasePrice: 38000, sellingPrice: 42999, mrp: 45999, stock: 6, minStock: 2, taxRate: 18, trackingMode: 'SERIAL', status: 'ACTIVE' },
  { id: 'p-4', name: 'Redmi Note 13 Pro 5G (128GB)', category: 'Smartphones', brand: 'Generic', sku: 'RED-N13P-128', barcode: '890123456789', purchasePrice: 21000, sellingPrice: 24999, mrp: 27999, stock: 12, minStock: 4, taxRate: 18, trackingMode: 'SERIAL', status: 'ACTIVE' },
  { id: 'p-5', name: 'Apple 20W USB-C Fast Power Adapter', category: 'Chargers', brand: 'Apple', sku: 'APP-20W-ADPT', barcode: '194252157008', purchasePrice: 1350, sellingPrice: 1900, mrp: 1900, stock: 18, minStock: 5, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' },
  { id: 'p-6', name: 'Boat Airdopes 141 ANC TWS Earbuds', category: 'Accessories', brand: 'Boat', sku: 'BOAT-AD-141', barcode: '890760511223', purchasePrice: 1100, sellingPrice: 1699, mrp: 4490, stock: 24, minStock: 6, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' },
  { id: 'p-7', name: '9D Curved Gorilla Tempered Glass (iPhone 15)', category: 'Screen Guards', brand: 'Generic', sku: 'TG-IPH15-9D', barcode: '890111222333', purchasePrice: 60, sellingPrice: 299, mrp: 999, stock: 45, minStock: 10, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' },
  { id: 'p-8', name: 'Type-C to Type-C 65W Braided Fast Cable', category: 'Cables', brand: 'Generic', sku: 'CAB-CC-65W', barcode: '890444555666', purchasePrice: 90, sellingPrice: 350, mrp: 799, stock: 30, minStock: 8, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' },
  { id: 'p-9', name: 'Original iPhone 13 OLED Display Assembly', category: 'Spare Parts', brand: 'Apple', sku: 'SP-IP13-DISP', barcode: '890777888999', purchasePrice: 4800, sellingPrice: 7500, mrp: 9500, stock: 4, minStock: 2, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' },
  { id: 'p-10', name: 'Samsung Galaxy A54 Original 5000mAh Battery', category: 'Spare Parts', brand: 'Samsung', sku: 'SP-SAM-A54-BAT', barcode: '890999000111', purchasePrice: 1200, sellingPrice: 2200, mrp: 2800, stock: 6, minStock: 2, taxRate: 18, trackingMode: 'NONE', status: 'ACTIVE' }
];

const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  { id: 'emp-1', code: 'EMP001', name: 'Sujal Kumar', role: 'Admin', phone: '9876543210', baseSalary: 65000, commissionRate: 2.0, totalSalesMonth: 124000, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-2', code: 'EMP002', name: 'Neha Rani', role: 'Manager', phone: '9833445566', baseSalary: 35000, commissionRate: 1.0, totalSalesMonth: 86000, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-3', code: 'EMP003', name: 'Rohan Sharma', role: 'Staff', phone: '9811223344', baseSalary: 22000, commissionRate: 1.5, totalSalesMonth: 142000, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-4', code: 'EMP004', name: 'Amit Verma', role: 'Technician', phone: '9822334455', baseSalary: 28000, commissionRate: 5.0, totalSalesMonth: 38000, status: 'ACTIVE', todayAttendance: 'PRESENT' }
];

const DEFAULT_CUSTOMERS: CustomerRecord[] = [
  { id: 'c-1', name: 'Rahul Sharma', phone: '9876501234', email: 'rahul.s@gmail.com', address: 'Sector 14, Gurgaon', totalPurchases: 72400, outstandingBalance: 0, lastVisit: '2026-09-08' },
  { id: 'c-2', name: 'Priya Singh', phone: '9812345678', email: 'priya.singh@yahoo.com', address: 'DLF Phase 3, Gurgaon', totalPurchases: 3200, outstandingBalance: 450, lastVisit: '2026-09-09' },
  { id: 'c-3', name: 'Vikram Malhotra', phone: '9899887766', email: 'vikram.m@gmail.com', address: 'Sohna Road, Gurgaon', totalPurchases: 44999, outstandingBalance: 0, lastVisit: '2026-09-10' }
];

const DEFAULT_REPAIRS: RepairJob[] = [
  { id: 'rep-1', ticketNumber: 'GMC-REP-101', customerName: 'Rahul Sharma', customerPhone: '9876501234', deviceModel: 'iPhone 13', issue: 'Shattered OLED Screen Replacement', estimatedCost: 7500, advancePaid: 2000, status: 'READY', technicianName: 'Amit Verma', partsUsed: 'Original iPhone 13 OLED Display', createdAt: '2026-09-09 11:30 AM' },
  { id: 'rep-2', ticketNumber: 'GMC-REP-102', customerName: 'Sunita Devi', customerPhone: '9822114433', deviceModel: 'Samsung Galaxy A54', issue: 'Battery drains within 2 hours', estimatedCost: 2200, advancePaid: 500, status: 'IN_REPAIR', technicianName: 'Amit Verma', partsUsed: 'Samsung A54 5000mAh Battery', createdAt: '2026-09-10 10:15 AM' },
  { id: 'rep-3', ticketNumber: 'GMC-REP-103', customerName: 'Deepak Kumar', customerPhone: '9811447722', deviceModel: 'OnePlus Nord CE3', issue: 'Loose charging port / No fast charge', estimatedCost: 1200, advancePaid: 0, status: 'WAITING_PARTS', technicianName: 'Amit Verma', partsUsed: 'OnePlus Sub-board Port', createdAt: '2026-09-10 11:45 AM' },
  { id: 'rep-4', ticketNumber: 'GMC-REP-104', customerName: 'Ankit Verma', customerPhone: '9877112233', deviceModel: 'Vivo V29', issue: 'Water damage, camera lens foggy', estimatedCost: 3500, advancePaid: 1000, status: 'DIAGNOSING', technicianName: 'Amit Verma', createdAt: '2026-09-10 01:20 PM' }
];

const DEFAULT_SALES: SaleRecord[] = [
  { id: 's-1', invoiceNumber: 'GMC-1001', date: '2026-09-09 02:45 PM', customerName: 'Vikram Malhotra', customerPhone: '9899887766', itemsCount: 2, subtotal: 44999, discount: 500, tax: 6864, total: 44499, paidAmount: 44499, paymentMethod: 'UPI', status: 'COMPLETED', staffName: 'Rohan Sharma' },
  { id: 's-2', invoiceNumber: 'GMC-1002', date: '2026-09-10 11:15 AM', customerName: 'Priya Singh', customerPhone: '9812345678', itemsCount: 3, subtotal: 3950, discount: 150, tax: 602, total: 3800, paidAmount: 3350, paymentMethod: 'CASH', status: 'PAID', staffName: 'Rohan Sharma' }
];

const DEFAULT_MOVEMENTS: StockMovementItem[] = [
  { id: 'sm-1', date: '2026-09-09 02:45 PM', sku: 'OP-12R-256', productName: 'OnePlus 12R (16GB RAM / 256GB)', type: 'SALE', quantity: -1, reason: 'Invoice GMC-1001', actor: 'Rohan Sharma' },
  { id: 'sm-2', date: '2026-09-10 11:15 AM', sku: 'APP-20W-ADPT', productName: 'Apple 20W USB-C Fast Power Adapter', type: 'SALE', quantity: -1, reason: 'Invoice GMC-1002', actor: 'Rohan Sharma' },
  { id: 'sm-3', date: '2026-09-10 11:15 AM', sku: 'CAB-CC-65W', productName: 'Type-C to Type-C 65W Braided Fast Cable', type: 'SALE', quantity: -2, reason: 'Invoice GMC-1002', actor: 'Rohan Sharma' }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [stockMovements, setStockMovements] = useState<StockMovementItem[]>(DEFAULT_MOVEMENTS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEFAULT_CUSTOMERS);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(DEFAULT_EMPLOYEES);
  const [sales, setSales] = useState<SaleRecord[]>(DEFAULT_SALES);
  const [repairs, setRepairs] = useState<RepairJob[]>(DEFAULT_REPAIRS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.products?.length) setProducts(data.products);
        if (data.stockMovements?.length) setStockMovements(data.stockMovements);
        if (data.customers?.length) setCustomers(data.customers);
        if (data.employees?.length) setEmployees(data.employees);
        if (data.sales?.length) setSales(data.sales);
        if (data.repairs?.length) setRepairs(data.repairs);
      }
    } catch (e) {
      console.error('Failed to load store data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes
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

  // Product Actions
  const addProduct = (item: Omit<ProductItem, 'id'>) => {
    const newProduct: ProductItem = { ...item, id: `p-${Date.now()}` };
    setProducts(prev => [newProduct, ...prev]);
    // Log initial stock movement if > 0
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
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const archiveProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' } : p));
  };

  // Inventory Adjustment
  const adjustStock = (sku: string, quantity: number, type: StockMovementItem['type'], reason: string, actor: string): boolean => {
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
    return true;
  };

  // Customers
  const addCustomer = (item: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'outstandingBalance' | 'lastVisit'>): CustomerRecord => {
    const newCustomer: CustomerRecord = {
      ...item,
      id: `c-${Date.now()}`,
      totalPurchases: 0,
      outstandingBalance: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updated: Partial<CustomerRecord>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Employees
  const addEmployee = (item: Omit<EmployeeRecord, 'id' | 'totalSalesMonth'>) => {
    const newEmp: EmployeeRecord = {
      ...item,
      id: `emp-${Date.now()}`,
      totalSalesMonth: 0
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, updated: Partial<EmployeeRecord>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const changeEmployeeRole = (id: string, role: EmployeeRecord['role']) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, role } : e));
  };

  const markAttendance = (id: string, status: EmployeeRecord['todayAttendance']) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, todayAttendance: status } : e));
  };

  // Sales (POS)
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'invoiceNumber' | 'date'>, cartItems: { product: ProductItem; qty: number }[]): SaleRecord => {
    const invoiceNumber = `GMC-${1000 + sales.length + 1}`;
    const newSale: SaleRecord = {
      ...saleData,
      id: `s-${Date.now()}`,
      invoiceNumber,
      date: new Date().toLocaleString('en-IN')
    };

    // 1. Save sale
    setSales(prev => [newSale, ...prev]);

    // 2. Reduce stock & record movements
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

    // 3. Update customer purchase total
    if (saleData.customerPhone) {
      setCustomers(prev => {
        const found = prev.find(c => c.phone === saleData.customerPhone);
        if (found) {
          return prev.map(c => c.id === found.id ? {
            ...c,
            totalPurchases: c.totalPurchases + saleData.total,
            lastVisit: new Date().toISOString().split('T')[0]
          } : c);
        }
        return prev;
      });
    }

    // 4. Credit sales to employee
    if (saleData.staffName) {
      setEmployees(prev => prev.map(e => {
        if (e.name.toLowerCase().includes(saleData.staffName.toLowerCase()) || saleData.staffName.toLowerCase().includes(e.name.toLowerCase())) {
          return { ...e, totalSalesMonth: e.totalSalesMonth + saleData.total };
        }
        return e;
      }));
    }

    return newSale;
  };

  // Repairs
  const addRepairJob = (jobData: Omit<RepairJob, 'id' | 'ticketNumber' | 'createdAt'>): RepairJob => {
    const ticketNumber = `GMC-REP-${100 + repairs.length + 1}`;
    const newJob: RepairJob = {
      ...jobData,
      id: `rep-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toLocaleString('en-IN')
    };
    setRepairs(prev => [newJob, ...prev]);
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
  };

  const resetToDefaultData = () => {
    setProducts(DEFAULT_PRODUCTS);
    setStockMovements(DEFAULT_MOVEMENTS);
    setCustomers(DEFAULT_CUSTOMERS);
    setEmployees(DEFAULT_EMPLOYEES);
    setSales(DEFAULT_SALES);
    setRepairs(DEFAULT_REPAIRS);
    localStorage.removeItem(STORAGE_KEY);
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
        repairs,
        addRepairJob,
        updateRepairStatus,
        resetToDefaultData
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
