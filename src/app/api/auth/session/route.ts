import { NextResponse } from 'next/server';
import { getCustomerSession, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = getCustomerSession();
  const admin = getAdminSession();

  return NextResponse.json({
    success: true,
    customer,
    admin,
    isAuthenticated: Boolean(customer || admin),
  });
}
