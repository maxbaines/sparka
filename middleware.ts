import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Apply route-based authentication checks and issue conditional redirects for incoming requests.
 *
 * Bypasses API auth, metadata, tRPC, and chat API routes; allows public pages (share, models, compare, login, register)
 * to proceed; redirects authenticated users away from login/register to the root; requires authentication for
 * protected chat subpaths and redirects unauthenticated users to `/login`.
 *
 * @param req - The incoming NextRequest to evaluate
 * @returns A Response that performs an HTTP redirect when a redirect is required, `undefined` otherwise
 */
export default async function middleware(req: NextRequest) {
  // Mirror previous authorized() logic using Better Auth session
  const url = req.nextUrl;
  const isApiAuthRoute = url.pathname.startsWith('/api/auth');
  if (isApiAuthRoute) return;

  const isMetadataRoute =
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/manifest.webmanifest';
  if (isMetadataRoute) return;

  const isTrpcApi = url.pathname.startsWith('/api/trpc');
  if (isTrpcApi) return;

  const isChatApiRoute = url.pathname === '/api/chat';
  if (isChatApiRoute) return;

  const session = await auth.api.getSession({ headers: req.headers });
  const isLoggedIn = !!session?.user;

  const isOnChat = url.pathname.startsWith('/');
  const isOnModels = url.pathname.startsWith('/models');
  const isOnCompare = url.pathname.startsWith('/compare');
  const isOnLoginPage = url.pathname.startsWith('/login');
  const isOnRegisterPage = url.pathname.startsWith('/register');
  const isOnSharePage = url.pathname.startsWith('/share/');

  if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
    return Response.redirect(new URL('/', url));
  }
  if (isOnRegisterPage || isOnLoginPage) return;
  if (isOnSharePage) return;
  if (isOnModels || isOnCompare) return;

  if (isOnChat) {
    if (url.pathname === '/') return;
    if (isLoggedIn) return;
    return Response.redirect(new URL('/login', url));
  }

  if (isLoggedIn) {
    return Response.redirect(new URL('/', url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, opengraph-image (favicon and og image)
     * - manifest files (.json, .webmanifest)
     * - Images and other static assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     * - models
     * - compare
     */
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|manifest|models|compare|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest)$).*)',
  ],
};