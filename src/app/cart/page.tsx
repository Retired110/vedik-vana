'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/formatters';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise,
    freeShippingThresholdPaise,
    amountNeededForFreeShipping,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponFeedback(null);
    const res = await applyCoupon(couponCodeInput.trim());
    setCouponFeedback(res);
    setCouponLoading(false);
    if (res.success) setCouponCodeInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-brand-ivory-warm mx-auto flex items-center justify-center text-brand-sage-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-charcoal">
          Your Botanical Cart is Empty
        </h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our collection of authentic wild-harvested Himalayan Shilajit, wood-pressed oils, and certified Ayurvedic formulations.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors shadow-sm"
          >
            <span>Explore Botanical Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-brand-ivory-border">
        <div>
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-forest mb-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
            Botanical Shopping Bag ({totalItems} items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-medium"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Shipping Meter */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
        {amountNeededForFreeShipping > 0 ? (
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center justify-between font-medium text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                Add <strong className="text-emerald-800">{formatPrice(amountNeededForFreeShipping)}</strong> more to get Free Express Delivery!
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-800 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>You have unlocked <strong>FREE Express Delivery</strong> across India!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Items Table */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'def'}`}
              className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-botanic-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-brand-ivory-border">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link href={`/product/${item.slug}`} className="font-serif text-sm font-bold text-brand-charcoal hover:text-brand-forest">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <span className="block text-xs text-brand-sage-700 font-medium mt-0.5">
                      Package: {item.variantName}
                    </span>
                  )}
                  <span className="block text-xs text-stone-400 mt-0.5">
                    Unit: {formatPrice(item.pricePaise)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                {/* Stepper */}
                <div className="flex items-center border border-brand-ivory-border rounded-xl overflow-hidden bg-brand-ivory-warm">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                    className="p-2 text-stone-600 hover:bg-stone-200/50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-brand-charcoal">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    disabled={item.quantity >= (item.maxInventory || 99)}
                    className="p-2 text-stone-600 hover:bg-stone-200/50 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-brand-forest block">
                    {formatPrice(item.pricePaise * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-stone-400 hover:text-rose-600 p-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-5">
            <h3 className="font-serif text-lg font-bold text-brand-charcoal">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <div className="pt-2 pb-3 border-y border-brand-ivory-border">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-stone-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. VEDIK15)"
                      className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand-forest text-white hover:bg-brand-forest-700 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponFeedback && (
                    <p className={`text-xs ${couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {couponFeedback.message}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-brand-charcoal">
              <div className="flex justify-between">
                <span className="text-stone-500">Cart Subtotal</span>
                <span className="font-medium">{formatPrice(subtotalPaise)}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discounts Applied</span>
                  <span>-{formatPrice(discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Express Delivery</span>
                <span className="font-medium">
                  {shippingPaise === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(shippingPaise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">GST (5%)</span>
                <span className="font-medium">{formatPrice(taxPaise)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-forest pt-3 border-t border-brand-ivory-border">
                <span>Grand Total</span>
                <span>{formatPrice(totalPaise)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Proceed to Delivery & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Safe & Secure Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
