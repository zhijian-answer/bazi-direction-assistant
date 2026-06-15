import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "当前账号没有后台权限" }, { status: 403 });
  }
  const db = await readDb();
  const today = new Date().toISOString().slice(0, 10);
  const todayQuestions = db.questions.filter((question) => question.createdAt.slice(0, 10) === today);
  const localQuestions = db.questions.filter((question) => question.usage.source === "local").length;
  const openaiQuestions = db.questions.filter((question) => question.usage.source === "openai").length;

  return NextResponse.json({
    users: db.users.length,
    profiles: db.profiles.length,
    questions: db.questions.length,
    todayQuestions: todayQuestions.length,
    localQuestions,
    openaiQuestions,
    estimatedTokens: db.questions.reduce(
      (total, question) => total + question.usage.estimatedTokens,
      0,
    ),
    latestQuestions: db.questions.slice(-8).reverse().map((question) => ({
      id: question.id,
      category: question.category,
      question: question.question,
      source: question.usage.source,
      createdAt: question.createdAt,
    })),
  });
}
