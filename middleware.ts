import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'wb_role';

export function middleware(request: NextRequest): NextResponse {
  const role = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = role === 'cowo' || role === 'cewe';

  if (request.nextUrl.pathname.startsWith('/app') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL(`/app/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login'],
};
