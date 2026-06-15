import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateGuidance } from "@/lib/ai";
import { appLimits } from "@/lib/limits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { addQuestionWithDailyLimit, newId, questionsToday, readDb } from "@/lib/store";
import type { GuidanceQuestion, QuestionCategory } from "@/lib/types";

const categories = [
  "direction",
  "career",
  "relationship",
  "study",
  "wealth",
  "timing",
  "emotion",
  "custom",
];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const rateLimit = checkRateLimit(
      request,
      `question:write:${user.id}`,
      appLimits.rateLimitQuestionWrite,
    );
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const db = await readDb();
    const usedToday = questionsToday(db.questions, user.id).length;
    if (usedToday >= user.dailyQuestionLimit) {
      return NextResponse.json({ error: "今天的免费提问次数已用完，明天再来。" }, { status: 429 });
    }

    const body = await request.json();
    const profile = db.profiles.find(
      (item) => item.id === body.profileId && item.userId === user.id,
    );
    if (!profile) {
      return NextResponse.json({ error: "请先创建命盘档案" }, { status: 400 });
    }
    const question = String(body.question || "").trim();
    if (question.length < 4) {
      return NextResponse.json({ error: "问题再具体一点，至少 4 个字" }, { status: 400 });
    }
    if (question.length > appLimits.maxQuestionChars) {
      return NextResponse.json(
        { error: `问题最多 ${appLimits.maxQuestionChars} 个字，请再精简一点` },
        { status: 400 },
      );
    }
    const category = (categories.includes(body.category) ? body.category : "custom") as QuestionCategory;
    const guidance = await generateGuidance({ user, profile, question, category });
    const record: GuidanceQuestion = {
      id: newId("question"),
      userId: user.id,
      profileId: profile.id,
      category,
      question,
      answer: guidance.answer,
      createdAt: new Date().toISOString(),
      usage: guidance.usage,
    };
    await addQuestionWithDailyLimit(record, user.dailyQuestionLimit);
    return NextResponse.json({
      question: record,
      remainingToday: Math.max(0, user.dailyQuestionLimit - usedToday - 1),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成建议失败" },
      { status: 400 },
    );
  }
}
