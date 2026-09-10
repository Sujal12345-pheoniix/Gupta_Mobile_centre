'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { SaleRecord, ProductItem } from '@/lib/mockData';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface CartItem { product: ProductItem; qty: number; }

export default function SalesPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin');
  const isStaff = roles.includes('Staff');

  const { sales, products, recordSale } = useStore();
  const [view, setView] = useState<'list' | 'pos'>('list');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [search, setSearch] = useState('');
  // POS state
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<SaleRecord['paymentMethod']>('CASH');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');

  const filtered = sales.filter(s =>
    s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.customerName.toLowerCase().includes(search.toLowerCase()) ||
    s.staffName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p => p.status === 'ACTIVE' && p.stock > 0 &&
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const addToCart = (product: ProductItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { alert('Not enough stock'); return prev; }
        return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { product, qty: 1 }];
    });
    setProductSearch('');
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.product.id !== id));
  const updateQty = (id: string, qty: number) => {
    const item = cart.find(c => c.product.id === id);
    if (!item) return;
    if (qty > item.product.stock) return alert('Not enough stock');
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(c => c.product.id === id ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.product.sellingPrice * c.qty, 0);
  const taxAmount = cart.reduce((sum, c) => sum + (c.product.sellingPrice * c.qty * c.product.taxRate / (100 + c.product.taxRate)), 0);
  const total = subtotal - discount;

  const completeSale = () => {
    if (cart.length === 0) return alert('Add items to cart');
    const newSale = recordSale({
      customerName,
      customerPhone,
      itemsCount: cart.reduce((s, c) => s + c.qty, 0),
      subtotal,
      discount,
      tax: taxAmount,
      total,
      paidAmount: total,
      paymentMethod: payMethod,
      status: 'COMPLETED',
      staffName: user?.name || 'Staff',
    }, cart);

    setSelectedSale(newSale);
    setCart([]);
    setDiscount(0);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setView('list');
  };

  if (view === 'pos') {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-900">← Back to Sales</button>
          <h1 className="text-2xl font-bold text-gray-900">New Sale — Point of Sale</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Search product by name or SKU..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              {productSearch && (
                <div className="mt-2 border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? <div className="p-4 text-sm text-gray-400 text-center">No products found</div> :
                    filteredProducts.map(p => (
                      <button key={p.id} onClick={() => addToCart(p)} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 transition">
                        <div className="font-medium text-sm text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.sku} · Stock: {p.stock} · {formatINR(p.sellingPrice)}</div>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 font-medium text-sm text-gray-700">Cart Items</div>
              {cart.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No items added yet. Search above to add products.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Product</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Price</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cart.map(c => (
                      <tr key={c.product.id}>
                        <td className="px-4 py-3 text-gray-900">{c.product.name}</td>
                        <td className="px-4 py-3 text-center">
                          <input type="number" min="1" max={c.product.stock} className="w-16 border rounded text-center text-sm py-1" value={c.qty}
                            onChange={e => updateQty(c.product.id, Number(e.target.value))} />
                        </td>
                        <td className="px-4 py-3 text-right">{formatINR(c.product.sellingPrice)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(c.product.sellingPrice * c.qty)}</td>
                        <td className="px-2 py-3">
                          <button onClick={() => removeFromCart(c.product.id)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Name</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Phone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="10-digit mobile" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Discount</span>
                <input type="number" className="w-24 border rounded px-2 py-1 text-sm text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tax (incl.)</span><span>{formatINR(taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Total</span><span className="text-green-700">{formatINR(total)}</span></div>
            </div>
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Payment</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['CASH', 'UPI', 'CARD', 'SPLIT'] as const).map(m => (
                  <button key={m} onClick={() => setPayMethod(m)} className={`py-2 rounded-lg text-sm font-medium border transition ${payMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>{m}</button>
                ))}
              </div>
              <button onClick={completeSale} disabled={cart.length === 0} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                ✓ Complete Sale — {formatINR(total)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-1">{sales.length} transactions · Total: {formatINR(sales.reduce((s, x) => s + x.total, 0))}</p>
        </div>
        <button onClick={() => setView('pos')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
          + New Sale (POS)
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4">
        <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Search by invoice, customer, or staff..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Staff</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedSale(s)}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{s.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.customerName}</div>
                    <div className="text-xs text-gray-400">{s.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.date}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{s.itemsCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(s.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.paymentMethod === 'CASH' ? 'bg-green-50 text-green-700' : s.paymentMethod === 'UPI' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{s.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.staffName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Invoice — {selectedSale.invoiceNumber}</h2>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-medium">{selectedSale.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedSale.customerPhone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{selectedSale.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Staff</span><span>{selectedSale.staffName}</span></div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{selectedSale.itemsCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatINR(selectedSale.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>- {formatINR(selectedSale.discount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (GST incl.)</span><span>{formatINR(selectedSale.tax)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total Paid</span><span className="text-green-700">{formatINR(selectedSale.total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Mode</span>
                <span className="font-medium">{selectedSale.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

