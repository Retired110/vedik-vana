/**
 * Universal Web-Crypto HMAC SHA-256 Token Engine
 * Fully compatible with Next.js Edge Middleware and Node.js Server Runtimes.
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vedikvana_super_secret_2026';
const CUSTOMER_SECRET = process.env.CUSTOMER_SECRET || 'vedikvana_customer_secret_2026';

export interface AdminPayload {
  userId: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'INVENTORY' | 'ORDERS' | 'ADMIN' | 'STAFF';
  uniqueStaffId?: string | null;
  expiresAt: number;
}

export interface CustomerPayload {
  customerId: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  expiresAt: number;
}

function stringToUint8Array(str: string): BufferSource {
  const enc = new TextEncoder().encode(str);
  return new Uint8Array(enc.buffer, enc.byteOffset, enc.byteLength);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    stringToUint8Array(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAdminPayload(payload: Omit<AdminPayload, 'expiresAt'>): Promise<string> {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = JSON.stringify({ ...payload, expiresAt });
  const encodedData = btoa(unescape(encodeURIComponent(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await getHmacKey(ADMIN_SECRET);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, stringToUint8Array(encodedData));
  const signature = bufferToHex(sigBuffer);

  return `${encodedData}.${signature}`;
}

export async function verifyAdminPayload(token: string): Promise<AdminPayload | null> {
  try {
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) return null;

    const key = await getHmacKey(ADMIN_SECRET);
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, stringToUint8Array(encodedData));
    const expectedSig = bufferToHex(expectedSigBuffer);

    if (signature !== expectedSig) return null;

    const jsonStr = decodeURIComponent(escape(atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'))));
    const payload: AdminPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function signCustomerPayload(payload: Omit<CustomerPayload, 'expiresAt'>): Promise<string> {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = JSON.stringify({ ...payload, role: 'customer', expiresAt });
  const encodedData = btoa(unescape(encodeURIComponent(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await getHmacKey(CUSTOMER_SECRET);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, stringToUint8Array(encodedData));
  const signature = bufferToHex(sigBuffer);

  return `${encodedData}.${signature}`;
}

export async function verifyCustomerPayload(token: string): Promise<CustomerPayload | null> {
  try {
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) return null;

    const key = await getHmacKey(CUSTOMER_SECRET);
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, stringToUint8Array(encodedData));
    const expectedSig = bufferToHex(expectedSigBuffer);

    if (signature !== expectedSig) return null;

    const jsonStr = decodeURIComponent(escape(atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'))));
    const payload: CustomerPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}
