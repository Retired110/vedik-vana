'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Lock,
  User,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/formatters';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export function Navbar({
  categories = [],
  settings,
}: {
  categories?: CategoryItem[];
  settings?: any;
}) {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-ivory/95 backdrop-blur-md border-b border-brand-ivory-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-brand-forest hover:text-brand-forest-700"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-brand-forest flex items-center justify-center text-brand-gold shadow-sm group-hover:scale-105 transition-transform">
                  <span className="font-cinzel text-xl font-bold tracking-tighter">V</span>
                </div>
                <div>
                  <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-brand-forest block leading-none">
                    {settings?.storeName || 'VEDIK VANA'}
                  </span>
                  <span className="text-[10px] tracking-[0.16em] uppercase font-medium text-brand-gold-dark block mt-1 truncate max-w-[200px] sm:max-w-none">
                    {settings?.tagline ? settings.tagline.split('—')[0].trim() : 'Sacred Botanical Living'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
              <Link
                href="/shop"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Shop All
              </Link>
              <Link
                href="/shop?category=resins-shilajit"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Pure Shilajit
              </Link>
              <Link
                href="/shop?category=cold-pressed-oils"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Wood-Pressed Oils
              </Link>
              <Link
                href="/shop?category=saffron-botanicals"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Kashmiri Saffron
              </Link>
              <Link
                href="/shop?category=chyawanprash-rasayanas"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Vedic Chyawanprash
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-forest transition-colors whitespace-nowrap"
              >
                Our Sourcing
              </Link>
            </nav>

            {/* Right Icons: Search, Sign In, Admin Link, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="p-2 text-brand-charcoal hover:text-brand-forest rounded-full hover:bg-brand-ivory-warm transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Customer Sign In Button */}
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-forest bg-brand-ivory-warm hover:bg-brand-ivory-border transition-colors border border-brand-ivory-border shadow-xs whitespace-nowrap"
                title="Customer Sign In & Account"
              >
                <User className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Sign In</span>
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-brand-forest hover:text-brand-forest-700 bg-brand-ivory-warm rounded-full border border-brand-ivory-border hover:border-brand-gold/50 transition-all shadow-sm group"
                aria-label={`Cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-gold-dark text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-brand-ivory rounded-2xl w-full max-w-2xl shadow-2xl border border-brand-ivory-border overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-brand-ivory-border flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-sage" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pure Shilajit, Kashmiri saffron, wood-pressed oils, herbs..."
                className="w-full bg-transparent border-none outline-none text-brand-charcoal text-base placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-brand-charcoal text-xs px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Results or Suggestions */}
            <div className="max-h-96 overflow-y-auto p-4">
              {isSearching ? (
                <div className="py-8 text-center text-sm text-stone-500">Searching sacred catalog...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider font-semibold text-brand-sage-600 px-1">
                    Matching Botanical Products ({searchResults.length})
                  </div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-brand-ivory-warm transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-brand-ivory-border">
                        <img
                          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-brand-charcoal truncate group-hover:text-brand-forest">
                          {product.name}
                        </h4>
                        <p className="text-xs text-brand-sage-700 truncate">{product.category?.name || 'Botanical'}</p>
                        <div className="text-xs font-semibold text-brand-forest mt-0.5">
                          {formatPrice(product.sellingPricePaise)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-forest group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-8 text-center text-sm text-stone-500">
                  No matching botanical products found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="py-4">
                  <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-3 px-1">
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Himalayan Shilajit', 'Kashmiri Saffron', 'Wood Pressed Coconut Oil', 'Vedic Chyawanprash', 'Kumkumadi Tailam'].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="text-xs px-3 py-1.5 rounded-full bg-brand-ivory-warm text-brand-charcoal hover:bg-brand-forest hover:text-white transition-colors border border-brand-ivory-border"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-brand-ivory shadow-xl z-50 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-brand-ivory-border">
              <span className="font-cinzel text-lg font-bold text-brand-forest">VEDIK VANA</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-stone-500 hover:text-stone-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Shop All Botanicals
              </Link>
              <Link
                href="/shop?category=resins-shilajit"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Pure Shilajit Resin
              </Link>
              <Link
                href="/shop?category=cold-pressed-oils"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Wood-Pressed Oils
              </Link>
              <Link
                href="/shop?category=saffron-botanicals"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Kashmiri Saffron
              </Link>
              <Link
                href="/shop?category=chyawanprash-rasayanas"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Vedic Chyawanprash
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-forest"
              >
                Our Farm Traceability
              </Link>
            </nav>

            <div className="pt-6 border-t border-brand-ivory-border space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-forest text-white font-medium text-sm shadow-sm"
              >
                <User className="w-4 h-4 text-brand-gold" />
                <span>Sign In / My Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
