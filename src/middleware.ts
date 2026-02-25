import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_REDIRECTS: Record<string, string> = {
  "/login": "/auth/login",
  "/register": "/auth/register",
  "/forgot-password": "/auth/forgot-password",
  "/reset-password": "/auth/reset-password",
  "/verify-email": "/auth/verify-email",
};

/** UUID v4 pattern for legacy /:organizationId routes (redirect to /areas/:areaId). */
const UUID_FIRST_SEGMENT = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\/.*)?$/i;

/** Paths that start with a UUID but are already namespaced correctly. */
const UUID_NAMESPACED_PREFIXES = ["/areas/", "/dependencias/"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const redirectTo = AUTH_REDIRECTS[pathname];
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    return NextResponse.redirect(url, 308);
  }

  // Redirect legacy /:organizationId/... to /areas/:areaId/... (308 permanent)
  const isNamespaced = UUID_NAMESPACED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  if (UUID_FIRST_SEGMENT.test(pathname) && !isNamespaced) {
    const url = request.nextUrl.clone();
    url.pathname = `/areas${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next({
    request,
  });
}
