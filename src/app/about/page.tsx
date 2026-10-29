import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Leaf, CheckCircle2, MapPin, HeartHandshake, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Our Sacred Sourcing & Ethical Traceability | Vedik Vana',
  description: 'Learn how Vedik Vana wild-harvests pure minerals from 16,000+ ft Himalayan cliffs and partners directly with certified organic tribal gatherers across India.',
};

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-12">
      {/* Hero Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block">
          Purity Without Compromise
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-charcoal leading-tight">
          Where Ancient Wisdom Meets Absolute Traceability
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          Vedik Vana was established with a singular devotion: to resurrect classical Indian apothecary standards. No industrial solvents, no diluted carrier oils, and no unverified claims.
        </p>
      </section>

      {/* Visual Panorama */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden aspect-[21/9] bg-stone-100 shadow-botanic-lg border border-brand-ivory-border">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85"
            alt="Pristine Himalayan valleys where wild botanicals are harvested"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Sourcing Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-forest text-brand-gold flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-charcoal">
              High-Altitude Wildcrafting
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our Gold-Grade Shilajit is hand-chiseled at extreme altitudes surpassing 16,000 feet in the pristine Himalayas. Pure, potent, and untouched by industrial atmospheric pollutants.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-forest text-brand-gold flex items-center justify-center font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-charcoal">
              Traditional Marachekku Milling
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Unlike industrial high-heat expellers that destroy bioactive polyphenols, our wood-pressed oils are crushed slowly in Vaagai timber churns, maintaining extraction temperatures below 38°C.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-brand-ivory-border shadow-botanic-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-forest text-brand-gold flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-charcoal">
              Certified NABL Purity
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              FSSAI License No. 10024011000918. Every single batch is independently ICP-MS tested for 4 heavy metals (Lead, Cadmium, Mercury, Arsenic) and microbiological safety before bottling.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Farmer Partnerships */}
      <section className="bg-brand-forest-900 text-white py-16 px-4 sm:px-6 lg:px-8 my-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold block">
            Fair Exchange & Reverence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Honoring Indigenous Growers & Forest Collectives
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl mx-auto">
            We bypass middlemen, purchasing directly from tribal gatherers in Uttarakhand and saffron farmers in Pampore at above fair-trade market rates. This ensures generational agricultural traditions continue to thrive.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light transition-colors"
            >
              <span>Explore Direct-Harvest Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
