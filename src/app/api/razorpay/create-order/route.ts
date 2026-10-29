import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    const keyId = settings?.razorpayKeyId || 'rzp_test_vedikvanaDemo123';

    // Mock Razorpay Order ID for sandbox/test mode
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId },
    });

    return NextResponse.json({
      success: true,
      keyId,
      amount: order.totalPaise,
      currency: 'INR',
      name: settings?.storeName || 'Vedik Vana',
      description: `Payment for Order #${order.orderNumber}`,
      orderId: razorpayOrderId,
      prefill: {
        name: order.customerName,
        email: order.customerEmail,
        contact: order.customerPhone,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to initiate Razorpay transaction.' }, { status: 500 });
  }
}
