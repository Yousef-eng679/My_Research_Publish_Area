import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Proxy executing for path:", pathname);

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    // Admin Path Obscurity Defense: If ADMIN_PATH_SECRET is configured in env,
    // conceal standard /admin path from scanners by returning 404 if unauthenticated
    const secretPath = process.env.ADMIN_PATH_SECRET;
    if (!sessionCookie) {
      if (secretPath && !pathname.includes(secretPath)) {
        return new NextResponse("Not Found", { status: 404 });
      }
      console.log("Proxy: No session cookie found, redirecting to /login");
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secretStr = process.env.JWT_SECRET;
      if (!secretStr) {
        console.error("JWT_SECRET is missing from environment variables");
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Verify the JWT token
      const secret = new TextEncoder().encode(secretStr);
      const { payload } = await jwtVerify(sessionCookie, secret);

      // Verify payload username matches the current env configuration
      if (payload.username !== process.env.ADMIN_USERNAME) {
        console.warn("Proxy: Session username mismatch, redirecting to /login");
        const loginUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("admin_session");
        return response;
      }

      console.log("Proxy: Session verified successfully for:", payload.username);
      // Token is valid, proceed
      return NextResponse.next();
    } catch (err) {
      console.warn("Proxy: Invalid admin session token:", err);
      // Redirect to login if token is expired or invalid
      const loginUrl = new URL("/login", request.url);
      
      // Delete the invalid cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

// Limit the middleware to run only on /admin paths
export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
