import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createAdminToken, setAdminCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.staffId || body.uniqueStaffId || body.identifier;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Merchant Email or Staff ID and password are required.' }, { status: 400 });
    }

    const clean = identifier.trim();

    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: clean.toLowerCase() },
          { uniqueStaffId: clean.toUpperCase() },
          { uniqueStaffId: clean },
        ],
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid merchant credentials or inactive staff account.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 });
    }

    const token = createAdminToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      uniqueStaffId: admin.uniqueStaffId,
    });

    setAdminCookie(token);

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userName: admin.name,
        action: 'ADMIN_LOGIN',
        details: JSON.stringify({ email: admin.email, staffId: admin.uniqueStaffId, role: admin.role }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        uniqueStaffId: admin.uniqueStaffId,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, message: 'Server error during authentication.' }, { status: 500 });
  }
}
