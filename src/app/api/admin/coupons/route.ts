import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderValuePaise = 0, maxDiscountPaise, usageLimit } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ success: false, message: 'Code, discount type, and value are required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValuePaise: Number(minOrderValuePaise),
        maxDiscountPaise: maxDiscountPaise ? Number(maxDiscountPaise) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon, message: 'Coupon created successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id, isActive, discountValue, minOrderValuePaise, maxDiscountPaise, usageLimit } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        minOrderValuePaise: minOrderValuePaise !== undefined ? Number(minOrderValuePaise) : undefined,
        maxDiscountPaise: maxDiscountPaise !== undefined ? Number(maxDiscountPaise) : undefined,
        usageLimit: usageLimit !== undefined ? Number(usageLimit) : undefined,
      },
    });

    return NextResponse.json({ success: true, coupon, message: 'Coupon updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
