import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appLimits } from "@/lib/limits";
import { mobileChatRequestSchema } from "@/lib/mobile/chatAiSchema";
import { resolveMobileChatAnswer } from "@/lib/mobile/chatService";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { addQuestionWithDailyLimit, newId, questionsToday, readDb } from "@/lib/store";
import type { GuidanceQuestion, QuestionCategory } from "@/lib/types";

const categoryMap = {
  self: "custom",
  relationship: "relationship",
  career: "career",
  timing: "timing",
  emotion: "emotion",
  wealth: "wealth",
} satisfies Record<string, QuestionCategory>;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "mobile-chat:write", appLimits.rateLimitChatWrite);
  if (!rateLimit.ok) return rateLimitResponse(rateLimit.resetAt);
  const user = await getCurrentUser();
  const dailyLimit = checkRateLimit(
    request,
    user ? `mobile-chat:daily:${user.id}` : "mobile-chat:daily:guest",
    user?.dailyQuestionLimit ?? appLimits.rateLimitChatDaily,
    appLimits.rateLimitDayWindowMs,
  );
  if (!dailyLimit.ok) return rateLimitResponse(dailyLimit.resetAt);

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 32_000) {
      return NextResponse.json({ error: "对话内容过长，请先开始一段新对话" }, { status: 413 });
    }
    const input = mobileChatRequestSchema.parse(await request.json());
    if (user) {
      const db = await readDb();
      if (questionsToday(db.questions, user.id).length >= user.dailyQuestionLimit) {
        return NextResponse.json({ error: "今天的免费解读次数已用完，明天再来。" }, { status: 429 });
      }
    }
    const answer = await resolveMobileChatAnswer(input);
    const saved = await saveAuthenticatedAnswer(
      input.profile.cloudProfileId,
      input.question,
      answer,
      user?.id,
      user?.dailyQuestionLimit,
    );
    return NextResponse.json({ answer, saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message.slice(0, 200) : "暂时无法整理这条问题" },
      { status: 400 },
    );
  }
}

async function saveAuthenticatedAnswer(
  cloudProfileId: string | undefined,
  question: string,
  answer: Awaited<ReturnType<typeof resolveMobileChatAnswer>>,
  userId: string | undefined,
  dailyQuestionLimit: number | undefined,
) {
  if (!cloudProfileId || !userId || !dailyQuestionLimit) return false;
  const db = await readDb();
  const profile = db.profiles.find((item) => item.id === cloudProfileId && item.userId === userId);
  if (!profile) return false;

  const record: GuidanceQuestion = {
    id: newId("question"),
    userId,
    profileId: profile.id,
    category: categoryMap[answer.category],
    question,
    answer: `${answer.title}\n\n${answer.summary}\n\n现在可以做：${answer.action}`,
    createdAt: new Date().toISOString(),
    usage: {
      source: answer.delivery.source,
      model: answer.delivery.model,
      estimatedTokens: Math.ceil(JSON.stringify(answer).length / 2),
    },
  };
  await addQuestionWithDailyLimit(record, dailyQuestionLimit);
  return true;
}
