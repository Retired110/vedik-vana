import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie } from '@/lib/auth';
import { verifyOtpCode } from '@/lib/otp-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identifier, code, type = 'LOGIN', name, password, email, phone } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, message: 'Please provide verification code and email/phone.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    // 1. Verify OTP code using secure hashed verification service
    const verifyResult = await verifyOtpCode(cleanIdentifier, cleanCode, type);

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: verifyResult.message,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 2. Handle PASSWORD_RESET flow
    if (type === 'PASSWORD_RESET') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Mobile verified successfully. You may now enter your new password.',
      });
    }

    // 3. Handle CUSTOMER LOGIN flow (Strict: must have an existing registered account)
    if (type === 'LOGIN') {
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone: cleanIdentifier },
            { phone: cleanIdentifier.replace(/\s+/g, '') },
            { phone: cleanIdentifier.startsWith('+91') ? cleanIdentifier.slice(3) : `+91${cleanIdentifier}` },
            { email: cleanIdentifier },
          ],
        },
      });

      if (!customer) {
        return NextResponse.json(
          {
            success: false,
            noAccount: true,
            message: 'No account found for this mobile number. Please create an account.',
          },
          { status: 404 }
        );
      }

      // Generate secure Customer session token and set httpOnly cookie
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
    }

    // 4. Handle CUSTOMER REGISTRATION flow
    if (type === 'REGISTRATION') {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: 'Please provide your full name for delivery.' },
          { status: 400 }
        );
      }

      // Check if phone or email already registered
      const isEmail = cleanIdentifier.includes('@');
      const customerPhone = phone?.trim() || (!isEmail ? cleanIdentifier : null);
      const customerEmail = email?.trim().toLowerCase() || (isEmail ? cleanIdentifier : null);

      if (!customerEmail || !customerEmail.includes('@')) {
        return NextResponse.json(
          { success: false, message: 'A valid email address is required to register an account.' },
          { status: 400 }
        );
      }

      const existingByEmail = await prisma.customer.findUnique({
        where: { email: customerEmail },
      });

      if (existingByEmail) {
        return NextResponse.json(
          { success: false, message: 'An account is already registered with this email address.' },
          { status: 400 }
        );
      }

      if (customerPhone) {
        const existingByPhone = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone: customerPhone },
              { phone: customerPhone.replace(/\s+/g, '') },
            ],
          },
        });
        if (existingByPhone) {
          return NextResponse.json(
            { success: false, message: 'An account is already registered with this mobile number.' },
            { status: 400 }
          );
        }
      }

      let passwordHash: string | null = null;
      if (password && password.trim().length >= 6) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password.trim(), salt);
      }

      const newCustomer = await prisma.customer.create({
        data: {
          name: name.trim(),
          email: customerEmail,
          phone: customerPhone,
          passwordHash,
          addresses: '[]',
        },
      });

      const token = createCustomerToken({
        customerId: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        phone: newCustomer.phone,
      });

      setCustomerCookie(token);

      return NextResponse.json({
        success: true,
        userType: 'CUSTOMER',
        redirectUrl: '/account',
        message: `Welcome to Vedik Vana, ${newCustomer.name}! Your account has been created.`,
        customer: {
          id: newCustomer.id,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid verification type.' }, { status: 400 });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
