import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createAndSendOtp, verifyOtpCode } from '@/lib/otp-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const step = body.step || (body.action === 'RESET_PASSWORD' ? 'RESET_PASSWORD' : 'REQUEST_OTP');
    const { identifier, code, newPassword } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide your registered email, mobile number, or staff ID.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    if (step === 'REQUEST_OTP') {
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { phone: cleanIdentifier },
            { phone: cleanIdentifier.replace(/\s+/g, '') },
          ],
        },
      });

      const admin = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { uniqueStaffId: cleanIdentifier.toUpperCase() },
          ],
        },
      });

      if (!customer && !admin) {
        return NextResponse.json(
          { success: false, message: 'No registered account found with this identifier.' },
          { status: 404 }
        );
      }

      const ipAddress = request.headers.get('x-forwarded-for') || undefined;
      const result = await createAndSendOtp(cleanIdentifier, 'PASSWORD_RESET', ipAddress);

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.message, cooldownRemaining: result.cooldownRemaining },
          { status: 429 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Password reset verification code dispatched to ${cleanIdentifier}.`,
        identifier: cleanIdentifier,
      });
    }

    if (step === 'RESET_PASSWORD') {
      if (!code || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Verification code and new password are required.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      const verifyResult = await verifyOtpCode(cleanIdentifier, code, 'PASSWORD_RESET');
      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, message: verifyResult.message, remainingAttempts: verifyResult.remainingAttempts },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { phone: cleanIdentifier },
            { phone: cleanIdentifier.replace(/\s+/g, '') },
          ],
        },
      });

      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { passwordHash },
        });
      }

      const admin = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { uniqueStaffId: cleanIdentifier.toUpperCase() },
          ],
        },
      });

      if (admin) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { passwordHash },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new credentials.',
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown step' }, { status: 400 });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Password reset failed.' },
      { status: 500 }
    );
  }
}
