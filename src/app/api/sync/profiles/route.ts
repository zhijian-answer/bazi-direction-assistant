import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildValidatedBaziChart } from "@/lib/bazi-server";
import { appLimits, trimToLimit } from "@/lib/limits";
import { profileSignature } from "@/lib/market-data";
import { addProfileWithLimit, newId, readDb, replaceProfile, upsertSyncState } from "@/lib/store";
import type { BirthProfile, CalendarType, Gender, SyncState } from "@/lib/types";

function optionalCoordinate(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const db = await readDb();
  return NextResponse.json({
    profiles: db.profiles.filter((item) => item.userId === user.id),
    syncStates: db.syncStates.filter((item) => item.userId === user.id),
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "请先登录后同步" }, { status: 401 });
    const body = await request.json();
    const input = body.profile || body;
    const resolution = String(body.resolution || "");
    const localProfileId = String(input.id || body.localProfileId || "").trim().slice(0, 80);
    const birthDate = String(input.birthDate || "");
    const birthTime = String(input.birthTime || "12:00");
    const birthPlace = trimToLimit(String(input.birthPlace || ""), appLimits.maxBirthPlaceChars);
    const name = trimToLimit(String(input.name || user.name || "我的档案"), appLimits.maxProfileNameChars);
    const calendarType = (input.calendarType === "lunar" ? "lunar" : "solar") as CalendarType;
    const gender = (["male", "female", "other"].includes(input.gender) ? input.gender : "other") as Gender;
    const timeUnknown = input.birthTimeKnown === false || Boolean(input.timeUnknown);
    const isLeapMonth = calendarType === "lunar" && Boolean(input.isLeapMonth);
    if (!localProfileId || !birthDate) {
      return NextResponse.json({ error: "本地档案缺少标识或出生日期" }, { status: 400 });
    }

    const draft: BirthProfile = {
      id: "pending",
      userId: user.id,
      name,
      gender,
      calendarType,
      isLeapMonth,
      birthDate,
      birthTime,
      birthPlace,
      latitude: optionalCoordinate(input.latitude),
      longitude: optionalCoordinate(input.longitude),
      timezone: String(input.timezone || "Asia/Shanghai"),
      timeUnknown,
      createdAt: String(input.createdAt || new Date().toISOString()),
      chart: buildValidatedBaziChart({ calendarType, birthDate, birthTime, timeUnknown, isLeapMonth, gender }),
    };

    const db = await readDb();
    const existingState = db.syncStates.find((item) => item.userId === user.id && item.localProfileId === localProfileId);
    const mappedProfile = existingState
      ? db.profiles.find((item) => item.userId === user.id && item.id === existingState.cloudProfileId)
      : undefined;

    if (mappedProfile) {
      if (profileSignature(mappedProfile) !== profileSignature(draft)) {
        if (resolution === "keep-cloud") {
          const synced = await saveSyncState(user.id, localProfileId, mappedProfile.id);
          return NextResponse.json({ profile: mappedProfile, syncState: synced, resolution });
        }
        if (resolution === "keep-local") {
          const replacement: BirthProfile = { ...draft, id: mappedProfile.id, createdAt: mappedProfile.createdAt };
          await replaceProfile(replacement);
          const synced = await saveSyncState(user.id, localProfileId, mappedProfile.id);
          return NextResponse.json({ profile: replacement, syncState: synced, resolution });
        }
        const conflict: SyncState = {
          userId: user.id,
          localProfileId,
          cloudProfileId: mappedProfile.id,
          status: "conflict",
          lastSyncedAt: new Date().toISOString(),
          error: "本地档案与云端档案都发生了变化，请选择保留版本。",
        };
        await upsertSyncState(conflict);
        return NextResponse.json({ error: conflict.error, conflict: { local: input, cloud: mappedProfile }, syncState: conflict }, { status: 409 });
      }
      const synced = await saveSyncState(user.id, localProfileId, mappedProfile.id);
      return NextResponse.json({ profile: mappedProfile, syncState: synced, reused: true });
    }

    const duplicate = db.profiles.find((item) => item.userId === user.id && profileSignature(item) === profileSignature(draft));
    if (duplicate) {
      const synced = await saveSyncState(user.id, localProfileId, duplicate.id);
      return NextResponse.json({ profile: duplicate, syncState: synced, reused: true });
    }

    const profile = { ...draft, id: newId("profile") };
    await addProfileWithLimit(profile, appLimits.maxProfilesPerUser);
    const synced = await saveSyncState(user.id, localProfileId, profile.id);
    return NextResponse.json({ profile, syncState: synced, reused: false }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "同步档案失败" }, { status: 400 });
  }
}

async function saveSyncState(userId: string, localProfileId: string, cloudProfileId: string) {
  return upsertSyncState({
    userId,
    localProfileId,
    cloudProfileId,
    status: "synced",
    lastSyncedAt: new Date().toISOString(),
  });
}
