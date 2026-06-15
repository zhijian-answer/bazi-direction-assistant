import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildActionCard } from "@/lib/action-card";
import { buildDailyGuidance } from "@/lib/daily";
import { buildYearForecast } from "@/lib/forecast";
import { buildBirthReport } from "@/lib/report";
import { readDb } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const db = await readDb();
  const now = new Date();
  const profiles = db.profiles.filter((profile) => profile.userId === user.id);
  const questions = db.questions
    .filter((question) => question.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const checkins = db.checkins
    .filter((checkin) => checkin.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));

  const payload = {
    exportedAt: now.toISOString(),
    app: "bazi-direction-assistant",
    scope: "current-user",
    user,
    profiles,
    questions,
    checkins,
    generated: profiles.map((profile) => ({
      profileId: profile.id,
      dailyGuidance: buildDailyGuidance(profile, now),
      actionCard: buildActionCard(profile, now),
      report: buildBirthReport(profile),
      forecast: buildYearForecast(profile, now.getFullYear(), now.getMonth() + 1),
    })),
    notes: [
      "此文件只包含当前登录用户的数据。",
      "导出内容不包含密码相关字段、登录凭证或其他用户资料。",
      "报告、流年和行动卡为导出时根据命盘即时生成的参考内容，打卡记录为用户主动保存的行动记录。",
    ],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="bazi-my-data-${now.toISOString().slice(0, 10)}.json"`,
    },
  });
}
