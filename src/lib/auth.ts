import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vedikvana_super_secret_2026';
const CUSTOMER_SECRET = process.env.CUSTOMER_SECRET || 'vedikvana_customer_secret_2026';

const ADMIN_COOKIE_NAME = 'vv_admin_session';
const CUSTOMER_COOKIE_NAME = 'vv_customer_session';

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  uniqueStaffId?: string | null;
  expiresAt: number;
}

export interface CustomerSession {
  customerId: string;
  email: string;
  name: string;
  phone?: string | null;
  expiresAt: number;
}

// --- Admin Auth ---

export function createAdminToken(session: Omit<AdminSession, 'expiresAt'>): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = Buffer.from(JSON.stringify({ ...session, expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
    if (signature !== expectedSig) return null;

    const jsonStr = Buffer.from(data, 'base64url').toString('utf-8');
    const session: AdminSession = JSON.parse(jsonStr);
    if (Date.now() > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function setAdminCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function clearAdminCookie() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// --- Customer Auth ---

export function createCustomerToken(session: Omit<CustomerSession, 'expiresAt'>): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = Buffer.from(JSON.stringify({ ...session, expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', CUSTOMER_SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

export function verifyCustomerToken(token: string): CustomerSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSig = crypto.createHmac('sha256', CUSTOMER_SECRET).update(data).digest('hex');
    if (signature !== expectedSig) return null;

    const jsonStr = Buffer.from(data, 'base64url').toString('utf-8');
    const session: CustomerSession = JSON.parse(jsonStr);
    if (Date.now() > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

export function getCustomerSession(): CustomerSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function setCustomerCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function clearCustomerCookie() {
  const cookieStore = cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}
