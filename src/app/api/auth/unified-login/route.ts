import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createCustomerToken, setCustomerCookie, createAdminToken, setAdminCookie } from '@/lib/auth';
import { passwordLoginSchema } from '@/schemas/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = passwordLoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message || 'Please enter valid credentials.' },
        { status: 400 }
      );
    }

    const { identifier, password } = result.data;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Try Customer Account
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

    if (customer) {
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
    }

    // 2. Try Merchant Admin Account (Unified Sign-In support!)
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { uniqueStaffId: cleanIdentifier.toUpperCase() },
          { uniqueStaffId: cleanIdentifier },
        ],
      },
    });

    if (admin && admin.isActive) {
      const isAdminPasswordValid = await bcrypt.compare(password, admin.passwordHash);

      if (!isAdminPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Incorrect password for Merchant Admin account.' },
          { status: 401 }
        );
      }

      // Issue Admin JWT session and set httpOnly cookie
      const adminToken = createAdminToken({
        userId: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        uniqueStaffId: admin.uniqueStaffId,
      });

      setAdminCookie(adminToken);

      // Record audit log
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          userName: admin.name,
          action: 'ADMIN_LOGIN_VIA_MAIN_PORTAL',
          details: JSON.stringify({ email: admin.email, staffId: admin.uniqueStaffId, role: admin.role }),
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        userType: 'ADMIN',
        redirectUrl: '/admin',
        message: `Welcome back, ${admin.name}! Redirecting to Merchant Panel...`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        noAccount: true,
        message: 'No account found with this email or mobile number. Please create an account.',
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
