import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || null;

    // Check if email already registered
    const existingEmail = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Check if phone already registered
    if (cleanPhone) {
      const existingPhone = await prisma.customer.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: 'An account with this phone number already exists. Please log in.' },
          { status: 400 }
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
      },
    });

    const token = createCustomerToken({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      message: `Account created successfully. Welcome to Vedik Vana, ${customer.name}!`,
      redirectUrl: '/account',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create customer account.' },
      { status: 500 }
    );
  }
}
