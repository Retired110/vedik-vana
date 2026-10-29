import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, name, email } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Verified phone number is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10); // Standard 10 digits

    // 1. Look for existing customer with this phone
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: `91${cleanPhone}` },
        ],
      },
    });

    // 2. If customer doesn't exist, create an account
    if (!customer) {
      const customerName = name?.trim() || `Customer ${cleanPhone.slice(-4)}`;
      const customerEmail = email?.trim().toLowerCase() || `${cleanPhone}@vedikvana.account`;

      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: cleanPhone,
          email: customerEmail,
        },
      });
    }

    // 3. Issue secure customer session
    const token = createCustomerToken({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${customer.name}!`,
      redirectUrl: '/account',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error('Firebase verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
