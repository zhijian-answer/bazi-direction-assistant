import { NextResponse } from "next/server";
import { getCurrentUser, sessionCookieName } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { deleteUserData, questionsToday, readDb } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      user: null,
      profiles: [],
      questions: [],
      checkins: [],
      remainingToday: 0,
      isAdmin: false,
    });
  }
  const db = await readDb();
  const profiles = db.profiles.filter((profile) => profile.userId === user.id);
  const questions = db.questions
    .filter((question) => question.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const checkins = db.checkins
    .filter((checkin) => checkin.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
  const usedToday = questionsToday(db.questions, user.id).length;
  return NextResponse.json({
    user,
    isAdmin: isAdminUser(user),
    profiles,
    questions,
    checkins,
    remainingToday: Math.max(0, user.dailyQuestionLimit - usedToday),
  });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const deleted = await deleteUserData(user.id);
  const response = NextResponse.json({ ok: true, deleted });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
