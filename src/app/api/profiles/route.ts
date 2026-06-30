import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildBaziChart } from "@/lib/bazi";
import { appLimits, trimToLimit } from "@/lib/limits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { addProfileWithLimit, deleteProfileData, newId, readDb } from "@/lib/store";
import type { BirthProfile, CalendarType, Gender } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const db = await readDb();
  return NextResponse.json({
    profiles: db.profiles.filter((profile) => profile.userId === user.id),
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const rateLimit = checkRateLimit(
      request,
      `profile:write:${user.id}`,
      appLimits.rateLimitProfileWrite,
    );
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const birthDate = String(body.birthDate || "");
    const birthTime = String(body.birthTime || "12:00");
    const name = trimToLimit(String(body.name || user.name || "我的命盘"), appLimits.maxProfileNameChars);
    const birthPlace = trimToLimit(String(body.birthPlace || ""), appLimits.maxBirthPlaceChars);
    const calendarType = (body.calendarType === "lunar" ? "lunar" : "solar") as CalendarType;
    const isLeapMonth = calendarType === "lunar" && Boolean(body.isLeapMonth);
    const timezone = String(body.timezone || "Asia/Shanghai");
    const gender = (["male", "female", "other"].includes(body.gender)
      ? body.gender
      : "other") as Gender;
    if (!birthDate || !birthPlace) {
      return NextResponse.json({ error: "请填写出生日期和出生地点" }, { status: 400 });
    }
    const profile: BirthProfile = {
      id: newId("profile"),
      userId: user.id,
      name,
      gender,
      calendarType,
      isLeapMonth,
      birthDate,
      birthTime,
      birthPlace,
      timezone,
      timeUnknown: Boolean(body.timeUnknown),
      createdAt: new Date().toISOString(),
      chart: buildBaziChart({
        calendarType,
        birthDate,
        birthTime,
        timeUnknown: Boolean(body.timeUnknown),
        isLeapMonth,
        gender,
      }),
    };
    await addProfileWithLimit(profile, appLimits.maxProfilesPerUser);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存命盘失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const rateLimit = checkRateLimit(
      request,
      `profile:delete:${user.id}`,
      appLimits.rateLimitProfileWrite,
    );
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const url = new URL(request.url);
    const profileId = url.searchParams.get("profileId") || "";
    if (!profileId) {
      return NextResponse.json({ error: "缺少命盘档案 ID" }, { status: 400 });
    }

    const deleted = await deleteProfileData({ userId: user.id, profileId });
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除命盘失败" },
      { status: 400 },
    );
  }
}
