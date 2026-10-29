import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAdminSession, createAdminToken, setAdminCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, uniqueStaffId: true, role: true },
    });

    return NextResponse.json({ success: true, user: admin });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch admin profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { name, email, uniqueStaffId, newPassword } = await request.json();

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name.trim();
    if (email) dataToUpdate.email = email.trim().toLowerCase();
    if (uniqueStaffId) dataToUpdate.uniqueStaffId = uniqueStaffId.trim().toUpperCase();

    if (newPassword && newPassword.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    }

    const updated = await prisma.adminUser.update({
      where: { id: session.userId },
      data: dataToUpdate,
    });

    const token = createAdminToken({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      uniqueStaffId: updated.uniqueStaffId,
    });
    setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Merchant security credentials updated successfully!',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        uniqueStaffId: updated.uniqueStaffId,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error('Update admin profile error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update credentials' }, { status: 500 });
  }
}
