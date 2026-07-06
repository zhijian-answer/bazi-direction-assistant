import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { contentRuleTypes, isRecord, serializedSize } from "@/lib/market-data";
import { newId, readDb, upsertContentRule } from "@/lib/store";
import type { ContentRule } from "@/lib/types";

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  const db = await readDb();
  const rules = db.contentRules.filter((item) => item.status === "active" && (!type || item.type === type));
  return NextResponse.json({ rules });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) return NextResponse.json({ error: user ? "没有后台权限" : "请先登录" }, { status: user ? 403 : 401 });
    const body = await request.json();
    const type = String(body.type || "") as ContentRule["type"];
    const status = String(body.status || "draft") as ContentRule["status"];
    if (!contentRuleTypes.has(type) || !["draft", "active", "archived"].includes(status) || !isRecord(body.content) || serializedSize(body.content) > 100_000) {
      return NextResponse.json({ error: "内容规则格式不正确或超过 100KB" }, { status: 400 });
    }
    const rule: ContentRule = {
      id: String(body.id || newId("rule")).slice(0, 80),
      type,
      version: String(body.version || "v1").slice(0, 40),
      status,
      content: body.content,
      updatedAt: new Date().toISOString(),
    };
    await upsertContentRule(rule);
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存内容规则失败" }, { status: 400 });
  }
}
