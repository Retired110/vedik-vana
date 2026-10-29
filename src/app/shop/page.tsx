import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ProductCard } from '@/components/products/ProductCard';
import { SlidersHorizontal, ArrowUpDown, Filter, Sparkles, X, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface ShopPageProps {
  searchParams: {
    category?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    stock?: string;
  };
}

export const revalidate = 30; // 30s cache

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q, sort = 'featured', minPrice, maxPrice, stock } = searchParams;

  // Build Prisma where query
  const where: any = {
    status: 'PUBLISHED',
  };

  if (category) {
    where.category = { slug: category };
  }

  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q.trim() } },
      { shortDescription: { contains: q.trim() } },
      { sku: { contains: q.trim() } },
      { tags: { contains: q.trim() } },
    ];
  }

  if (minPrice || maxPrice) {
    where.sellingPricePaise = {};
    if (minPrice) where.sellingPricePaise.gte = Number(minPrice) * 100;
    if (maxPrice) where.sellingPricePaise.lte = Number(maxPrice) * 100;
  }

  if (stock === 'in_stock') {
    where.inventoryQty = { gt: 0 };
  }

  // Sorting
  let orderBy: any = { isFeatured: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { sellingPricePaise: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { sellingPricePaise: 'desc' };
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (sort === 'bestseller') {
    orderBy = { isBestseller: 'desc' };
  }

  let products: any[] = [];
  let categories: any[] = [];
  let totalCount = 0;

  try {
    const results = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    products = results[0] || [];
    categories = results[1] || [];
    totalCount = results[2] || 0;
  } catch (err) {
    console.warn('Shop database query fallback:', err);
  }

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-forest">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-forest">Botanical Catalog</Link>
        {activeCategory && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-charcoal font-medium">{activeCategory.name}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-brand-ivory-warm rounded-3xl p-6 sm:p-10 border border-brand-ivory-border mb-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
            Classical Vedic Formulations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            {activeCategory ? activeCategory.name : q ? `Search Results for "${q}"` : 'Sacred Botanical Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            {activeCategory?.description ||
              'Explore our 100% farm-traceable, wildcrafted Himalayan Shilajit, single-origin cold-pressed oils, Kashmiri saffron, and classical churnas.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-brand-ivory-border p-5 shadow-botanic-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-ivory-border">
              <span className="font-serif text-sm font-bold text-brand-charcoal flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-forest" />
                <span>Filters</span>
              </span>
              {(category || q || minPrice || maxPrice || stock) && (
                <Link
                  href="/shop"
                  className="text-xs text-brand-gold-dark hover:underline font-medium"
                >
                  Clear All
                </Link>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href={`/shop${q ? `?q=${q}` : ''}`}
                    className={`flex items-center justify-between py-1 transition-colors ${
                      !category ? 'font-bold text-brand-forest' : 'text-stone-600 hover:text-brand-forest'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-stone-400">({totalCount})</span>
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}${q ? `&q=${q}` : ''}`}
                      className={`flex items-center justify-between py-1 transition-colors ${
                        category === cat.slug
                          ? 'font-bold text-brand-forest'
                          : 'text-stone-600 hover:text-brand-forest'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-stone-400">({cat._count.products})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Ranges */}
            <div className="pt-4 border-t border-brand-ivory-border">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Price Filter
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Under ₹500', min: '0', max: '500' },
                  { label: '₹500 – ₹1,000', min: '500', max: '1000' },
                  { label: '₹1,000 – ₹2,000', min: '1000', max: '2000' },
                  { label: 'Above ₹2,000', min: '2000', max: '10000' },
                ].map((range, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(q ? { q } : {}),
                      minPrice: range.min,
                      maxPrice: range.max,
                      sort,
                    }).toString()}`}
                    className={`block py-1 ${
                      minPrice === range.min && maxPrice === range.max
                        ? 'font-bold text-brand-forest'
                        : 'text-stone-600 hover:text-brand-forest'
                    }`}
                  >
                    {range.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-4 border-t border-brand-ivory-border">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Availability
              </h4>
              <Link
                href={`/shop?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(q ? { q } : {}),
                  ...(stock === 'in_stock' ? {} : { stock: 'in_stock' }),
                  sort,
                }).toString()}`}
                className={`inline-flex items-center gap-2 text-xs ${
                  stock === 'in_stock' ? 'text-brand-forest font-bold' : 'text-stone-600 hover:text-brand-forest'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    stock === 'in_stock' ? 'bg-brand-forest border-brand-forest text-white' : 'border-stone-300'
                  }`}
                >
                  {stock === 'in_stock' && '✓'}
                </div>
                <span>In Stock Only</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-ivory-border gap-4">
            <span className="text-xs font-medium text-stone-600">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
            </span>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500">Sort by:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'featured', label: 'Featured' },
                  { key: 'bestseller', label: 'Bestselling' },
                  { key: 'price_asc', label: 'Price: Low to High' },
                  { key: 'price_desc', label: 'Price: High to Low' },
                  { key: 'newest', label: 'Newest Harvest' },
                ].map((s) => (
                  <Link
                    key={s.key}
                    href={`/shop?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(q ? { q } : {}),
                      ...(minPrice ? { minPrice } : {}),
                      ...(maxPrice ? { maxPrice } : {}),
                      ...(stock ? { stock } : {}),
                      sort: s.key,
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sort === s.key
                        ? 'bg-brand-forest text-white shadow-sm'
                        : 'bg-white text-stone-600 hover:bg-brand-ivory-warm border border-brand-ivory-border'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-ivory-border shadow-botanic-card space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-ivory-warm mx-auto flex items-center justify-center text-brand-sage-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                No matching botanical products found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your active filter criteria. Try adjusting your filters or search keywords.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors shadow-sm"
                >
                  <span>Reset All Filters</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
