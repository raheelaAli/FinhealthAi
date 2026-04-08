// middleware.ts  (must be in project ROOT, not inside src)
// Runs on every request — redirects:
//   - Logged-in users away from /auth/* → /dashboard
//   - Logged-out users away from /dashboard/* → /auth/login

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If logged in and trying to visit auth pages → redirect to dashboard
    if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run middleware logic on auth pages + dashboard
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Dashboard requires auth
        if (pathname.startsWith("/dashboard")) return !!token;
        // Auth pages and everything else — always allow (middleware fn handles redirect)
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
