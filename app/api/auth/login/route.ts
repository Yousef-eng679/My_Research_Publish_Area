import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    // Extract IP address from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // Enforce Rate Limit: max 5 attempts per 15 mins (900,000ms)
    const rateCheck = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Account temporarily locked. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { error: `Invalid credentials. (${rateCheck.remainingAttempts} attempts remaining)` },
        { status: 401 }
      );
    }

    // Successful login - clear rate limit counter for this IP
    clearRateLimit(ip);

    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) {
      return NextResponse.json({ error: "JWT_SECRET is not configured" }, { status: 500 });
    }

    // Sign the JWT token
    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    // Set JWT in HttpOnly secure cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7200, // 2 hours
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
