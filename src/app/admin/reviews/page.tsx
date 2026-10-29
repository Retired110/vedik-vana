'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Check, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setToast('Review moderation updated');
        setTimeout(() => setToast(null), 3000);
        fetchReviews();
      }
    } catch {
      alert('Error updating review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchReviews();
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Customer Reviews & Moderation</h1>
          <p className="text-xs text-stone-500 mt-1">Approve, reject, or remove customer feedback submitted on product pages.</p>
        </div>
        <button
          onClick={fetchReviews}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {r.customerName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-brand-forest">
                    {r.product?.name || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    {r.title && <div className="font-bold text-stone-800 line-clamp-1">&quot;{r.title}&quot;</div>}
                    <div className="text-stone-600 line-clamp-2">{r.comment}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleApproval(r.id, r.isApproved)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          r.isApproved ? 'bg-amber-100 text-amber-800' : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {r.isApproved ? 'Reject' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
