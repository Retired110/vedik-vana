'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Tag,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/formatters';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Jammu & Kashmir', 'Ladakh'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, discountPaise, shippingPaise, taxPaise, totalPaise, appliedCoupon, clearCart } = useCart();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Delhi NCR',
    pincode: '',
  });

  // Pre-fill user data if authenticated
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.customer) {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || data.customer.name || '',
            email: prev.email || data.customer.email || '',
            phone: prev.phone || data.customer.phone || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_DELIVERY'>('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated Razorpay Modal state for test/demo mode
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.pincode) {
      setErrorMessage('Please fill in all mandatory delivery address fields.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          name: item.name,
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order.');
      }

      const createdOrder = data.order;

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        clearCart();
        router.push(`/order-success/${createdOrder.orderNumber}`);
      } else {
        // Online Payment with Razorpay
        setPendingOrderId(createdOrder.id);
        setPendingOrderNumber(createdOrder.orderNumber);
        setShowRazorpayModal(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Payment simulation/verification
  const handleSimulatePaymentSuccess = async () => {
    if (!pendingOrderId) return;
    setIsSubmitting(true);
    try {
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pendingOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpayOrderId: `order_${Date.now()}`,
          razorpaySignature: 'simulated_valid_test_signature',
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        clearCart();
        setShowRazorpayModal(false);
        router.push(`/order-success/${pendingOrderNumber}`);
      } else {
        setErrorMessage(verifyData.message || 'Payment verification failed.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Payment verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !showRazorpayModal) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-charcoal">No items to checkout</h2>
        <p className="text-xs text-stone-500">Your cart is empty. Please add items before checking out.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-forest text-white">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-forest">
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Step 1: Contact Information */}
            <div className="p-6 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white text-xs flex items-center justify-center font-sans">
                  1
                </span>
                <span>Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-brand-charcoal block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Anandita Sen"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-charcoal block mb-1">Phone Number (with SMS updates) *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-brand-charcoal block mb-1">Email Address (for Invoice & Tracking) *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="anandita@example.com"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="p-6 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white text-xs flex items-center justify-center font-sans">
                  2
                </span>
                <span>Shipping Address (Across India)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-brand-charcoal block mb-1">Street Address, House/Flat No. *</label>
                  <input
                    type="text"
                    required
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="House 42, 3rd Cross, Palm Grove Avenue"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-brand-charcoal block mb-1">Apartment, Landmark, Colony (Optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Near Lotus Botanical Park"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-charcoal block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bangalore"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-charcoal block mb-1">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-brand-charcoal block mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 560001"
                    className="w-full p-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="p-6 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-forest text-white text-xs flex items-center justify-center font-sans">
                  3
                </span>
                <span>Select Payment Mode</span>
              </h2>

              <div className="space-y-3">
                {/* Razorpay Online Option */}
                <label
                  className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest shadow-sm'
                      : 'border-brand-ivory-border hover:border-stone-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-brand-forest focus:ring-brand-forest"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-brand-forest" />
                        <span>Online Payment (UPI, Credit/Debit Cards, NetBanking)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Instant verification via Razorpay secure gateway. Supports Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay & NetBanking.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest shadow-sm'
                      : 'border-brand-ivory-border hover:border-stone-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="mt-1 text-brand-forest focus:ring-brand-forest"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-brand-forest" />
                      <span>Cash on Delivery (COD)</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Pay in cash or UPI to the courier upon delivery at your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Order...' : `Complete Order • ${formatPrice(totalPaise)}`}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-5">
            <h3 className="font-serif text-lg font-bold text-brand-charcoal">
              Order Breakdown ({items.length} items)
            </h3>

            {/* Items scroll */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'def'}`} className="flex items-center gap-3 text-xs">
                  <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-brand-ivory-border">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-brand-charcoal truncate">{item.name}</h5>
                    {item.variantName && (
                      <span className="text-[11px] text-brand-sage-700 block">{item.variantName}</span>
                    )}
                    <span className="text-stone-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-brand-forest">
                    {formatPrice(item.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-brand-ivory-border space-y-2 text-xs text-brand-charcoal">
              <div className="flex justify-between">
                <span className="text-stone-500">Cart Subtotal</span>
                <span>{formatPrice(subtotalPaise)}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Express Delivery</span>
                <span>{shippingPaise === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(shippingPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estimated GST (5%)</span>
                <span>{formatPrice(taxPaise)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-forest pt-3 border-t border-brand-ivory-border">
                <span>Grand Total</span>
                <span>{formatPrice(totalPaise)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-brand-forest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Purity Guarantee & Tamper-Evident Packaging</span>
              </div>
              <p>Dispatched directly from Himalayan processing facility with batch lab testing report enclosed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Gateway Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-ivory-border space-y-5 animate-scale">
            {/* Razorpay Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Razorpay Trusted Gateway</h4>
                  <span className="text-[10px] text-stone-400 font-mono">Test Sandbox Mode</span>
                </div>
              </div>
              <span className="text-sm font-bold text-brand-forest">{formatPrice(totalPaise)}</span>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <p>
                Paying for <strong>Vedik Vana Order #{pendingOrderNumber}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 space-y-1 font-mono text-[11px]">
                <div>Customer: {formData.fullName}</div>
                <div>Contact: {formData.phone}</div>
                <div>Total: {formatPrice(totalPaise)}</div>
              </div>
              <p className="text-[11px] text-stone-500">
                In this test sandbox environment, click below to verify the server signature and complete the order.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment (Test Mode)</span>
              </button>

              <button
                onClick={() => setShowRazorpayModal(false)}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-stone-500 hover:bg-stone-100 transition-colors"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
