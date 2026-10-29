'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Leaf,
  Award,
} from 'lucide-react';

export function Footer({ settings }: { settings?: any }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const freeShippingText = settings?.freeShippingThresholdPaise
    ? `Free express shipping on all orders over ₹${(settings.freeShippingThresholdPaise / 100).toLocaleString('en-IN')}`
    : 'Free express shipping on all orders over ₹999';

  return (
    <footer className="bg-brand-forest-950 text-stone-300 border-t border-brand-forest-900 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-14 border-b border-brand-forest-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-forest-900 border border-brand-forest-700 flex items-center justify-center text-brand-gold flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Pure & Farm Traceable</h4>
              <p className="text-xs text-stone-400 mt-1">Single-origin botanicals harvested directly from registered farmers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-forest-900 border border-brand-forest-700 flex items-center justify-center text-brand-gold flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">FSSAI & NABL Verified</h4>
              <p className="text-xs text-stone-400 mt-1">FSSAI Lic. No. {settings?.fssaiLicence || '10024011000918'}. Every batch tested for heavy metals.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-forest-900 border border-brand-forest-700 flex items-center justify-center text-brand-gold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cold & Wood-Pressed</h4>
              <p className="text-xs text-stone-400 mt-1">Slow Marachekku wooden churns below 38°C to retain vital nutrients.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-forest-900 border border-brand-forest-700 flex items-center justify-center text-brand-gold flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Pan-India Express Delivery</h4>
              <p className="text-xs text-stone-400 mt-1">{freeShippingText} with live tracking.</p>
            </div>
          </div>
        </div>

        {/* Middle Links & Story */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-14 border-b border-brand-forest-800/80">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-forest flex items-center justify-center text-brand-gold">
                <span className="font-cinzel text-lg font-bold">V</span>
              </div>
              <span className="font-cinzel text-xl font-bold tracking-wider text-white">
                {settings?.storeName || 'VEDIK VANA'}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {settings?.tagline || 'Vedik Vana is a tribute to classical Indian botanical heritage. We wild-harvest pure minerals from high Himalayan altitudes and cold-press indigenous seeds in small, artisanal batches.'}
            </p>
            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>{settings?.address || 'Himalayan Foothills Estate, Dehradun, Uttarakhand, 248001'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-gold" />
                <span>{settings?.contactEmail || 'care@vedikvana.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>{settings?.contactPhone || '+91 98765 43210'} (Mon–Sat, 9AM–7PM IST)</span>
              </div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-4">
              Sacred Catalog
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/shop?category=resins-shilajit" className="hover:text-white transition-colors">
                  Pure Himalayan Shilajit
                </Link>
              </li>
              <li>
                <Link href="/shop?category=saffron-botanicals" className="hover:text-white transition-colors">
                  Kashmiri Mongra Saffron
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cold-pressed-oils" className="hover:text-white transition-colors">
                  Wood-Pressed Virgin Oils
                </Link>
              </li>
              <li>
                <Link href="/shop?category=chyawanprash-rasayanas" className="hover:text-white transition-colors">
                  Vedic Chyawanprash
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wild-forest-honey" className="hover:text-white transition-colors">
                  Wild Multifloral Honey
                </Link>
              </li>
              <li>
                <Link href="/shop?category=herbal-churnas" className="hover:text-white transition-colors">
                  Organic Herbal Churnas
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-4">
              Customer Sanctuary
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Farm Sourcing
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-privacy" className="hover:text-white transition-colors">
                  Terms of Service & Privacy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-gold transition-colors font-medium text-stone-300">
                  Customer Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Track My Order & Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-4">
              Botanical Chronicle
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Receive seasonal harvest dispatches, Ayurvedic wellness guides, and exclusive private offerings.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-brand-forest-900 border border-brand-forest-700 text-xs text-brand-gold-light">
                ✨ Thank you for subscribing to our sacred chronicles!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-brand-forest-900 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  className="w-full text-xs font-semibold py-2.5 px-4 rounded-lg bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal & FSSAI declaration */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            © {new Date().getFullYear()} {settings?.storeName || 'Vedik Vana Botanicals'} Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {settings?.fssaiLicence && (
              <span>FSSAI Lic. No. {settings.fssaiLicence}</span>
            )}
            {settings?.gstNumber && (
              <span>GSTIN: {settings.gstNumber}</span>
            )}
            <Link href="/admin/login" className="hover:text-stone-300 transition-colors">
              Merchant Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
