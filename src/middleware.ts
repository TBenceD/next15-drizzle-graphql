import { getSessionCookie } from 'better-auth/cookies';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { LOCALE_MATCH_REGEX, LOCALE_REGEX } from './config/common';
import { routing } from './i18n/routing';
import { publicRoutes } from './route';
import { headers } from 'next/headers';
import { auth } from './lib/auth';
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = getSessionCookie(request);

  // Handle i18n routing first
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);

  // Extract the pathname without locale for route checking
  const pathnameWithoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);

  const localeMatch = pathname.match(LOCALE_MATCH_REGEX);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  if (isPublicRoute && sessionCookie) {
    const authUrl = new URL('/', request.url);
    return NextResponse.redirect(authUrl);
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response;
  }

  if (!sessionCookie) {
    const authUrl = new URL(`/${locale}/auth`, request.url);
    return NextResponse.redirect(authUrl);
  }

  if (sessionCookie) {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      const loginUrl = new URL(`/${locale}/auth`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
