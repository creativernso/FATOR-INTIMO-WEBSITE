import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'fi_session';
const LOCALE_COOKIE = 'fi-locale';
const SUPPORTED_LOCALES = ['en', 'fr'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(SESSION_COOKIE);
    const isAuthenticated = !!session?.value;

    if (pathname === '/admin/login') {
      if (isAuthenticated) return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.next();
    }

    if (!isAuthenticated) return NextResponse.redirect(new URL('/admin/login', request.url));
    return NextResponse.next();
  }

  // ── Locale routing for public pages ─────────────────────────────────────────
  const localeMatch = pathname.match(/^\/(en|fr)(\/.*)?$/);
  const urlLocale = localeMatch?.[1] ?? null;
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    urlLocale ??
    (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale) ? cookieLocale : 'pt');

  let response: NextResponse;

  if (urlLocale) {
    const rewritePath = localeMatch![2] || '/';
    response = NextResponse.rewrite(new URL(rewritePath, request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set('x-locale', locale);

  if (urlLocale && cookieLocale !== urlLocale) {
    response.cookies.set(LOCALE_COOKIE, urlLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js)).*)',
  ],
};
