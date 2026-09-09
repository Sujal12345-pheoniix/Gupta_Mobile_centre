export interface ProductItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  minStock: number;
  taxRate: number;
  trackingMode: 'NONE' | 'SERIAL' | 'BATCH';
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface StockMovementItem {
  id: string;
  date: string;
  sku: string;
  productName: string;
  type: 'PURCHASE_RECEIPT' | 'SALE' | 'CUSTOMER_RETURN' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  reason?: string;
  actor: string;
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'SPLIT';
  status: 'COMPLETED' | 'PAID' | 'RETURNED';
  staffName: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  gstin: string;
  city: string;
  payable: number;
}

export interface PurchaseRecord {
  id: string;
  poNumber: string;
  supplierName: string;
  date: string;
  total: number;
  paid: number;
  due: number;
  status: 'RECEIVED' | 'ORDERED' | 'DRAFT';
  itemsCount: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  outstandingBalance: number;
  lastVisit: string;
}

export interface EmployeeRecord {
  id: string;
  code: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Technician';
  phone: string;
  baseSalary: number;
  commissionRate: number;
  totalSalesMonth: number;
  status: 'ACTIVE' | 'INACTIVE';
  todayAttendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
}

// Clean Initial State for Real Store Implementation
export const initialProducts: ProductItem[] = [];

export const initialStockMovements: StockMovementItem[] = [];

export const initialSales: SaleRecord[] = [];

export const initialSuppliers: SupplierRecord[] = [];

export const initialPurchases: PurchaseRecord[] = [];

export const initialCustomers: CustomerRecord[] = [];

export const initialEmployees: EmployeeRecord[] = [
  { id: 'emp-1', code: 'EMP001', name: 'Sujal Kumar', role: 'Admin', phone: '9876543210', baseSalary: 65000, commissionRate: 2.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-2', code: 'EMP002', name: 'Neha Rani', role: 'Manager', phone: '9833445566', baseSalary: 35000, commissionRate: 1.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-3', code: 'EMP003', name: 'Rohan Sharma', role: 'Staff', phone: '9811223344', baseSalary: 22000, commissionRate: 1.5, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' },
  { id: 'emp-4', code: 'EMP004', name: 'Amit Verma', role: 'Technician', phone: '9822334455', baseSalary: 28000, commissionRate: 5.0, totalSalesMonth: 0, status: 'ACTIVE', todayAttendance: 'PRESENT' }
];
