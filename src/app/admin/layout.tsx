'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  FolderTree,
  Tag,
  Sliders,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Bot,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products & Catalog', icon: Package },
  { href: '/admin/inventory', label: 'Stock & Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/coupons', label: 'Discounts & Coupons', icon: Tag },
  { href: '/admin/homepage', label: 'Homepage Customizer', icon: Sliders },
  { href: '/admin/reviews', label: 'Reviews Moderation', icon: MessageSquare },
  { href: '/admin/ai-learning', label: 'Veda Mitra AI Learning', icon: Bot },
  { href: '/admin/settings', label: 'Business Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // If on /admin/login, render children without sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/admin/session')
        .then((res) => {
          if (!res.ok) router.push('/admin/login');
          return res.json();
        })
        .then((data) => {
          if (data?.authenticated) {
            setAdminUser(data.user);
          } else {
            router.push('/admin/login');
          }
        })
        .catch(() => router.push('/admin/login'));
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-forest-950 text-stone-300 border-r border-brand-forest-900 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-brand-forest-900 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-forest flex items-center justify-center text-brand-gold font-bold text-sm">
              V
            </div>
            <div>
              <span className="font-cinzel text-base font-bold text-white block leading-none">
                VEDIK VANA
              </span>
              <span className="text-[10px] text-brand-gold uppercase tracking-wider block mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-forest text-brand-gold shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-brand-forest-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-gold' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Storefront Link & User Info */}
        <div className="p-4 border-t border-brand-forest-900 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-brand-forest-900 text-brand-gold-light hover:bg-brand-forest transition-colors border border-brand-forest-800"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="truncate">
              <span className="font-semibold text-white block truncate">
                {adminUser?.name || 'Master Admin'}
              </span>
              <span className="text-[10px] text-stone-500 uppercase">{adminUser?.role || 'OWNER'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-brand-forest-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <span className="hidden sm:inline">Merchant Management</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="text-brand-forest font-bold">
                {NAV_ITEMS.find((i) => i.href === pathname)?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-brand-forest hover:text-brand-forest-700 flex items-center gap-1.5"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-brand-forest-950 p-4 flex flex-col justify-between text-stone-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-forest-900">
                <span className="font-cinzel text-base font-bold text-white">VEDIK VANA ADMIN</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-brand-forest text-brand-gold' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 text-xs text-rose-400 hover:bg-brand-forest-900 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
