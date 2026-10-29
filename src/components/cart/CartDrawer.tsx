'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/formatters';

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
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
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

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

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-ivory shadow-2xl flex flex-col border-l border-brand-ivory-border">
          {/* Header */}
          <div className="p-5 border-b border-brand-ivory-border flex items-center justify-between bg-brand-ivory-warm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-forest" />
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Your Botanical Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Dynamic Progress Meter */}
          <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-medium text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    Add <strong className="text-emerald-800">{formatPrice(amountNeededForFreeShipping)}</strong> for Free Express Delivery!
                  </span>
                  <span>{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-ivory-warm mx-auto flex items-center justify-center text-brand-sage-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-brand-charcoal">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Explore our pure Himalayan Shilajit, wood-pressed oils, and sacred Ayurvedic rasayanas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/shop');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors shadow-sm"
                >
                  <span>Explore Botanicals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'def'}`}
                  className="flex gap-3.5 p-3 rounded-xl bg-white border border-brand-ivory-border shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-brand-ivory-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-brand-charcoal leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <span className="inline-block text-[11px] text-brand-sage-700 bg-brand-sage-50 px-2 py-0.5 rounded mt-0.5 font-medium">
                          {item.variantName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                      {/* Price */}
                      <span className="text-xs font-bold text-brand-forest">
                        {formatPrice(item.pricePaise * item.quantity)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-brand-ivory-warm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="p-1 hover:bg-stone-200/60 text-stone-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-brand-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          disabled={item.quantity >= (item.maxInventory || 99)}
                          className="p-1 hover:bg-stone-200/60 text-stone-600 disabled:opacity-40 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Trash */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-brand-ivory-border bg-brand-ivory-warm/80 space-y-4">
              {/* Coupon Section */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(discountPaise)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-stone-700 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code (e.g. VEDIK15)"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-brand-ivory-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold uppercase tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-forest text-white hover:bg-brand-forest-700 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p className={`text-[11px] mt-1.5 font-medium ${couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-brand-charcoal pt-2 border-t border-brand-ivory-border">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotalPaise)}</span>
                </div>
                {discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatPrice(discountPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping</span>
                  <span className="font-medium">
                    {shippingPaise === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : formatPrice(shippingPaise)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Estimated GST (5%)</span>
                  <span className="font-medium">{formatPrice(taxPaise)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-forest pt-2 border-t border-brand-ivory-border">
                  <span>Grand Total</span>
                  <span>{formatPrice(totalPaise)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Genuine Lab-Certified Herbal Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
