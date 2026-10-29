import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/formatters';

export const revalidate = 0; // Dynamic data

export default async function AdminDashboardOverview() {
  const [
    totalOrders,
    orders,
    products,
    lowStockProducts,
    recentOrders,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({ select: { totalPaise: true, status: true, paymentStatus: true } }),
    prisma.product.findMany({
      include: { category: true, images: { take: 1 } },
      orderBy: { isBestseller: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      where: { inventoryQty: { lte: 5 } },
      take: 5,
      include: { category: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.groupBy({
      by: ['customerEmail'],
    }).then((res) => res.length),
  ]);

  // Aggregate stats
  const totalRevenuePaise = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalPaise : 0), 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'PAID').length;
  const aovPaise = paidOrdersCount > 0 ? Math.round(totalRevenuePaise / paidOrdersCount) : 0;
  const outOfStockCount = await prisma.product.count({ where: { inventoryQty: { lte: 0 } } });

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Executive Merchant Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time business performance, inventory alerts, and fulfillment operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <a
            href="/api/admin/products/csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm"
          >
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
              Total Realized Revenue
            </span>
            <span className="text-2xl font-extrabold text-stone-900 mt-1 block">
              {formatPrice(totalRevenuePaise)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidOrdersCount} Paid Orders</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-extrabold text-stone-900 mt-1 block">
              {totalOrders}
            </span>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              From {totalCustomers} unique patrons
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
              Average Order Value (AOV)
            </span>
            <span className="text-2xl font-extrabold text-stone-900 mt-1 block">
              {formatPrice(aovPaise)}
            </span>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              Cart conversion standard
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock & Out of Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
              Stock Warnings
            </span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
              {lowStockProducts.length} Alert{lowStockProducts.length === 1 ? '' : 's'}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold block mt-1">
              {outOfStockCount} Out of Stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Orders & Inventory Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Recent Orders & Fulfillments
              </h3>
              <p className="text-xs text-stone-500">Latest customer transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand-forest hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Items</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 font-mono font-bold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-stone-800">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 text-stone-600">
                      {ord.items.length} item{ord.items.length === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 font-bold text-stone-900">
                      {formatPrice(ord.totalPaise)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'CONFIRMED'
                          ? 'bg-brand-sage-100 text-brand-forest'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[11px] font-semibold ${ord.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-stone-500'}`}>
                        {ord.paymentStatus} ({ord.paymentMethod === 'RAZORPAY' ? 'Online' : 'COD'})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products (1 col) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Critical Inventory
                </h3>
                <p className="text-xs text-stone-500">Products nearing depleted stock</p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-brand-forest hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  All botanical products are sufficiently stocked.
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-stone-800 line-clamp-1">{p.name}</h5>
                      <span className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      p.inventoryQty <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.inventoryQty} Units left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="w-full py-2.5 px-4 rounded-xl text-center font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors block"
          >
            Adjust Stock Levels & Thresholds →
          </Link>
        </div>
      </div>
    </div>
  );
}
