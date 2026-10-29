import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 30; // 30s cache

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return { title: 'Product Not Found | Vedik Vana' };
    }

    return {
      title: `${product.seoTitle || product.name} | Vedik Vana`,
      description: product.seoDescription || product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
      },
    };
  } catch {
    return { title: 'Sacred Botanicals | Vedik Vana' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { pricePaise: 'asc' } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: 'PUBLISHED',
        },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      });
    }
  } catch (err) {
    console.warn('Product page DB query fallback:', err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
