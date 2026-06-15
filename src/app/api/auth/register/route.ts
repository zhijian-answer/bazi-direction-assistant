import { NextResponse } from "next/server";
import { createSession, createUser, publicUser } from "@/lib/store";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { appLimits } from "@/lib/limits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, "auth:register", appLimits.rateLimitRegister);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const user = await createUser({
      name: String(body.name || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
    });
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: publicUser(user) });
    response.cookies.set(sessionCookieName, session.token, sessionCookieOptions(session.expiresAt));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败" },
      { status: 400 },
    );
  }
}
