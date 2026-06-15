import { NextResponse } from "next/server";
import { createSession, publicUser, readDb, verifyPassword } from "@/lib/store";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { appLimits } from "@/lib/limits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, "auth:login", appLimits.rateLimitLogin);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const db = await readDb();
    const user = db.users.find((item) => item.email === email);
    if (!user || !verifyPassword(password, user)) {
      return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
    }
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: publicUser(user) });
    response.cookies.set(sessionCookieName, session.token, sessionCookieOptions(session.expiresAt));
    return response;
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 400 });
  }
}
