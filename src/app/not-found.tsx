import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-brand-ivory-warm mx-auto flex items-center justify-center text-brand-forest">
        <Leaf className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-dark block">
        Sacred Path Not Found (404)
      </span>
      <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
        This Botanical Offering Has Relocated
      </h1>
      <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
        The formulation or page you are seeking might have been archived, restocked under a new harvest batch, or moved.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-full text-xs font-semibold bg-white border border-brand-ivory-border text-brand-charcoal hover:bg-brand-ivory-warm shadow-sm transition-colors"
        >
          Return to Sanctuary
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 rounded-full text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
