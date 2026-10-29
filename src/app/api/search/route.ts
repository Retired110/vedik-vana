import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { name: { contains: query } },
          { shortDescription: { contains: query } },
          { sku: { contains: query } },
          { tags: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      take: 6,
      include: {
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { isBestseller: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ success: false, message: 'Search query failed' }, { status: 500 });
  }
}
