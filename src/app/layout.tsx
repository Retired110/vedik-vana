import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/db';
import { CartProvider } from '@/lib/cart-context';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { VedaMitraChat } from '@/components/ai/VedaMitraChat';

export const metadata: Metadata = {
  title: 'Vedik Vana | Sacred Botanicals, Pure Himalayan Shilajit & Wood-Pressed Oils',
  description:
    '100% Pure, Wild-Harvested & Farm-Traceable Indian Botanicals. Grade-A Himalayan Shilajit, Kashmiri Mongra Saffron, and Traditional Wood-Pressed Oils.',
  keywords: [
    'Pure Himalayan Shilajit',
    'Kashmiri Saffron',
    'Wood-Pressed Coconut Oil',
    'Vedic Chyawanprash',
    'Organic Triphala',
    'Kumkumadi Tailam',
    'Ayurvedic herbs',
  ],
  openGraph: {
    title: 'Vedik Vana | Sacred Indian Botanicals',
    description: '100% Pure, Wild-Harvested & Farm-Traceable Indian Botanicals.',
    url: 'https://vedikvana.com',
    siteName: 'Vedik Vana',
    locale: 'en_IN',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let categories: any[] = [];

  try {
    settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  } catch (e) {
    console.error('Error fetching layout data:', e);
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-gold-pale selection:text-brand-forest-900">
        <CartProvider initialSettings={settings}>
          <AnnouncementBar
            message={settings?.announcementText}
            isActive={settings?.announcementActive}
          />
          <Navbar categories={categories} settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
          <VedaMitraChat />
        </CartProvider>
      </body>
    </html>
  );
}
