import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminPayload, verifyCustomerPayload } from '@/lib/jwt-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Page Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      const adminCookie = request.cookies.get('vv_admin_session')?.value;
      if (adminCookie) {
        const session = await verifyAdminPayload(adminCookie);
        if (session) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // All other /admin routes require verified admin session
    const adminCookie = request.cookies.get('vv_admin_session')?.value;
    if (!adminCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminPayload(adminCookie);
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('vv_admin_session');
      return res;
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-role', session.role);
    return applySecurityHeaders(response);
  }

  // 2. Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/login') {
      return applySecurityHeaders(NextResponse.next());
    }

    const adminCookie = request.cookies.get('vv_admin_session')?.value;
    if (!adminCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin authentication required.' },
        { status: 401 }
      );
    }

    const session = await verifyAdminPayload(adminCookie);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session expired or invalid. Please re-authenticate.' },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-role', session.role);
    return applySecurityHeaders(response);
  }

  // 3. Customer Account Routes (/account/*)
  if (pathname.startsWith('/account')) {
    const customerCookie = request.cookies.get('vv_customer_session')?.value;
    if (!customerCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyCustomerPayload(customerCookie);
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('vv_customer_session');
      return res;
    }

    const response = NextResponse.next();
    response.headers.set('x-customer-id', session.customerId);
    return applySecurityHeaders(response);
  }

  return applySecurityHeaders(NextResponse.next());
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/account/:path*',
  ],
};
