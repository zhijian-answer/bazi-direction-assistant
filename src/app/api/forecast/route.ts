import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildYearForecast } from "@/lib/forecast";
import { readDb } from "@/lib/store";

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");
  if (!profileId) {
    return NextResponse.json({ error: "缺少命盘档案" }, { status: 400 });
  }

  const now = new Date();
  const year = clampInt(url.searchParams.get("year"), now.getFullYear(), now.getFullYear() - 1, now.getFullYear() + 2);
  const month = clampInt(url.searchParams.get("month"), now.getMonth() + 1, 1, 12);

  const db = await readDb();
  const profile = db.profiles.find((item) => item.id === profileId && item.userId === user.id);
  if (!profile) {
    return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });
  }

  return NextResponse.json({ forecast: buildYearForecast(profile, year, month) });
}
