'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/formatters';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setMovements(data.recentMovements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (productId: string, variantId: string | null, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    setUpdatingId(variantId || productId);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId,
          newQty,
          reason: delta > 0 ? 'STOCK_RESTOCK' : 'STOCK_ADJUSTMENT',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback('Stock adjusted successfully!');
        setTimeout(() => setFeedback(null), 3000);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'low') return p.inventoryQty <= p.lowStockThreshold && p.inventoryQty > 0;
    if (filter === 'out') return p.inventoryQty <= 0;
    if (search.trim()) {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Stock & Inventory Engine
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time atomic stock adjustments, threshold alerts, and inventory movement logs.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'all' ? 'bg-brand-forest text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'low' ? 'bg-amber-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Low Stock Only
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'out' ? 'bg-rose-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Out of Stock
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Adjustments Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isUpdating = updatingId === p.id;
                const isLow = p.inventoryQty <= p.lowStockThreshold && p.inventoryQty > 0;
                const isOut = p.inventoryQty <= 0;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{p.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      {p.category?.name || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      ≤ {p.lowStockThreshold} units
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded-full ${
                        isOut
                          ? 'bg-rose-100 text-rose-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.inventoryQty} Units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {p.availability}
                      </span>
                    </td>

                    {/* Quick Stepper Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1">
                        <button
                          onClick={() => handleAdjustStock(p.id, null, p.inventoryQty, -5)}
                          disabled={p.inventoryQty < 5 || isUpdating}
                          className="px-2 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 rounded disabled:opacity-30"
                          title="Reduce 5 units"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, null, p.inventoryQty, -1)}
                          disabled={p.inventoryQty <= 0 || isUpdating}
                          className="p-1 text-stone-600 hover:bg-stone-200 rounded disabled:opacity-30"
                          title="Reduce 1 unit"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-stone-800">
                          {p.inventoryQty}
                        </span>
                        <button
                          onClick={() => handleAdjustStock(p.id, null, p.inventoryQty, 1)}
                          disabled={isUpdating}
                          className="p-1 text-stone-600 hover:bg-stone-200 rounded"
                          title="Add 1 unit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, null, p.inventoryQty, 10)}
                          disabled={isUpdating}
                          className="px-2 py-1 text-[11px] font-bold text-brand-forest hover:bg-brand-forest hover:text-white rounded"
                          title="Restock 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Inventory Movements History */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <History className="w-4 h-4 text-brand-forest" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Real-Time Inventory Movement Audit Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Product & Variant</th>
                <th className="py-2.5">Adjustment</th>
                <th className="py-2.5">Previous</th>
                <th className="py-2.5">New Stock</th>
                <th className="py-2.5">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No inventory movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/70">
                    <td className="py-2.5 text-stone-500 font-mono text-[11px]">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="py-2.5 font-bold text-stone-800">
                      {m.product?.name} {m.variant ? `(${m.variant.name})` : ''}
                    </td>
                    <td className="py-2.5">
                      <span className={`font-bold ${m.changeQty > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-400">{m.previousQty}</td>
                    <td className="py-2.5 font-bold text-stone-900">{m.newQty}</td>
                    <td className="py-2.5">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        {m.reason}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
