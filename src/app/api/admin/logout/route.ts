import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth';

export async function POST() {
  clearAdminCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully.' });
}
