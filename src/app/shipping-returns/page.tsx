import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 text-stone-700 text-xs sm:text-sm leading-relaxed">
      <div>
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
          Customer Sanctuary Policies
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
          Shipping, Delivery & Return Policy
        </h1>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-3xl border border-brand-ivory-border shadow-botanic-card">
        <div className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-forest" />
            <span>1. Domestic Shipping & Delivery Timelines</span>
          </h2>
          <p>
            • <strong>Dispatch:</strong> All orders placed on business days before 2:00 PM IST are inspected, packaged in tamper-evident corrugated boxes, and dispatched within 24 hours from our Himalayan estate warehouse.
          </p>
          <p>
            • <strong>Transit Times:</strong> Major metro hubs (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) typically receive delivery within <strong>2 to 3 business days</strong>. Non-metro and regional locations arrive within <strong>3 to 5 business days</strong>.
          </p>
          <p>
            • <strong>Free Shipping Threshold:</strong> All orders with a cart subtotal exceeding <strong>₹999</strong> receive complimentary Express Delivery. Orders below ₹999 incur a standard flat shipping fee of <strong>₹99</strong>.
          </p>
          <p>
            • <strong>Tracking:</strong> Real-time tracking notifications are transmitted via SMS and email with live courier links (Delhivery, Blue Dart, ExpressBees) as soon as the package is scanned by our logistics partners.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-brand-ivory-border">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-forest" />
            <span>2. Returns, Replacements & Refund Policy</span>
          </h2>
          <p>
            Due to the hygienic and ingestible nature of food and Ayurvedic items, we accept returns on items that are unopened, undamaged, and retain their original tamper-evident security foil seal intact within <strong>7 days of delivery</strong>.
          </p>
          <p>
            • <strong>Transit Damage or Defect:</strong> In the rare event that an item arrives leaking, damaged, or broken, please email photographs along with your Order Number to <code>care@vedikvana.com</code> or WhatsApp our care concierge at <code>+91 98765 43210</code> within 48 hours. We will immediately dispatch a replacement with zero shipping charge, or process a full refund to your original payment method.
          </p>
          <p>
            • <strong>Order Cancellations:</strong> Orders may be cancelled prior to warehouse dispatch by contacting customer support. Once an order is marked as Shipped, cancellation cannot be accommodated.
          </p>
          <p>
            • <strong>Refund Processing:</strong> Approved refunds for online transactions (Razorpay / UPI / NetBanking / Cards) are processed back to the original source account within <strong>5 to 7 business days</strong> depending on your issuing bank. For Cash on Delivery orders, refunds are disbursed directly via verified NEFT/IMPS bank transfer or UPI ID.
          </p>
        </div>
      </div>
    </div>
  );
}
