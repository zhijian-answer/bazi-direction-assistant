import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { shareImageTypes } from "@/lib/market-data";
import { addStoredShareImage, deleteStoredShareImage, newId, readDb } from "@/lib/store";
import type { StoredShareImage } from "@/lib/types";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const profileId = new URL(request.url).searchParams.get("profileId");
  const db = await readDb();
  const images = db.shareImages.filter((item) => item.userId === user.id && (!profileId || item.profileId === profileId)).slice(0, 100);
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
    const body = await request.json();
    const profileId = String(body.profileId || "");
    const type = String(body.type || "") as StoredShareImage["type"];
    const sourceId = String(body.sourceId || "").trim().slice(0, 80);
    const title = String(body.title || "").trim().slice(0, 120);
    const imageUrl = String(body.imageUrl || "").trim().slice(0, 2048);
    if (!profileId || !shareImageTypes.has(type) || !sourceId || !title) {
      return NextResponse.json({ error: "分享图记录不完整" }, { status: 400 });
    }
    const db = await readDb();
    if (!db.profiles.some((item) => item.id === profileId && item.userId === user.id)) {
      return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });
    }
    const image: StoredShareImage = {
      id: newId("share"), userId: user.id, profileId, type, sourceId, title,
      imageUrl: imageUrl && !imageUrl.startsWith("data:") ? imageUrl : undefined,
      createdAt: new Date().toISOString(), syncedAt: new Date().toISOString(),
    };
    await addStoredShareImage(image);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存分享记录失败" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const imageId = new URL(request.url).searchParams.get("imageId") || "";
  if (!imageId) return NextResponse.json({ error: "缺少分享记录 ID" }, { status: 400 });
  const deleted = await deleteStoredShareImage({ userId: user.id, imageId });
  return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "分享记录不存在" }, { status: 404 });
}
