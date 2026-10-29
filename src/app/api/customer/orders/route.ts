import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer record not found.' }, { status: 404 });
    }

    // Also match any orders placed with this email or phone if customerId wasn't linked at checkout
    const emailOrders = await prisma.order.findMany({
      where: {
        customerEmail: customer.email,
        customerId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const combinedOrders = [...customer.orders, ...emailOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses ? JSON.parse(customer.addresses) : [],
      },
      orders: combinedOrders,
    });
  } catch (error: any) {
    console.error('Fetch customer orders error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch customer orders' }, { status: 500 });
  }
}
