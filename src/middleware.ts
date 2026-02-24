import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_REDIRECTS: Record<string, string> = {
  "/login": "/auth/login",
  "/register": "/auth/register",
  "/forgot-password": "/auth/forgot-password",
  "/reset-password": "/auth/reset-password",
  "/verify-email": "/auth/verify-email",
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const redirectTo = AUTH_REDIRECTS[pathname];
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    // Mantener query (ej. ?token= para reset-password y verify-email)
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next({
    request,
  });
}
