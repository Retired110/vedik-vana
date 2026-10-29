'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [minOrderRupees, setMinOrderRupees] = useState('999');
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('500');
  const [toast, setToast] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: discountType === 'PERCENTAGE' ? Number(discountValue) : Math.round(Number(discountValue) * 100),
        minOrderValuePaise: Math.round(Number(minOrderRupees) * 100),
        maxDiscountPaise: maxDiscountRupees ? Math.round(Number(maxDiscountRupees) * 100) : null,
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToast(data.message);
        setTimeout(() => setToast(null), 3000);
        setCode('');
        setDescription('');
        fetchCoupons();
      } else {
        alert(data.message);
      }
    } catch {
      alert('Error creating coupon');
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (data.success) fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-800 text-white shadow-xl text-xs font-semibold">
          {toast}
        </div>
      )}

      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Promotions & Coupons</h1>
        <p className="text-xs text-stone-500 mt-1">Configure automated cart savings, discount limits, and percentage vouchers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900">Create Promotion Code</h3>
          <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-800 block mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VEDIK20"
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Description / Banner Text</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 20% off for festive shoppers"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="PERCENTAGE">Percentage (%) Off</option>
                <option value="FIXED_AMOUNT">Flat Amount (₹ INR) Off</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">Minimum Order Value (₹ INR)</label>
              <input
                type="number"
                value={minOrderRupees}
                onChange={(e) => setMinOrderRupees(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            {discountType === 'PERCENTAGE' && (
              <div>
                <label className="font-bold text-stone-800 block mb-1">Max Discount Cap (₹ INR)</label>
                <input
                  type="number"
                  value={maxDiscountRupees}
                  onChange={(e) => setMaxDiscountRupees(e.target.value)}
                  placeholder="Optional max limit"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold bg-brand-forest text-white hover:bg-brand-forest-700 shadow-sm mt-2"
            >
              Create Coupon
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-brand-forest bg-brand-forest/10 px-2.5 py-0.5 rounded-md">
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {c.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">{c.description || 'General promotion'}</p>
                <div className="text-[11px] text-stone-400 mt-1 space-x-3">
                  <span>
                    Benefit: {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : formatPrice(c.discountValue)}
                  </span>
                  <span>Min Order: {formatPrice(c.minOrderValuePaise)}</span>
                  <span>Used: {c.usageCount} times</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(c.id, c.isActive)}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    c.isActive ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title={c.isActive ? 'Disable' : 'Enable'}
                >
                  {c.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
