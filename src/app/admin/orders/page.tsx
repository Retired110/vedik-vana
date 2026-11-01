'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Package,
  Bell,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/formatters';

type TabKey = 'NEW' | 'PROCESSING' | 'FULFILLED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'ALL';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('NEW');
  const [search, setSearch] = useState('');
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);

  // Selected order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusInput, setStatusInput] = useState('');
  const [paymentStatusInput, setPaymentStatusInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('Delhivery');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'new_order' } | null>(null);

  // Quick Dispatch modal state
  const [quickDispatchOrder, setQuickDispatchOrder] = useState<any | null>(null);
  const [dispatchCourier, setDispatchCourier] = useState('Delhivery');
  const [dispatchTracking, setDispatchTracking] = useState('');

  // Fetch orders from persistent database
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const fetchedOrders = data.orders;

        // Check for newly arrived incoming orders
        if (lastOrderCount !== null && fetchedOrders.length > lastOrderCount) {
          const newest = fetchedOrders[0];
          setToast({
            message: `🔔 New Order #${newest.orderNumber} placed by ${newest.customerName}!`,
            type: 'new_order',
          });
          setTimeout(() => setToast(null), 6000);
        }

        setOrders(fetchedOrders);
        setLastOrderCount(fetchedOrders.length);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time polling: automatically checks for incoming orders every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [lastOrderCount]);

  // Tab counts
  const counts = {
    NEW: orders.filter((o) => ['CONFIRMED', 'PENDING'].includes(o.status)).length,
    PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
    FULFILLED: orders.filter((o) => o.status === 'FULFILLED').length,
    SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => ['CANCELLED', 'REFUNDED'].includes(o.status)).length,
    ALL: orders.length,
  };

  // Filtered orders based on active tab and search
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      !search ||
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerPhone.includes(search);

    if (!matchesSearch) return false;

    if (activeTab === 'NEW') return ['CONFIRMED', 'PENDING'].includes(ord.status);
    if (activeTab === 'PROCESSING') return ord.status === 'PROCESSING';
    if (activeTab === 'FULFILLED') return ord.status === 'FULFILLED';
    if (activeTab === 'SHIPPED') return ord.status === 'SHIPPED';
    if (activeTab === 'DELIVERED') return ord.status === 'DELIVERED';
    if (activeTab === 'CANCELLED') return ['CANCELLED', 'REFUNDED'].includes(ord.status);
    return true; // 'ALL'
  });

  // Open full detail modal
  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setStatusInput(order.status);
    setPaymentStatusInput(order.paymentStatus);
    setTrackingNumberInput(order.trackingNumber || '');
    setCourierNameInput(order.courierName || 'Delhivery');
  };

  // Quick 1-click status transition
  const handleQuickStatusChange = async (orderId: string, newStatus: string, additionalData: any = {}) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          ...additionalData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: `Order status moved to ${newStatus}. Customer notified via email.` });
        setTimeout(() => setToast(null), 4000);
        await fetchOrders(true);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch {
      setToast({ message: 'Failed to update order status.' });
    } finally {
      setIsUpdating(false);
      setQuickDispatchOrder(null);
    }
  };

  // Handle Full Form Update
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
        setToast({ message: `Order #${selectedOrder.orderNumber} successfully updated.` });
        setTimeout(() => setToast(null), 3500);
        setSelectedOrder(data.order);
        fetchOrders(true);
      }
    } catch {
      setToast({ message: 'Failed to update order.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-white shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'new_order' ? 'bg-brand-forest-900 border-2 border-brand-gold' : 'bg-emerald-800'
          }`}
        >
          {toast.type === 'new_order' ? <Bell className="w-5 h-5 text-brand-gold animate-bounce" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-stone-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Merchant Order Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Accept incoming orders, manage fulfillment stages, assign couriers with automated customer emails, and handle stock recovery.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(false)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Workflow Tabs (Sections 1 to 5) */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'NEW'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>📥 New Orders</span>
          {counts.NEW > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'NEW' ? 'bg-brand-gold text-brand-forest-950' : 'bg-amber-100 text-amber-900'}`}>
              {counts.NEW}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PROCESSING')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'PROCESSING'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>⚙️ Processing</span>
          {counts.PROCESSING > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-900 font-bold">
              {counts.PROCESSING}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('FULFILLED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'FULFILLED'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>📦 Fulfilled & Packed</span>
          {counts.FULFILLED > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-900 font-bold">
              {counts.FULFILLED}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SHIPPED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'SHIPPED'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>🚚 Shipped</span>
          {counts.SHIPPED > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-900 font-bold">
              {counts.SHIPPED}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'DELIVERED'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>✅ Delivered</span>
          {counts.DELIVERED > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
              {counts.DELIVERED}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'CANCELLED'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>❌ Cancelled</span>
          {counts.CANCELLED > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-900 font-bold">
              {counts.CANCELLED}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>📋 All ({counts.ALL})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (VV-2024-XXXX), customer name, email, or phone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-brand-forest"
          />
        </div>
        <span className="text-[11px] text-stone-500 font-medium">
          Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Fulfillment Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" />
                    <span>Loading database orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No orders under "{activeTab}" section.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      <div>{ord.orderNumber}</div>
                      <div className="text-[10px] text-stone-400 font-sans font-normal">
                        {formatDateTime(ord.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-500">{ord.customerPhone}</div>
                      <div className="text-[10px] text-stone-400 truncate max-w-[160px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <span className="font-semibold">{ord.items?.length || 0}</span> item{ord.items?.length === 1 ? '' : 's'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-forest">
                      {formatPrice(ord.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ord.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {ord.paymentMethod === 'RAZORPAY' ? 'Online' : 'COD'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'SHIPPED'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.status === 'FULFILLED'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CONFIRMED' || ord.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* Quick 1-Click Workflow Transition */}
                    <td className="py-3.5 px-4 text-center">
                      {(ord.status === 'CONFIRMED' || ord.status === 'PENDING') && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'PROCESSING')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                        >
                          Accept Order →
                        </button>
                      )}

                      {ord.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'FULFILLED')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                        >
                          Mark as Fulfilled 📦
                        </button>
                      )}

                      {ord.status === 'FULFILLED' && (
                        <button
                          onClick={() => {
                            setQuickDispatchOrder(ord);
                            setDispatchCourier('Delhivery');
                            setDispatchTracking(`DELHIVERY-${Math.floor(10000000 + Math.random() * 90000000)}`);
                          }}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                        >
                          Dispatch & Ship 🚚
                        </button>
                      )}

                      {ord.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'DELIVERED')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                        >
                          Confirm Delivery ✅
                        </button>
                      )}

                      {ord.status === 'DELIVERED' && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}

                      {['CANCELLED', 'REFUNDED'].includes(ord.status) && (
                        <span className="text-[11px] text-stone-400 italic">Archived</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Dispatch Modal */}
      {quickDispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-forest" />
                <span>Dispatch Order #{quickDispatchOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setQuickDispatchOrder(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Courier Partner *</label>
                <select
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold"
                >
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="Blue Dart Aviation">Blue Dart Aviation</option>
                  <option value="DTDC Air">DTDC Air</option>
                  <option value="India Post Speed Post">India Post Speed Post</option>
                  <option value="Shadowfax">Shadowfax</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Tracking Number / AWB *</label>
                <input
                  type="text"
                  required
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  placeholder="e.g. DELHIVERY-82718291"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-xl">
                An automated email with tracking information will be dispatched to <strong>{quickDispatchOrder.customerEmail}</strong> upon confirmation.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setQuickDispatchOrder(null)}
                className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating || !dispatchTracking.trim()}
                onClick={() =>
                  handleQuickStatusChange(quickDispatchOrder.id, 'SHIPPED', {
                    courierName: dispatchCourier,
                    trackingNumber: dispatchTracking.trim(),
                  })
                }
                className="px-5 py-2.5 rounded-xl font-bold bg-sky-600 text-white hover:bg-sky-700 text-xs shadow-xs"
              >
                {isUpdating ? 'Saving...' : 'Confirm Dispatch & Notify Customer →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Order Detail & Audit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-forest-900 text-brand-gold">
                    {selectedOrder.status}
                  </span>
                </div>
                <span className="text-xs text-stone-500">Placed on {formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/orders/${selectedOrder.orderNumber}/email?format=html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-xs inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Packing Slip</span>
                </a>
                <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateOrder} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Delivery OTP Highlight Card */}
              <div className="p-4 rounded-2xl bg-brand-forest-950 text-white border border-brand-gold/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold block">
                    🔐 4-Digit Doorstep Delivery OTP
                  </span>
                  <span className="text-2xl font-mono font-bold text-brand-gold-light tracking-widest">
                    {selectedOrder.deliveryOtp || '4821'}
                  </span>
                </div>
                <div className="text-right text-[11px] text-stone-300 max-w-[240px]">
                  Customer presents this code to delivery agent at physical parcel handover.
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Ordered Botanical Formulations
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden p-3 bg-stone-50 space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {item.image && (
                          <img src={item.image} alt={item.productName} className="w-9 h-9 rounded-lg object-cover border border-stone-200" />
                        )}
                        <div>
                          <span className="font-semibold text-stone-900 block">{item.productName}</span>
                          {item.variantName && <span className="text-stone-500 text-[11px] block">{item.variantName}</span>}
                          <span className="text-stone-400 text-[10px]">
                            Qty: {item.quantity} × {formatPrice(item.unitPricePaise)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">{formatPrice(item.totalPaise)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-stone-200 flex justify-between font-bold text-sm text-brand-forest">
                    <span>Order Total:</span>
                    <span>{formatPrice(selectedOrder.totalPaise)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping & Contact Destination */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Customer & Shipping Destination
                </h4>
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 leading-relaxed text-stone-700 space-y-1">
                  <div className="font-bold text-stone-900">{selectedOrder.customerName}</div>
                  <div className="flex flex-wrap items-center gap-3 text-stone-600">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedOrder.customerPhone}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedOrder.customerEmail}</span>
                    </span>
                  </div>
                  <div className="text-stone-600 mt-1 pt-1 border-t border-stone-100 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                    <span>{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Fulfillment Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="CONFIRMED">Confirmed (New Order)</option>
                    <option value="PROCESSING">Processing (Preparing & Batching)</option>
                    <option value="FULFILLED">Fulfilled (Packed & Ready)</option>
                    <option value="SHIPPED">Shipped (Dispatched with Courier)</option>
                    <option value="DELIVERED">Delivered (Completed)</option>
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
                  className="px-5 py-2.5 rounded-xl font-bold bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save Order Updates & Notify'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
