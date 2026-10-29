'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  Check,
  AlertTriangle,
  Share2,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  ChevronDown,
  Send,
} from 'lucide-react';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/formatters';
import { useCart } from '@/lib/cart-context';

interface ProductDetailProps {
  product: any;
  relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();

  // Selected Variant (default to first variant or null)
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants?.find((v: any) => v.isDefault) || product.variants?.[0] || null
  );

  // Gallery state
  const images = product.images && product.images.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1000&q=85', alt: product.name }];
  const [activeImage, setActiveImage] = useState(images[0].url);
  const [quantity, setQuantity] = useState(1);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'provenance' | 'reviews'>('overview');

  // PIN code delivery checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ serviceable: boolean; message: string; estimatedDays?: string } | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState<any[]>(product.reviews || []);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Share feedback
  const [copied, setCopied] = useState(false);

  // Current dynamic pricing and stock
  const currentPricePaise = selectedVariant ? selectedVariant.pricePaise : product.sellingPricePaise;
  const currentCompareAtPaise = selectedVariant?.compareAtPricePaise || product.compareAtPricePaise;
  const currentStock = selectedVariant ? selectedVariant.inventoryQty : product.inventoryQty;
  const currentSku = selectedVariant?.sku || product.sku;

  const { hasDiscount, percentage, savingsPaise } = calculateDiscount(
    currentPricePaise,
    currentCompareAtPaise
  );

  const stockInfo = getStockStatus(
    currentStock,
    product.lowStockThreshold || 5,
    product.availability || 'IN_STOCK'
  );

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${pincode}`);
      const data = await res.json();
      setPincodeResult(data);
    } catch {
      setPincodeResult({ serviceable: false, message: 'Unable to check PIN code at this time.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!stockInfo.isPurchasable) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variantName: selectedVariant?.name || null,
      slug: product.slug,
      pricePaise: currentPricePaise,
      compareAtPricePaise: currentCompareAtPaise,
      image: activeImage,
      quantity,
      maxInventory: currentStock,
      sku: currentSku,
    });
  };

  const handleBuyNow = () => {
    if (!stockInfo.isPurchasable) return;
    handleAddToCart();
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewSuccess(true);
        setReviewName('');
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (e) {
      console.error('Review submit failed:', e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Product Primary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery Column */}
        <div className="space-y-4">
          {/* Main Zoomable Image Frame */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F7F4EE] border border-brand-ivory-border shadow-botanic">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {percentage}% SAVINGS
              </div>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-stone-600 hover:text-brand-forest shadow-sm backdrop-blur-sm transition-colors"
              title="Share this botanical"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && (
              <span className="absolute top-14 right-4 bg-brand-forest text-white text-[10px] px-2.5 py-1 rounded-full shadow-md animate-fade-in">
                Link Copied!
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.url
                      ? 'border-brand-forest shadow-md scale-105'
                      : 'border-brand-ivory-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.alt || `Product image ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span className="text-brand-gold-dark font-semibold uppercase tracking-wider">
                {product.category?.name || 'Botanical'}
              </span>
              <span className="tracking-wide">SKU: {currentSku}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-charcoal leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-charcoal">5.0</span>
              <span className="text-xs text-stone-400">({reviewsList.length} verified reviews)</span>
            </div>

            {/* Price Row */}
            <div className="pt-2 pb-3 border-y border-brand-ivory-border space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-brand-forest">
                  {formatPrice(currentPricePaise)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(currentCompareAtPaise)}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      Save {formatPrice(savingsPaise)} ({percentage}% off)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Inclusive of all taxes. Free Express Shipping across India above ₹999.
              </p>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider block">
                  Select Package / Size:
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest shadow-sm'
                          : 'border-brand-ivory-border bg-white hover:border-brand-gold'
                      }`}
                    >
                      <span className="block text-xs font-bold text-brand-charcoal">{v.name}</span>
                      <span className="block text-xs font-semibold text-brand-forest mt-0.5">
                        {formatPrice(v.pricePaise)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Stock Indicator */}
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stockInfo.badgeClass}`}>
                {stockInfo.isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                {stockInfo.isPurchasable && !stockInfo.isLowStock && <Check className="w-3.5 h-3.5" />}
                <span>{stockInfo.label}</span>
              </span>
            </div>

            {/* Quantity Selector and Action Buttons */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-brand-ivory-border rounded-xl overflow-hidden bg-brand-ivory-warm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-stone-600 hover:bg-stone-200/50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-brand-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                    disabled={quantity >= (currentStock || 99)}
                    className="p-3 text-stone-600 hover:bg-stone-200/50 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!stockInfo.isPurchasable}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] ${
                    stockInfo.isPurchasable
                      ? 'bg-brand-forest text-white hover:bg-brand-forest-700'
                      : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{stockInfo.isPurchasable ? 'Add to Botanical Cart' : 'Currently Unavailable'}</span>
                </button>
              </div>

              {/* Buy Now Instant Checkout */}
              {stockInfo.isPurchasable && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-brand-forest-950" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              )}
            </div>

            {/* PIN Code Delivery Checker */}
            <div className="p-4 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal">
                <Truck className="w-4 h-4 text-brand-forest" />
                <span>Estimate Indian Delivery & COD Serviceability:</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code (e.g. 110001)"
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-brand-ivory-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-forest text-white hover:bg-brand-forest-700 disabled:opacity-50 transition-colors"
                >
                  {pincodeLoading ? 'Checking...' : 'Check'}
                </button>
              </form>
              {pincodeResult && (
                <p className={`text-xs mt-1.5 ${pincodeResult.serviceable ? 'text-emerald-800' : 'text-rose-600'}`}>
                  {pincodeResult.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Overview, Provenance & FSSAI, Customer Reviews */}
      <div className="border-t border-brand-ivory-border pt-10">
        <div className="flex border-b border-brand-ivory-border gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-serif font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'text-brand-forest border-b-2 border-brand-forest'
                : 'text-stone-400 hover:text-brand-charcoal'
            }`}
          >
            Overview & Traditional Uses
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`pb-4 text-sm font-serif font-bold transition-all relative ${
              activeTab === 'provenance'
                ? 'text-brand-forest border-b-2 border-brand-forest'
                : 'text-stone-400 hover:text-brand-charcoal'
            }`}
          >
            Farm Provenance & FSSAI Compliance
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-serif font-bold transition-all relative ${
              activeTab === 'reviews'
                ? 'text-brand-forest border-b-2 border-brand-forest'
                : 'text-stone-400 hover:text-brand-charcoal'
            }`}
          >
            Verified Reviews ({reviewsList.length})
          </button>
        </div>

        <div className="py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              <p>{product.fullDescription || product.shortDescription}</p>

              {product.ingredients && (
                <div className="pt-4 border-t border-brand-ivory-border">
                  <h4 className="font-serif text-base font-bold text-brand-charcoal mb-2">
                    Complete Botanical Ingredients:
                  </h4>
                  <p className="text-xs text-stone-600 bg-brand-ivory-warm p-4 rounded-xl border border-brand-ivory-border">
                    {product.ingredients}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Provenance Tab */}
          {activeTab === 'provenance' && (
            <div className="max-w-3xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.farmOrigin && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Geographic Farm Origin
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1">
                      {product.farmOrigin}
                    </span>
                  </div>
                )}

                {product.harvestInfo && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Harvest Season & Technique
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1">
                      {product.harvestInfo}
                    </span>
                  </div>
                )}

                {product.grade && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Standardized Grade
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1">
                      {product.grade}
                    </span>
                  </div>
                )}

                {product.batchNumber && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Batch Tracking Number
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1 font-mono">
                      {product.batchNumber}
                    </span>
                  </div>
                )}

                {product.fssaiNumber && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      FSSAI Food License Number
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1 font-mono">
                      {product.fssaiNumber}
                    </span>
                  </div>
                )}

                {product.expiryDate && (
                  <div className="p-4 rounded-2xl bg-white border border-brand-ivory-border shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Shelf Life & Expiry
                    </span>
                    <span className="text-sm font-bold text-brand-forest block mt-1">
                      {product.expiryDate}
                    </span>
                  </div>
                )}
              </div>

              {product.storageInstructions && (
                <div className="p-4 rounded-2xl bg-brand-ivory-warm border border-brand-ivory-border">
                  <span className="text-xs font-bold text-brand-charcoal block mb-1">
                    Preservation & Storage Instructions:
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {product.storageInstructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-8">
              {/* Review Submission Form */}
              <div className="bg-white p-6 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-4">
                <h4 className="font-serif text-base font-bold text-brand-charcoal">
                  Submit a Verified Botanical Review
                </h4>
                {reviewSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    ✨ Thank you! Your review has been submitted and published.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. Ramesh Kulkarni, Bengaluru"
                          className="w-full text-xs p-2.5 rounded-lg border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                          Star Rating *
                        </label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-lg border border-brand-ivory-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                        >
                          <option value={5}>5 Stars - Pure Purity & Excellence</option>
                          <option value={4}>4 Stars - Very Good Experience</option>
                          <option value={3}>3 Stars - Satisfactory</option>
                          <option value={2}>2 Stars - Needs Improvement</option>
                          <option value={1}>1 Star - Disappointed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Authentic Himalayan aroma and noticeable vitality"
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                        Detailed Experience *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe your botanical experience, aroma, solubility, or health benefits..."
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-ivory-border focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{reviewSubmitting ? 'Submitting...' : 'Post Botanical Review'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4">
                    Be the first to review this sacred harvest!
                  </p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-white border border-brand-ivory-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      {rev.title && (
                        <h5 className="font-serif text-xs font-bold text-brand-charcoal">
                          &quot;{rev.title}&quot;
                        </h5>
                      )}
                      <p className="text-xs text-stone-600 leading-relaxed">&quot;{rev.comment}&quot;</p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500 font-medium">
                        <span>{rev.customerName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-emerald-700 flex items-center gap-1 text-[10px]">
                            <Check className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-brand-ivory-border pt-14 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
              Complementary Botanicals
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => router.push(`/product/${prod.slug}`)}
                className="cursor-pointer"
              >
                <div className="rounded-2xl bg-white border border-brand-ivory-border p-4 shadow-botanic-card space-y-3 card-hover-lift">
                  <div className="aspect-square rounded-xl bg-stone-100 overflow-hidden">
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-brand-charcoal line-clamp-1">{prod.name}</h4>
                    <span className="text-xs font-bold text-brand-forest mt-1 block">
                      {formatPrice(prod.sellingPricePaise)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
