import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isRecord, reportTypes, serializedSize, stableHash } from "@/lib/market-data";
import { buildBirthReport } from "@/lib/report";
import { addStoredReport, newId, readDb } from "@/lib/store";
import type { ReportType, StoredReport } from "@/lib/types";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId");
  const db = await readDb();
  if (!profileId) {
    return NextResponse.json({ reports: db.reports.filter((item) => item.userId === user.id).slice(0, 50) });
  }

  const profile = db.profiles.find((item) => item.id === profileId && item.userId === user.id);
  if (!profile) {
    return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });
  }

  const type = (url.searchParams.get("type") || "bazi") as ReportType;
  if (!reportTypes.has(type)) {
    return NextResponse.json({ error: "不支持的报告类型" }, { status: 400 });
  }
  if (url.searchParams.get("history") === "1") {
    return NextResponse.json({ reports: db.reports.filter((item) => item.userId === user.id && item.profileId === profileId && item.type === type).slice(0, 30) });
  }
  if (type !== "bazi") {
    const latest = db.reports.find((item) => item.userId === user.id && item.profileId === profileId && item.type === type);
    return latest
      ? NextResponse.json({ report: latest.content, storedReport: latest })
      : NextResponse.json({ error: "这份报告还没有生成" }, { status: 404 });
  }

  return NextResponse.json({ report: buildBirthReport(profile) });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const body = await request.json();
    const profileId = String(body.profileId || "");
    const type = String(body.type || "bazi") as ReportType;
    if (!profileId || !reportTypes.has(type)) {
      return NextResponse.json({ error: "报告档案或类型不正确" }, { status: 400 });
    }

    const db = await readDb();
    const profile = db.profiles.find((item) => item.id === profileId && item.userId === user.id);
    if (!profile) return NextResponse.json({ error: "命盘档案不存在" }, { status: 404 });

    const content = type === "bazi" ? buildBirthReport(profile) : body.content;
    if (!isRecord(content) || serializedSize(content) > 100_000) {
      return NextResponse.json({ error: "报告内容为空或超过 100KB" }, { status: 400 });
    }

    const stored: StoredReport = {
      id: newId("report"),
      userId: user.id,
      profileId,
      type,
      status: "ready",
      inputHash: stableHash({ profile: profileSignatureInput(profile), type, content }),
      engineVersion: engineVersion(type, profile.chart.engine?.primary),
      ruleVersion: String(body.ruleVersion || "market-v1").slice(0, 40),
      content,
      createdAt: new Date().toISOString(),
    };
    const saved = await addStoredReport(stored);
    return NextResponse.json({ report: saved }, { status: saved.id === stored.id ? 201 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存报告失败" }, { status: 400 });
  }
}

function profileSignatureInput(profile: { birthDate: string; birthTime: string; birthPlace: string; calendarType: string; timeUnknown: boolean }) {
  return { birthDate: profile.birthDate, birthTime: profile.timeUnknown ? "unknown" : profile.birthTime, birthPlace: profile.birthPlace, calendarType: profile.calendarType };
}

function engineVersion(type: ReportType, baziEngine?: string) {
  if (type === "bazi") return `${baziEngine || "lunar-javascript"}-v1`;
  if (type === "ziwei") return "iztro-2.5.8";
  return `xuanshu-${type}-v1`;
}
