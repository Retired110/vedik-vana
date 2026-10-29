import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, subtotalPaise } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Coupon code is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon code.' });
    }

    // Check expiration
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its maximum usage limit.' });
    }

    // Check minimum order value
    if (subtotalPaise < coupon.minOrderValuePaise) {
      const minRupees = Math.round(coupon.minOrderValuePaise / 100);
      return NextResponse.json({
        valid: false,
        message: `This coupon requires a minimum cart value of ₹${minRupees}.`,
      });
    }

    // Calculate discount
    let discountPaise = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
      if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
        discountPaise = coupon.maxDiscountPaise;
      }
    } else {
      discountPaise = Math.min(coupon.discountValue, subtotalPaise);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountPaise,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, message: 'Server error validating coupon.' }, { status: 500 });
  }
}
