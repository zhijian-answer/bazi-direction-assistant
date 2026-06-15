import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appLimits, trimToLimit } from "@/lib/limits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { newId, readDb, upsertActionCheckin } from "@/lib/store";
import type { ActionCheckin } from "@/lib/types";

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId") || "";
  const db = await readDb();
  const profileIds = new Set(db.profiles.filter((profile) => profile.userId === user.id).map((profile) => profile.id));
  const checkins = db.checkins
    .filter((checkin) => checkin.userId === user.id)
    .filter((checkin) => !profileId || checkin.profileId === profileId)
    .filter((checkin) => profileIds.has(checkin.profileId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json({
    checkins: checkins.slice(0, 30),
    today: checkins.find((checkin) => checkin.date === todayText()) || null,
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
      `checkin:write:${user.id}`,
      appLimits.rateLimitCheckinWrite,
    );
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const db = await readDb();
    const profile = db.profiles.find(
      (item) => item.id === body.profileId && item.userId === user.id,
    );
    if (!profile) {
      return NextResponse.json({ error: "请先创建命盘档案" }, { status: 400 });
    }

    const action = trimToLimit(String(body.action || ""), appLimits.maxCheckinActionChars);
    const note = trimToLimit(String(body.note || ""), appLimits.maxCheckinNoteChars);
    if (action.length < 2) {
      return NextResponse.json({ error: "请写下今天完成的一小步" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const date = todayText();
    const existing = db.checkins.find(
      (checkin) =>
        checkin.userId === user.id &&
        checkin.profileId === profile.id &&
        checkin.date === date,
    );

    const record: ActionCheckin = {
      id: existing?.id || newId("checkin"),
      userId: user.id,
      profileId: profile.id,
      date,
      action,
      note,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    const checkin = await upsertActionCheckin(record);
    return NextResponse.json({ checkin });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存打卡失败" },
      { status: 400 },
    );
  }
}
