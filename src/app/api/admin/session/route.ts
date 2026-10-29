import { NextResponse } from 'next/server';
import { clearAdminCookie, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  clearAdminCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully.' });
}

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
