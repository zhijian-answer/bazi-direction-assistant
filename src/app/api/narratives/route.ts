import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { resolveNarrative } from "@/lib/narrative/service";
import { narrativeRequestSchema } from "@/lib/narrative/schema";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "narrative:write", 24);
  if (!rateLimit.ok) return rateLimitResponse(rateLimit.resetAt);

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_000) {
      return NextResponse.json({ error: "文案请求内容过长" }, { status: 413 });
    }
    const input = narrativeRequestSchema.parse(await request.json());
    return NextResponse.json(await resolveNarrative(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message.slice(0, 240) : "文案请求格式不正确" },
      { status: 400 },
    );
  }
}
