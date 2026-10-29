import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/formatters';

interface OrderSuccessProps {
  params: {
    orderNumber: string;
  };
}

export const revalidate = 0; // dynamic

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  let address: any = {};
  try {
    address = JSON.parse(order.shippingAddress);
  } catch {
    address = { addressLine1: order.shippingAddress };
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Top Success Banner */}
      <div className="text-center space-y-3 bg-white p-8 sm:p-10 rounded-3xl border border-brand-ivory-border shadow-botanic-card">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
          Order Successfully Placed
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
          Thank You, {order.customerName}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Your order <strong>#{order.orderNumber}</strong> has been received and is being prepared in our Himalayan apothecary facility.
        </p>
        <p className="text-xs text-stone-400">
          A confirmation dispatch with tracking details will be sent to <strong>{order.customerEmail}</strong>.
        </p>

        {/* SECURE DELIVERY OTP CARD */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-brand-forest-950 text-white border-2 border-brand-gold/40 shadow-lg max-w-md mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Doorstep Delivery OTP</span>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-[0.3em] text-brand-gold-light py-1">
            {order.deliveryOtp || '4821'}
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Share this 4-digit verification code with the delivery associate <strong>only after receiving the sealed parcel</strong> at your doorstep.
          </p>
          <div className="pt-2">
            <a
              href={`/api/orders/${order.orderNumber}/email?format=html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-forest-900 hover:bg-brand-forest-800 text-brand-gold text-xs font-semibold border border-brand-gold/30 transition-colors shadow-xs"
            >
              <span>📧 View Official Email Receipt & Payment Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Order Status & Tracking Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-ivory-border gap-2">
          <div>
            <h3 className="font-serif text-base font-bold text-brand-charcoal">
              Order Timeline & Tracking
            </h3>
            <span className="text-xs text-stone-500">Placed on {formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-forest-900 text-brand-gold">
              Status: {order.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
              Payment: {order.paymentStatus} ({order.paymentMethod === 'RAZORPAY' ? 'Online' : 'COD'})
            </span>
          </div>
        </div>

        {/* 4-Step Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>1. Confirmed</span>
            </span>
            <span className="text-[10px] text-emerald-700 block">Inventory reserved safely</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border text-stone-700 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-brand-forest" />
              <span>2. Processing</span>
            </span>
            <span className="text-[10px] text-stone-500 block">Batch verification & pack</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border text-stone-700 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-stone-400" />
              <span>3. Dispatched</span>
            </span>
            <span className="text-[10px] text-stone-500 block">Delhivery / Blue Dart tracking</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border text-stone-700 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
              <span>4. Delivered</span>
            </span>
            <span className="text-[10px] text-stone-500 block">Doorstep arrival</span>
          </div>
        </div>
      </div>

      {/* Details Grid: Shipping Address & Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-3">
          <h4 className="font-serif text-sm font-bold text-brand-charcoal flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-forest" />
            <span>Delivery Destination</span>
          </h4>
          <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
            <p className="font-bold text-brand-charcoal">{address.fullName || order.customerName}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} — {address.pincode}</p>
            <p className="text-stone-500 pt-1">Phone: {order.customerPhone}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-3">
          <h4 className="font-serif text-sm font-bold text-brand-charcoal flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-forest" />
            <span>Payment Summary</span>
          </h4>
          <div className="text-xs space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotalPaise)}</span>
            </div>
            {order.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span>-{formatPrice(order.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span>{order.shippingPaise === 0 ? 'FREE' : formatPrice(order.shippingPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span>{formatPrice(order.taxPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-brand-forest pt-2 border-t border-brand-ivory-border">
              <span>Amount Paid / Due:</span>
              <span>{formatPrice(order.totalPaise)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-4">
        <h3 className="font-serif text-base font-bold text-brand-charcoal">
          Ordered Botanical Formulations
        </h3>
        <div className="divide-y divide-brand-ivory-border">
          {order.items.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-3">
                {item.image && (
                  <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-brand-ivory-border">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h5 className="font-semibold text-brand-charcoal">{item.productName}</h5>
                  {item.variantName && (
                    <span className="text-[11px] text-brand-sage-700 block">{item.variantName}</span>
                  )}
                  <span className="text-stone-400">Qty: {item.quantity} × {formatPrice(item.unitPricePaise)}</span>
                </div>
              </div>
              <span className="font-bold text-brand-forest">{formatPrice(item.totalPaise)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/account"
            className="px-5 py-3 rounded-full text-xs font-semibold bg-brand-ivory-warm border border-brand-ivory-border text-brand-forest hover:bg-brand-ivory-border transition-colors"
          >
            My Account & Orders
          </Link>
        </div>
        <Link
          href="/admin"
          className="text-xs text-stone-500 hover:text-brand-forest font-medium"
        >
          View in Merchant Dashboard →
        </Link>
      </div>
    </div>
  );
}
