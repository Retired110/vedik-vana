'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, Image as ImageIcon, Eye } from 'lucide-react';

export default function AdminHomepageCustomizer() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Hero state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [heroCtaLink, setHeroCtaLink] = useState('');
  const [heroBgImage, setHeroBgImage] = useState('');

  // Brand Story state
  const [storyTitle, setStoryTitle] = useState('');
  const [storySubtitle, setStorySubtitle] = useState('');
  const [storyQuote, setStoryQuote] = useState('');

  // FAQs state
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage');
      const data = await res.json();
      if (data.success) {
        setSections(data.sections || []);
        data.sections.forEach((s: any) => {
          try {
            const parsed = JSON.parse(s.content);
            if (s.sectionKey === 'HERO_BANNER') {
              setHeroTitle(s.title);
              setHeroSubtitle(s.subtitle || '');
              setHeroBadge(parsed.badge || '');
              setHeroCtaText(parsed.ctaPrimaryText || 'Explore Sacred Catalog');
              setHeroCtaLink(parsed.ctaPrimaryLink || '/shop');
              setHeroBgImage(parsed.bgImage || '');
            } else if (s.sectionKey === 'BRAND_STORY') {
              setStoryTitle(s.title);
              setStorySubtitle(s.subtitle || '');
              setStoryQuote(parsed.quote || '');
            } else if (s.sectionKey === 'FAQ_SECTION') {
              setFaqs(parsed.faqs || []);
            }
          } catch (err) {
            console.error(err);
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'HERO_BANNER',
          title: heroTitle,
          subtitle: heroSubtitle,
          content: {
            badge: heroBadge,
            ctaPrimaryText: heroCtaText,
            ctaPrimaryLink: heroCtaLink,
            bgImage: heroBgImage,
            trustPills: [
              'High Altitude Harvests (16,000+ ft)',
              'Wood-Pressed at Low RPM',
              'Heavy Metal Tested & FSSAI Certified',
              'Direct Fair Farmer Partnerships',
            ],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast('Hero banner updated and live on storefront!');
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      alert('Save failed');
    }
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'BRAND_STORY',
          title: storyTitle,
          subtitle: storySubtitle,
          content: {
            quote: storyQuote,
            pillars: [
              { title: 'Zero Chemical Extraction', description: 'No hexane or stabilizers ever used.' },
              { title: 'FSSAI & NABL Lab Verified', description: 'Tested for heavy metals and pesticides.' },
              { title: 'Sustainably Wildcrafted', description: 'Harvested in harmony with seasonal cycles.' },
            ],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast('Brand story updated and live on storefront!');
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      alert('Save failed');
    }
  };

  const handleSaveFaqs = async () => {
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'FAQ_SECTION',
          title: 'Frequently Asked Questions',
          subtitle: 'Direct answers on our harvesting and compliance.',
          content: { faqs },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast('FAQs updated and live on storefront!');
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      alert('Save failed');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Homepage No-Code Section Customizer
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Customize the editorial hero banner, brand narrative, and FAQs without touching code.
        </p>
      </div>

      {/* 1. Hero Section Form */}
      <form onSubmit={handleSaveHero} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Editorial Hero Banner
          </h3>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-forest text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Hero Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-stone-800 block mb-1">Badge Text</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="100% Farm-Traceable & Lab-Certified"
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Background Image URL</label>
            <input
              type="url"
              value={heroBgImage}
              onChange={(e) => setHeroBgImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-stone-800 block mb-1">Main Headline</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Sacred Botanicals. Traceable Harvests."
              className="w-full p-2.5 rounded-xl border border-stone-300 font-serif font-bold text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-stone-800 block mb-1">Subtitle / Narrative</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Pure Himalayan Shilajit, Kashmiri Saffron, and Wood-Pressed Kachi Ghani Oils..."
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Primary Button Text</label>
            <input
              type="text"
              value={heroCtaText}
              onChange={(e) => setHeroCtaText(e.target.value)}
              placeholder="Explore Sacred Catalog"
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Primary Button Link</label>
            <input
              type="text"
              value={heroCtaLink}
              onChange={(e) => setHeroCtaLink(e.target.value)}
              placeholder="/shop"
              className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
            />
          </div>
        </div>
      </form>

      {/* 2. Brand Story Form */}
      <form onSubmit={handleSaveStory} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Brand Story & Sourcing Section
          </h3>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-forest text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Brand Story</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-bold text-stone-800 block mb-1">Section Title</label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Purity Without Compromise"
              className="w-full p-2.5 rounded-xl border border-stone-300 font-serif font-bold text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Section Subtitle</label>
            <textarea
              rows={2}
              value={storySubtitle}
              onChange={(e) => setStorySubtitle(e.target.value)}
              placeholder="From pristine Himalayan cliffs and indigenous Kerala coastal groves..."
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Featured Philosophy Quote</label>
            <input
              type="text"
              value={storyQuote}
              onChange={(e) => setStoryQuote(e.target.value)}
              placeholder="Ayurveda is not merely medicine; it is reverence for the intelligence of nature."
              className="w-full p-2.5 rounded-xl border border-stone-300 italic"
            />
          </div>
        </div>
      </form>

      {/* 3. FAQ Editor */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Frequently Asked Questions (Storefront Accordion)
          </h3>
          <button
            onClick={handleSaveFaqs}
            className="px-4 py-2 rounded-xl bg-brand-forest text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save FAQs</span>
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Question {idx + 1}</label>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].q = e.target.value;
                    setFaqs(updated);
                  }}
                  className="w-full p-2 rounded-lg border bg-white font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Answer</label>
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].a = e.target.value;
                    setFaqs(updated);
                  }}
                  className="w-full p-2 rounded-lg border bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
