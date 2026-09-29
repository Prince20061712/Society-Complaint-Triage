import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // If visiting /login:
  if (pathname === '/login') {
    if (session) {
      const destination = session.role === 'COMMITTEE' ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // If not authenticated:
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated as RESIDENT:
  if (session.role === 'RESIDENT') {
    // Residents cannot access Committee Dashboard or Complaints Register
    if (
      pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/') ||
      pathname === '/complaints' ||
      pathname.startsWith('/complaints/')
    ) {
      return NextResponse.redirect(new URL('/?denied=committee_access_required', request.url));
    }
  }

  // Committee has access to all protected routes (/dashboard, /complaints, /resident, /)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     * - api routes (handled separately in API handlers)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
