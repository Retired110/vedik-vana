import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { productId, customerName, customerEmail, rating, title, comment } = await request.json();

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json({ success: false, message: 'Name, rating, and review comments are required.' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        rating: Math.min(5, Math.max(1, Number(rating))),
        title: title?.trim() || null,
        comment: comment.trim(),
        isVerifiedPurchase: true,
        isApproved: true, // auto-approved with admin moderation power
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Thank you! Your botanical review has been published.',
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit review' }, { status: 500 });
  }
}
