import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your registered email/phone and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Customer Authentication Only (Admin authentication lives strictly at /admin/login)
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
          { phone: cleanIdentifier.replace(/\s+/g, '') },
          { phone: cleanIdentifier.startsWith('+91') ? cleanIdentifier.slice(3) : `+91${cleanIdentifier}` },
        ],
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          noAccount: true,
          message: 'No account found with this email or mobile number. Please create an account.',
        },
        { status: 404 }
      );
    }

    if (!customer.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: 'This account uses Mobile OTP login. Please switch to Mobile OTP tab to sign in.',
        },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again or use Mobile OTP.' },
        { status: 401 }
      );
    }

    // Issue Customer JWT session and set httpOnly cookie
    const token = createCustomerToken({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      userType: 'CUSTOMER',
      redirectUrl: '/account',
      message: `Welcome back, ${customer.name}!`,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
