import { NextResponse } from "next/server";
import { buildActionCard } from "@/lib/action-card";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

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

  const db = await readDb();
  const profile = db.profiles.find((item) => item.id === profileId && item.userId === user.id);
  if (!profile) {
    return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });
  }

  return NextResponse.json({ card: buildActionCard(profile) });
}
