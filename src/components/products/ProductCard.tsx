'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/formatters';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription?: string;
    sellingPricePaise: number;
    compareAtPricePaise?: number | null;
    inventoryQty: number;
    lowStockThreshold?: number;
    availability?: string;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    netWeight?: string | null;
    category?: { name: string; slug: string } | null;
    images?: Array<{ url: string; alt?: string | null; isPrimary?: boolean }>;
    variants?: Array<{ id: string; name: string; pricePaise: number; inventoryQty: number }>;
    reviews?: Array<{ rating: number }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const primaryImage =
    product.images?.find((img) => img.isPrimary && img.url)?.url ||
    product.images?.[0]?.url ||
    '/images/placeholder-product.svg';

  const { hasDiscount, percentage } = calculateDiscount(
    product.sellingPricePaise,
    product.compareAtPricePaise
  );

  const stockInfo = getStockStatus(
    product.inventoryQty,
    product.lowStockThreshold || 5,
    product.availability || 'IN_STOCK'
  );

  const defaultVariant = product.variants?.[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!stockInfo.isPurchasable) return;

    addItem({
      productId: product.id,
      variantId: defaultVariant?.id || null,
      name: product.name,
      variantName: defaultVariant?.name || null,
      slug: product.slug,
      pricePaise: defaultVariant?.pricePaise || product.sellingPricePaise,
      compareAtPricePaise: product.compareAtPricePaise,
      image: primaryImage,
      quantity: 1,
      maxInventory: defaultVariant ? defaultVariant.inventoryQty : product.inventoryQty,
      sku: product.slug,
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-brand-ivory-border overflow-hidden card-hover-lift flex flex-col h-full shadow-botanic-card">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isBestseller && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-forest-900 text-brand-gold shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Bestseller</span>
          </span>
        )}
        {product.isNewArrival && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-gold-pale text-brand-gold-dark border border-brand-gold/30">
            Fresh Harvest
          </span>
        )}
        {hasDiscount && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-rose-50 text-rose-700 border border-rose-200">
            {percentage}% OFF
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-[#F7F4EE] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {!stockInfo.isPurchasable && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-stone-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Weight */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5 font-medium">
            <span className="text-brand-sage-700 uppercase tracking-wider text-[10px]">
              {product.category?.name || 'Botanical'}
            </span>
            {product.netWeight && <span>{product.netWeight}</span>}
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-brand-ivory-border/60">
          {/* Stock Notification pill */}
          {stockInfo.isLowStock && (
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mb-2">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Only {product.inventoryQty} left in harvest</span>
            </div>
          )}

          {/* Price & Action Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-brand-forest">
                  {formatPrice(product.sellingPricePaise)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatPrice(product.compareAtPricePaise)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!stockInfo.isPurchasable}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                stockInfo.isPurchasable
                  ? 'bg-brand-forest text-white hover:bg-brand-forest-700 shadow-sm active:scale-95'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
              title={stockInfo.isPurchasable ? 'Add to Cart' : 'Out of Stock'}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
