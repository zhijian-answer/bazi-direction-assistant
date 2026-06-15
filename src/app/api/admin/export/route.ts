import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "当前账号没有后台权限" }, { status: 403 });
  }

  const url = new URL(request.url);
  const fullBackup = url.searchParams.get("mode") === "backup" && url.searchParams.get("confirm") === "full";
  const db = await readDb();
  const exportedAt = new Date().toISOString();

  const payload = fullBackup
    ? { exportedAt, mode: "backup", db }
    : {
        exportedAt,
        mode: "redacted",
        db: {
          users: db.users.map(({ passwordHash, salt, ...userRecord }) => ({
            ...userRecord,
            passwordHash: passwordHash ? "[redacted]" : "",
            salt: salt ? "[redacted]" : "",
          })),
          sessions: db.sessions.map((session) => ({ ...session, token: "[redacted]" })),
          profiles: db.profiles,
          questions: db.questions,
        },
      };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="bazi-export-${exportedAt.slice(0, 10)}.json"`,
    },
  });
}
