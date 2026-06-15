import { NextResponse } from "next/server";
import { getSessionToken, sessionCookieName } from "@/lib/auth";
import { deleteSession } from "@/lib/store";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await deleteSession(token);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(sessionCookieName);
  return response;
}
