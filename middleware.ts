// middleware.ts — place in project ROOT (same level as src/)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Logged-in users visiting auth pages → redirect to dashboard
    if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // /admin requires ADMIN role
    if (pathname.startsWith("/admin")) {
      if (!token) return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin", req.url));
      if (token.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes — no auth required
        if (
          pathname.startsWith("/auth/") ||
          pathname === "/" ||
          pathname.startsWith("/pages/") ||
          pathname === "/contact" ||
          pathname.startsWith("/api/contact")
        ) return true;
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*", "/pages/:path*", "/contact"],
};
