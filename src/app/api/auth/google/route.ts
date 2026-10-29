import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, photoUrl } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid Google account email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Look for existing customer by email
    let customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    // 2. If new customer, register them automatically with their Google profile details
    if (!customer) {
      const customerName = name?.trim() || cleanEmail.split('@')[0];

      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: cleanEmail,
        },
      });
    }

    // 3. Issue secure customer session token
    const token = createCustomerToken({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      message: `Welcome, ${customer.name}!`,
      redirectUrl: '/account',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error('Google Sign-In API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to authenticate with Google.' },
      { status: 500 }
    );
  }
}
