import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function FaqPage() {
  const faqSection = await prisma.homepageSection.findUnique({
    where: { sectionKey: 'FAQ_SECTION' },
  });

  let faqs = [
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

  if (faqSection?.content) {
    try {
      const parsed = JSON.parse(faqSection.content);
      if (parsed.faqs?.length) faqs = parsed.faqs;
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block">
          Transparent Answers
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Everything you need to know about our sourcing, authenticity verification, cold-pressing, and orders.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
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
    </div>
  );
}
