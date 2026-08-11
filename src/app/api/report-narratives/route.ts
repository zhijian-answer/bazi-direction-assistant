import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { reportNarrativeRequestSchema } from "@/lib/narrative/reportSchema";
import { resolveReportNarrative } from "@/lib/narrative/reportService";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "report-narrative:write", 48);
  if (!rateLimit.ok) return rateLimitResponse(rateLimit.resetAt);
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 64_000) return NextResponse.json({ error: "报告内容过长" }, { status: 413 });
    const input = reportNarrativeRequestSchema.parse(await request.json());
    return NextResponse.json(await resolveReportNarrative(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message.slice(0, 240) : "报告内容格式不正确" },
      { status: 400 },
    );
  }
}
