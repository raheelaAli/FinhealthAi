// middleware.ts  (goes in project ROOT, not inside src/)
// Protects /dashboard routes — redirects to login if not authenticated
// Redirects already-logged-in users away from /auth pages to /dashboard

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If logged in and trying to access auth pages → redirect to dashboard
    if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin-only route guard
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run middleware on protected routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Auth pages are always accessible
        if (pathname.startsWith("/auth/") || pathname === "/") return true;
        // Everything under /dashboard requires a token
        if (pathname.startsWith("/dashboard")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
