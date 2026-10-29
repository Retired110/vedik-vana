import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { action, productIds, value } = await request.json();

    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ success: false, message: 'Action and product IDs are required.' }, { status: 400 });
    }

    switch (action) {
      case 'PUBLISH':
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'PUBLISHED' },
        });
        break;

      case 'UNPUBLISH':
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'DRAFT' },
        });
        break;

      case 'ARCHIVE':
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'ARCHIVED' },
        });
        break;

      case 'ADJUST_PRICE_PERCENT':
        const percent = Number(value);
        if (isNaN(percent)) {
          return NextResponse.json({ success: false, message: 'Invalid percentage value.' }, { status: 400 });
        }
        const productsToAdjust = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        for (const p of productsToAdjust) {
          const factor = 1 + percent / 100;
          const newPrice = Math.round(p.sellingPricePaise * factor);
          await prisma.product.update({
            where: { id: p.id },
            data: {
              sellingPricePaise: newPrice,
              compareAtPricePaise: p.compareAtPricePaise ? Math.round(p.compareAtPricePaise * factor) : null,
            },
          });
        }
        break;

      case 'ADJUST_STOCK':
        const deltaStock = Number(value);
        if (isNaN(deltaStock)) {
          return NextResponse.json({ success: false, message: 'Invalid stock adjustment value.' }, { status: 400 });
        }
        const stockProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        for (const p of stockProducts) {
          const newQty = Math.max(0, p.inventoryQty + deltaStock);
          let availability = p.availability;
          if (newQty <= 0) availability = 'OUT_OF_STOCK';
          else if (newQty <= p.lowStockThreshold) availability = 'LOW_STOCK';
          else availability = 'IN_STOCK';

          await prisma.product.update({
            where: { id: p.id },
            data: { inventoryQty: newQty, availability },
          });
        }
        break;

      case 'DELETE':
        for (const id of productIds) {
          const orderCount = await prisma.orderItem.count({ where: { productId: id } });
          if (orderCount > 0) {
            await prisma.product.update({
              where: { id },
              data: { status: 'ARCHIVED', availability: 'DISCONTINUED' },
            });
          } else {
            await prisma.product.delete({ where: { id } });
          }
        }
        break;

      default:
        return NextResponse.json({ success: false, message: 'Unsupported bulk action.' }, { status: 400 });
    }

    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${action} on ${productIds.length} products.`,
    });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Bulk operation failed' }, { status: 500 });
  }
}
