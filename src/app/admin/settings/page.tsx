'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  Bot,
  KeyRound,
  User,
  Sparkles,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Store & Identity Settings
  const [storeName, setStoreName] = useState('Vedik Vana');
  const [tagline, setTagline] = useState('Sacred Botanical Living');
  const [contactEmail, setContactEmail] = useState('care@vedikvana.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Himalayan Foothills, Dehradun, Uttarakhand, 248001');
  const [fssaiLicence, setFssaiLicence] = useState('10024011000918');

  // Shipping & Tax
  const [freeShippingRupees, setFreeShippingRupees] = useState('999');
  const [standardShippingRupees, setStandardShippingRupees] = useState('99');
  const [taxRatePercent, setTaxRatePercent] = useState('5');
  const [codEnabled, setCodEnabled] = useState(true);

  // Razorpay
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_vedikvanaDemo123');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('sampleSecretKey9988');

  // Announcement
  const [announcementText, setAnnouncementText] = useState('✨ Special Festive Offering: Use code VEDIK15 for 15% off | Free Express Delivery across India above ₹999');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // AI Bot Settings
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [defaultBotGreeting, setDefaultBotGreeting] = useState('');

  // Merchant Security Credentials
  const [adminName, setAdminName] = useState('Vedic Vana Master Admin');
  const [adminEmail, setAdminEmail] = useState('admin@vedikvana.com');
  const [uniqueStaffId, setUniqueStaffId] = useState('VV-ADMIN-01');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  useEffect(() => {
    // 1. Load Store Settings
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setStoreName(s.storeName);
          setTagline(s.tagline);
          setContactEmail(s.contactEmail);
          setContactPhone(s.contactPhone);
          setAddress(s.address);
          setFssaiLicence(s.fssaiLicence);
          setFreeShippingRupees((s.freeShippingThresholdPaise / 100).toString());
          setStandardShippingRupees((s.standardShippingFeePaise / 100).toString());
          setTaxRatePercent(s.taxRatePercent.toString());
          setCodEnabled(s.codEnabled);
          setRazorpayKeyId(s.razorpayKeyId);
          setRazorpayKeySecret(s.razorpayKeySecret);
          setAnnouncementText(s.announcementText || '');
          setAnnouncementActive(s.announcementActive);
          setGeminiApiKey(s.geminiApiKey || '');
          setDefaultBotGreeting(s.defaultBotGreeting || '');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    // 2. Load Admin Profile
    fetch('/api/admin/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAdminName(data.user.name || '');
          setAdminEmail(data.user.email || '');
          setUniqueStaffId(data.user.uniqueStaffId || 'VV-ADMIN-01');
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        storeName,
        tagline,
        contactEmail,
        contactPhone,
        address,
        fssaiLicence,
        freeShippingThresholdPaise: Math.round(Number(freeShippingRupees) * 100),
        standardShippingFeePaise: Math.round(Number(standardShippingRupees) * 100),
        taxRatePercent: Number(taxRatePercent),
        codEnabled,
        razorpayKeyId,
        razorpayKeySecret,
        announcementText,
        announcementActive,
        geminiApiKey,
        defaultBotGreeting,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Also update admin security profile if password or staffId changed
      await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          uniqueStaffId,
          newPassword: newAdminPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewAdminPassword('');
        setToast('Store settings & Merchant profile updated across live storefront!');
        setTimeout(() => setToast(null), 3500);
      }
    } catch {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="font-cinzel text-2xl font-bold text-stone-900">
          Store Settings & Merchant Profile
        </h1>
        <p className="text-xs text-stone-500">
          Any updates here immediately take effect on the live website (Navbar, Footer, Cart & Announcement Bar).
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Merchant Security Profile */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-forest">
            <KeyRound className="w-5 h-5 text-brand-gold-dark" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Merchant Security & Login Credentials
            </h3>
          </div>
          <p className="text-stone-500 text-[11px]">
            Configure your unique merchant number / staff ID and credentials used to access this console.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Unique Merchant Staff ID
              </label>
              <input
                type="text"
                required
                value={uniqueStaffId}
                onChange={(e) => setUniqueStaffId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase bg-stone-50 focus:bg-white"
                placeholder="VV-ADMIN-01"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                Unique code for fast merchant password login without typing full email.
              </span>
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Merchant Login Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
                placeholder="admin@vedikvana.com"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Merchant Admin Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Change Password (Leave blank to keep existing)
              </label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Enter new master password"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* General Store Details */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Storefront Brand & Legal Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">FSSAI Licence Number</label>
              <input
                type="text"
                value={fssaiLicence}
                onChange={(e) => setFssaiLicence(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Customer Care Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Customer Care Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Physical Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Tax Rules */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-forest" />
            <span>Shipping & GST Tax Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={freeShippingRupees}
                onChange={(e) => setFreeShippingRupees(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={standardShippingRupees}
                onChange={(e) => setStandardShippingRupees(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800 pt-2">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="rounded text-brand-forest"
            />
            <span>Enable Cash on Delivery (COD) Option</span>
          </label>
        </div>

        {/* Multilingual AI Bot Settings */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-gold-dark" />
            <span>Veda Mitra Multilingual AI Bot Configuration</span>
          </h3>
          <p className="text-stone-500 text-[11px]">
            Veda Mitra greets visitors in their native language (10 Indian languages supported), grounded on our botanical catalog dataset.
          </p>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">Google Gemini Free API Key (Optional)</label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use built-in grounded Ayurvedic AI engine)"
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                If omitted, the store seamlessly runs the high-speed local Ayurvedic neural knowledge base at zero cost.
              </span>
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Custom Bot Welcome Greeting Override</label>
              <input
                type="text"
                value={defaultBotGreeting}
                onChange={(e) => setDefaultBotGreeting(e.target.value)}
                placeholder="Leave blank to use default native regional greetings"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar Message */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Storefront Announcement Bar
          </h3>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Ticker Message</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="rounded text-brand-forest"
            />
            <span>Display Announcement Bar on Storefront Header</span>
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl font-bold bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <Save className="w-4 h-4" />
          <span>Save All Business Settings & Security Credentials</span>
        </button>
      </form>
    </div>
  );
}
