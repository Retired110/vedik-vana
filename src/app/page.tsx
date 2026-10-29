import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Leaf,
  CheckCircle2,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';

export const revalidate = 60; // Auto revalidate every 60s

export default async function HomePage() {
  // Fetch database records with resilient fallback
  let categories: any[] = [];
  let bestsellers: any[] = [];
  let featuredProducts: any[] = [];
  let newArrivals: any[] = [];
  let sections: any[] = [];
  let reviews: any[] = [];

  try {
    const results = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isBestseller: true },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isNewArrival: true },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
      prisma.homepageSection.findMany(),
      prisma.review.findMany({
        where: { isApproved: true },
        take: 3,
        orderBy: { rating: 'desc' },
        include: { product: true },
      }),
    ]);
    categories = results[0] || [];
    bestsellers = results[1] || [];
    featuredProducts = results[2] || [];
    newArrivals = results[3] || [];
    sections = results[4] || [];
    reviews = results[5] || [];
  } catch (err) {
    console.warn('Homepage database query fallback:', err);
  }

  // Parse section configs
  const sectionMap: Record<string, any> = {};
  sections.forEach((s) => {
    try {
      sectionMap[s.sectionKey] = {
        title: s.title,
        subtitle: s.subtitle,
        isEnabled: s.isEnabled,
        ...JSON.parse(s.content),
      };
    } catch {
      sectionMap[s.sectionKey] = { title: s.title, subtitle: s.subtitle, isEnabled: s.isEnabled };
    }
  });

  const hero = sectionMap['HERO_BANNER'] || {
    title: 'Sacred Botanicals. Traceable Harvests.',
    subtitle: 'Pure Himalayan Shilajit, Kashmiri Saffron, and Wood-Pressed Kachi Ghani Oils handcrafted according to classical Vedic Shastras.',
    badge: '100% Farm-Traceable & Lab-Certified',
    ctaPrimaryText: 'Explore Sacred Catalog',
    ctaPrimaryLink: '/shop',
    ctaSecondaryText: 'Our Farm Sourcing',
    ctaSecondaryLink: '/about',
    bgImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85',
    trustPills: [
      'High Altitude Harvests (16,000+ ft)',
      'Wood-Pressed at Low RPM',
      'Heavy Metal Tested & FSSAI Certified',
      'Direct Fair Farmer Partnerships',
    ],
  };

  const brandStory = sectionMap['BRAND_STORY'] || {
    title: 'Purity Without Compromise',
    subtitle: 'From pristine Himalayan cliffs and indigenous Kerala coastal groves directly to your home.',
    quote: 'Ayurveda is not merely medicine; it is reverence for the intelligence of nature.',
    pillars: [
      { title: 'Zero Chemical Extraction', description: 'No hexane, petroleum distillates, or artificial stabilizers are ever used.' },
      { title: 'FSSAI & NABL Lab Verified', description: 'Every batch undergoes rigorous ICP-MS testing for heavy metals and pesticide residues.' },
      { title: 'Sustainably Wildcrafted', description: 'Harvested in harmony with seasonal cycles, leaving parent ecosystems intact.' },
    ],
  };

  const faqs = sectionMap['FAQ_SECTION']?.faqs || [
    {
      q: 'How do I know your Himalayan Shilajit is authentic?',
      a: 'Authentic Shilajit dissolves completely in warm water or milk without leaving gritty sediment, smells earthy with a smoky undertone, and hardens when cold while becoming pliable at body temperature. Each jar comes with a batch lab report showing >75% fulvic acid.',
    },
    {
      q: 'What is the meaning of wood-pressed (Marachekku) oil?',
      a: 'Unlike modern industrial expellers that generate high friction temperatures (up to 120°C) which denature fatty acids, wood-pressing uses slow pestles in wood churns where temperature never exceeds 38°C, preserving all vital micronutrients and aromas.',
    },
    {
      q: 'How long does delivery take across India?',
      a: 'We dispatch all orders within 24 hours. Metro cities receive delivery in 2-3 business days, while other locations typically arrive in 3-5 business days with live SMS and tracking updates.',
    },
    {
      q: 'What is your cancellation and return policy?',
      a: 'Unopened products in their original tamper-evident packaging can be returned within 7 days of delivery. If a product arrives damaged, we offer immediate replacement or full refund.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Large Editorial Hero Section */}
      <section className="relative overflow-hidden bg-brand-forest-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero.bgImage}
            alt="Botanical Flora and Himalayan Herbs"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forest-950 via-brand-forest-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-brand-forest-800/80 text-brand-gold-light border border-brand-gold/30 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>{hero.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed max-w-xl">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={hero.ctaPrimaryLink || '/shop'}
                className="px-7 py-3.5 rounded-full font-semibold text-sm bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                <span>{hero.ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={hero.ctaSecondaryLink || '/about'}
                className="px-6 py-3.5 rounded-full font-medium text-sm text-white hover:text-brand-gold-light hover:bg-white/10 transition-colors border border-white/20 backdrop-blur-sm"
              >
                {hero.ctaSecondaryText}
              </Link>
            </div>

            {/* Trust Pills */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-300">
              {(hero.trustPills || []).map((pill: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span className="font-medium text-stone-200">{pill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop By Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
              Holistic Apothecary
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Shop by Botanical Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:text-brand-forest-700 group"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-brand-ivory-border p-4 flex flex-col items-center text-center card-hover-lift shadow-botanic-card"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-stone-100 mb-3 border border-brand-ivory-border">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-sm font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors line-clamp-2">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-500 mt-1 font-medium">
                {cat._count.products} Products
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-brand-gold-dark mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Time-Tested Formulations</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Revered Bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:text-brand-forest-700 group"
          >
            <span>Explore All Products</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Sourcing & Quality Storytelling Section */}
      <section className="bg-brand-forest-900 text-white py-20 px-4 sm:px-6 lg:px-8 my-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold block">
              Ethical Provenance & Authenticity
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
              {brandStory.title}
            </h2>
            <p className="text-stone-300 text-base leading-relaxed">
              {brandStory.subtitle}
            </p>

            <blockquote className="p-4 rounded-xl bg-brand-forest-950/70 border-l-4 border-brand-gold italic text-stone-300 text-sm flex gap-3">
              <Quote className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>{brandStory.quote}</span>
            </blockquote>

            <div className="space-y-4 pt-2">
              {(brandStory.pillars || []).map((pillar: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{pillar.title}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light transition-colors"
              >
                <span>Read Full Traceability Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/20 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1000&q=85"
                alt="Ayurvedic herbs preparation"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Overlay Certificate Badge */}
            <div className="absolute -bottom-6 -left-6 bg-brand-ivory text-brand-charcoal p-4 rounded-2xl shadow-xl border border-brand-gold/30 flex items-center gap-3.5 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-brand-forest flex items-center justify-center text-brand-gold flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-forest block">FSSAI Lic. #10024011000918</span>
                <span className="text-[10px] text-stone-500 block leading-tight">Batch tested by NABL accredited lab for purity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Sacred Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
              Curated Essentials
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Featured Botanicals
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:text-brand-forest-700 group"
          >
            <span>View Catalog</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Genuine Customer Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
              Verified Patron Experiences
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Words From Sacred Seekers
            </h2>
            <p className="text-xs text-stone-500 mt-2">
              Real reviews submitted by verified patrons who experience Vedik Vana botanicals daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-brand-ivory-border shadow-botanic-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  {rev.title && (
                    <h4 className="font-serif text-sm font-bold text-brand-charcoal mb-2">
                      &quot;{rev.title}&quot;
                    </h4>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-ivory-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-brand-charcoal block">{rev.customerName}</span>
                    <span className="text-[10px] text-stone-400">Verified Botanical Purchase</span>
                  </div>
                  <span className="text-[10px] font-medium text-brand-sage-700 bg-brand-sage-50 px-2 py-0.5 rounded">
                    {rev.product?.name?.slice(0, 15)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Editable FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
            Clear Transparency
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            Direct answers on our harvesting, wooden cold-pressing, FSSAI compliance, and nationwide shipping.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, idx: number) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-brand-ivory-border p-5 transition-all open:shadow-botanic-card"
            >
              <summary className="font-serif text-base font-semibold text-brand-charcoal cursor-pointer list-none flex items-center justify-between gap-4">
                <span>{faq.q}</span>
                <span className="w-6 h-6 rounded-full bg-brand-ivory-warm flex items-center justify-center text-brand-forest group-open:rotate-180 transition-transform">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </span>
              </summary>
              <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-brand-ivory-border leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
