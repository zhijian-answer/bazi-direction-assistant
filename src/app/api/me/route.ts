import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { questionsToday, readDb } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      user: null,
      profiles: [],
      questions: [],
      remainingToday: 0,
      isAdmin: false,
    });
  }
  const db = await readDb();
  const profiles = db.profiles.filter((profile) => profile.userId === user.id);
  const questions = db.questions
    .filter((question) => question.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const usedToday = questionsToday(db.questions, user.id).length;
  return NextResponse.json({
    user,
    isAdmin: isAdminUser(user),
    profiles,
    questions,
    remainingToday: Math.max(0, user.dailyQuestionLimit - usedToday),
  });
}
