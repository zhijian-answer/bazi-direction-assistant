import { cookies } from "next/headers";
import { findUserBySession, publicUser } from "./store";

export const sessionCookieName = "bazi_session";

export function sessionCookieOptions(expiresAt: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  const user = await findUserBySession(token);
  return user ? publicUser(user) : null;
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName)?.value;
}
