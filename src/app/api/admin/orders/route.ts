import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id, status, paymentStatus, trackingNumber, courierName, notes } = await request.json();

    if (!id) return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    const wasCancelled = ['CANCELLED', 'REFUNDED'].includes(existingOrder.status);
    const isNowCancelled = status && ['CANCELLED', 'REFUNDED'].includes(status) && !wasCancelled;

    const updated = await prisma.$transaction(async (tx) => {
      // If order is newly cancelled or refunded, restore stock!
      if (isNowCancelled) {
        for (const item of existingOrder.items) {
          if (!item.productId) continue;
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { inventoryQty: { increment: item.quantity } },
            });
            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                changeQty: item.quantity,
                previousQty: 0,
                newQty: item.quantity,
                reason: 'ORDER_CANCELLED_RESTOCK',
                referenceId: existingOrder.orderNumber,
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                inventoryQty: { increment: item.quantity },
                availability: 'IN_STOCK',
              },
            });
            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                changeQty: item.quantity,
                previousQty: 0,
                newQty: item.quantity,
                reason: 'ORDER_CANCELLED_RESTOCK',
                referenceId: existingOrder.orderNumber,
              },
            });
          }
        }
      }

      const ord = await tx.order.update({
        where: { id },
        data: {
          status: status || existingOrder.status,
          paymentStatus: paymentStatus || existingOrder.paymentStatus,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber,
          courierName: courierName !== undefined ? courierName : existingOrder.courierName,
          notes: notes !== undefined ? notes : existingOrder.notes,
        },
        include: { items: true },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: 'ORDER_STATUS_UPDATED',
          details: JSON.stringify({
            orderNumber: ord.orderNumber,
            oldStatus: existingOrder.status,
            newStatus: ord.status,
          }),
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order #${updated.orderNumber} updated to ${updated.status}.`,
    });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update order' }, { status: 500 });
  }
}
