'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  Save,
  X,
  CreditCard,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/formatters';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusInput, setStatusInput] = useState('');
  const [paymentStatusInput, setPaymentStatusInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setStatusInput(order.status);
    setPaymentStatusInput(order.paymentStatus);
    setTrackingNumberInput(order.trackingNumber || '');
    setCourierNameInput(order.courierName || 'Delhivery');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: statusInput,
          paymentStatus: paymentStatusInput,
          trackingNumber: trackingNumberInput,
          courierName: courierNameInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast(`Order #${selectedOrder.orderNumber} successfully updated.`);
        setTimeout(() => setToast(null), 3000);
        setSelectedOrder(data.order);
        fetchOrders();
      }
    } catch {
      setToast('Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white shadow-xl flex items-center gap-2 text-xs font-semibold animate-scale">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track customer orders, assign couriers, and manage returns/cancellations with automated inventory recovery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                statusFilter === st ? 'bg-brand-forest text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search order # or patron..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">View / Fulfill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {formatDateTime(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-forest">
                      {formatPrice(ord.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold ${ord.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-stone-500'}`}>
                        {ord.paymentStatus} ({ord.paymentMethod === 'RAZORPAY' ? 'Online' : 'COD'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'CONFIRMED'
                          ? 'bg-brand-sage-100 text-brand-forest'
                          : ord.status === 'CANCELLED' || ord.status === 'REFUNDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-stone-500">Placed on {formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Ordered Botanical Items
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden p-2 bg-stone-50">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-stone-900 block">{item.productName}</span>
                        {item.variantName && <span className="text-stone-500 text-[11px] block">{item.variantName}</span>}
                        <span className="text-stone-400 text-[10px]">Qty: {item.quantity} × {formatPrice(item.unitPricePaise)}</span>
                      </div>
                      <span className="font-bold text-stone-900">{formatPrice(item.totalPaise)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-1">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Customer Shipping Address
                </h4>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 leading-relaxed text-stone-700">
                  <div className="font-bold">{selectedOrder.customerName}</div>
                  <div>Phone: {selectedOrder.customerPhone} | Email: {selectedOrder.customerEmail}</div>
                  <div className="text-stone-600 mt-1">{selectedOrder.shippingAddress}</div>
                </div>
              </div>

              {/* Update Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Fulfillment Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing / Packing</option>
                    <option value="SHIPPED">Shipped (Dispatched)</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled (Auto-Restores Stock)</option>
                    <option value="REFUNDED">Refunded (Auto-Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Payment Status</label>
                  <select
                    value={paymentStatusInput}
                    onChange={(e) => setPaymentStatusInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={courierNameInput}
                    onChange={(e) => setCourierNameInput(e.target.value)}
                    placeholder="Delhivery / Blue Dart"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Tracking Number / AWB</label>
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="e.g. DELHIVERY-98127391"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl font-bold bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save Order Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
