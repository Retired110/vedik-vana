import { NextResponse } from 'next/server';
import { clearCustomerCookie, clearAdminCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  clearCustomerCookie();
  clearAdminCookie();

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
}
