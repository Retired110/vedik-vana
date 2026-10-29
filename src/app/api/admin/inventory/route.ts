import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { inventoryQty: 'asc' },
    });

    const recentMovements = await prisma.inventoryMovement.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        variant: { select: { name: true, sku: true } },
      },
    });

    return NextResponse.json({ success: true, products, recentMovements });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { productId, variantId, newQty, reason = 'MANUAL_ADJUSTMENT' } = await request.json();

    if (!productId || newQty === undefined || newQty < 0) {
      return NextResponse.json({ success: false, message: 'Valid product ID and non-negative quantity required.' }, { status: 400 });
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return NextResponse.json({ success: false, message: 'Variant not found' }, { status: 404 });

      const prevQty = variant.inventoryQty;
      const updatedVariant = await prisma.productVariant.update({
        where: { id: variantId },
        data: { inventoryQty: Number(newQty) },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId,
          variantId,
          changeQty: Number(newQty) - prevQty,
          previousQty: prevQty,
          newQty: Number(newQty),
          reason,
          referenceId: session.userId,
        },
      });

      return NextResponse.json({ success: true, message: 'Variant stock updated successfully!' });
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

      const prevQty = product.inventoryQty;
      const parsedQty = Number(newQty);

      let availability = product.availability;
      if (availability !== 'PREORDER' && availability !== 'DISCONTINUED') {
        if (parsedQty <= 0) availability = 'OUT_OF_STOCK';
        else if (parsedQty <= product.lowStockThreshold) availability = 'LOW_STOCK';
        else availability = 'IN_STOCK';
      }

      await prisma.product.update({
        where: { id: productId },
        data: {
          inventoryQty: parsedQty,
          availability,
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId,
          changeQty: parsedQty - prevQty,
          previousQty: prevQty,
          newQty: parsedQty,
          reason,
          referenceId: session.userId,
        },
      });

      return NextResponse.json({ success: true, message: 'Product stock updated successfully!' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update stock' }, { status: 500 });
  }
}
