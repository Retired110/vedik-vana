import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOrderConfirmationHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });

    const emailHtml = generateOrderConfirmationHtml(order, settings);

    if (format === 'html') {
      return new Response(emailHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      deliveryOtp: order.deliveryOtp,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalPaise: order.totalPaise,
      html: emailHtml,
    });
  } catch (error: any) {
    console.error('Fetch order email error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate order email' }, { status: 500 });
  }
}
