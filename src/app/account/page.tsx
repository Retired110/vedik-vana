'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  User,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  MapPin,
  ExternalLink,
  KeyRound,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch('/api/customer/orders');
        if (res.status === 401) {
          router.push('/login?redirect=/account');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setCustomer(data.customer);
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error('Failed to load customer profile:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-ivory flex items-center justify-center p-6 text-brand-forest">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
            Opening Sacred Account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Profile Banner */}
        <div className="bg-brand-forest-950 text-white rounded-3xl p-6 sm:p-8 border border-brand-forest-900 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-forest/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-forest border border-brand-gold/40 flex items-center justify-center text-brand-gold text-2xl font-bold font-cinzel shadow-lg">
              {customer?.name ? customer.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                  {customer?.name || 'Sacred Seeker'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-forest-900 text-brand-gold border border-brand-gold/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Member
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-gold" />
                  {customer?.email}
                </span>
                {customer?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    {customer?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/shop"
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-brand-gold text-brand-forest-950 text-xs font-bold hover:bg-brand-gold-light transition-all shadow-sm text-center"
            >
              Explore Catalog
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-brand-forest-900 border border-brand-forest-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel text-xl font-bold text-brand-forest flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-gold-dark" />
              <span>Your Botanical Orders ({orders.length})</span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-ivory-border space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-brand-ivory-warm border border-brand-gold/30 mx-auto flex items-center justify-center text-brand-gold-dark">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-brand-forest">No Orders Yet</h3>
              <p className="text-xs text-brand-charcoal-muted max-w-sm mx-auto">
                Begin your journey with our lab-certified Pure Himalayan Shilajit, Kashmiri Saffron, and Wood-Pressed Virgin Oils.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-brand-forest text-brand-gold font-bold text-xs hover:bg-brand-forest-900 transition-colors shadow-md"
              >
                <span>Browse Sacred Catalog</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-ivory-border shadow-xs space-y-4 hover:border-brand-gold/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-ivory-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-brand-forest text-sm sm:text-base">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-charcoal-muted mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Secure Delivery OTP Card */}
                      {order.deliveryOtp && order.status !== 'DELIVERED' && (
                        <div className="bg-brand-forest-950 text-white px-3.5 py-1.5 rounded-xl border border-brand-gold/40 text-right flex items-center gap-2 shadow-xs">
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-brand-gold font-bold">
                              Delivery OTP
                            </div>
                            <div className="text-sm font-mono font-bold tracking-widest text-brand-gold-light">
                              {order.deliveryOtp}
                            </div>
                          </div>
                          <KeyRound className="w-4 h-4 text-brand-gold" />
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">
                          Total Amount
                        </div>
                        <div className="font-bold text-sm sm:text-base text-brand-forest">
                          {formatPrice(order.totalPaise)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-brand-ivory-border"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-brand-forest block">
                              {item.productName}
                            </span>
                            {item.variantName && (
                              <span className="text-[11px] text-stone-500">
                                {item.variantName}
                              </span>
                            )}
                            <span className="text-[11px] text-stone-400 block">
                              Qty: {item.quantity} × {formatPrice(item.unitPricePaise)}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-brand-charcoal">
                          {formatPrice(item.totalPaise)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-ivory-border text-xs text-stone-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Truck className="w-3.5 h-3.5 text-brand-forest" />
                      {order.courierName
                        ? `${order.courierName} — ${order.trackingNumber || 'Live Dispatched'}`
                        : 'Packing & Preparing for Dispatch'}
                    </span>
                    <Link
                      href={`/order-success/${order.orderNumber}`}
                      className="text-brand-forest font-semibold hover:text-brand-gold-dark transition-colors inline-flex items-center gap-1"
                    >
                      <span>View Receipt & Email Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
