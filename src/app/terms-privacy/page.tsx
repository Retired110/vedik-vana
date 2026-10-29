import React from 'react';
import Link from 'next/link';

export default function TermsPrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 text-stone-700 text-xs sm:text-sm leading-relaxed">
      <div>
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold-dark block mb-2">
          Regulatory & Legal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
          Terms of Service & Privacy Notice
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-brand-ivory-border shadow-botanic-card space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-brand-charcoal mb-2">
            1. Business Entity & Statutory Compliance
          </h2>
          <p>
            This website is owned and operated by <strong>Vedik Vana Botanicals Private Limited</strong>, having its principal registered office at Himalayan Foothills Estate, Dehradun, Uttarakhand, 248001. Food Safety & Standards Authority of India (FSSAI) License Number: <strong>10024011000918</strong>. All agricultural and herbal formulations adhere to the Food Safety and Standards (Health Supplements, Nutraceuticals, Food for Special Dietary Use, Food for Special Medical Purpose, and Prebiotic and Probiotic Food) Regulations.
          </p>
        </div>

        <div className="pt-4 border-t border-brand-ivory-border">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal mb-2">
            2. Customer Privacy & Data Protection
          </h2>
          <p>
            We strictly safeguard your personal details. Customer contact numbers and delivery addresses are utilized solely for logistics dispatch and SMS delivery coordination. We do NOT sell, lease, or monetize customer data. All online transactions are encrypted via 256-bit SSL protocols; raw credit card numbers and banking PINs are never stored on our servers.
          </p>
        </div>

        <div className="pt-4 border-t border-brand-ivory-border">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal mb-2">
            3. Disclaimer & Usage Information
          </h2>
          <p>
            Products offered on this platform are traditional Ayurvedic herbs, functional foods, cold-pressed oils, and dietary supplements. Statements regarding botanical benefits have not been evaluated as pharmaceutical cure for specific ailments. Expectant mothers, nursing women, and individuals under prescribed medical regimens should consult their Ayurvedic physician or healthcare provider prior to starting concentrated resins or rasayanas.
          </p>
        </div>
      </div>
    </div>
  );
}
