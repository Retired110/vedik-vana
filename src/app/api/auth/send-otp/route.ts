import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createAndSendOtp } from '@/lib/otp-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identifier, type = 'LOGIN', channel = 'AUTO', checkOnly = false } = await request.json();

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid mobile number or email address.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. If Login OTP: Verify that account exists first!
    if (type === 'LOGIN') {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone: cleanIdentifier },
            { phone: cleanIdentifier.replace(/\s+/g, '') },
            { phone: cleanIdentifier.startsWith('+91') ? cleanIdentifier.slice(3) : `+91${cleanIdentifier}` },
            { email: cleanIdentifier },
          ],
        },
      });

      if (!existingCustomer) {
        return NextResponse.json(
          {
            success: false,
            noAccount: true,
            message: 'No account found with this number or email. Create one?',
          },
          { status: 404 }
        );
      }
    }

    // 2. If Registration OTP: Check if already registered
    if (type === 'REGISTRATION') {
      const alreadyExists = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone: cleanIdentifier },
            { phone: cleanIdentifier.replace(/\s+/g, '') },
            { phone: cleanIdentifier.startsWith('+91') ? cleanIdentifier.slice(3) : `+91${cleanIdentifier}` },
            { email: cleanIdentifier },
          ],
        },
      });

      if (alreadyExists) {
        return NextResponse.json(
          {
            success: false,
            alreadyRegistered: true,
            message: 'An account already exists with this mobile number. Please sign in.',
          },
          { status: 400 }
        );
      }
    }

    // If checkOnly is requested (used before client-side Firebase Phone Auth), return early
    if (checkOnly) {
      return NextResponse.json({ success: true, verifiedAccount: true, identifier: cleanIdentifier });
    }

    // 3. Dispatch OTP with hashing, throttling, and server-only dev logging
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const result = await createAndSendOtp(cleanIdentifier, type, ipAddress, channel);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, cooldownRemaining: result.cooldownRemaining },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      identifier: cleanIdentifier,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
