import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildShareCardSvg, type ShareCardType } from "@/lib/share-card";
import { readDb } from "@/lib/store";

const allowedTypes = new Set<ShareCardType>(["cover", "wuxing"]);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");
  const type = (url.searchParams.get("type") || "cover") as ShareCardType;

  if (!profileId) {
    return NextResponse.json({ error: "缺少命盘档案" }, { status: 400 });
  }
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "图片类型不支持" }, { status: 400 });
  }

  const db = await readDb();
  const profile = db.profiles.find((item) => item.id === profileId && item.userId === user.id);
  if (!profile) {
    return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });
  }

  return new NextResponse(buildShareCardSvg(profile, type), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": `inline; filename="${type}-${profile.id}.svg"`,
    },
  });
}
