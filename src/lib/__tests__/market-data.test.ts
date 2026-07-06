import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { contentRuleTypes, profileSignature, reportTypes, shareImageTypes, stableHash } from "../market-data";
import type { ContentRule, StoredReport, StoredShareImage, SyncState } from "../types";

let dataDir = "";
let store: typeof import("../store");

beforeAll(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), "xuanshu-market-"));
  process.env.APP_DATA_DIR = dataDir;
  store = await import("../store");
});

afterAll(async () => {
  delete process.env.APP_DATA_DIR;
  await rm(dataDir, { recursive: true, force: true });
});

describe("market data contracts", () => {
  it("keeps supported market types explicit", () => {
    expect([...reportTypes]).toEqual(["bazi", "zodiac", "ziwei", "liupan"]);
    expect(shareImageTypes.has("daily")).toBe(true);
    expect(contentRuleTypes.has("onboarding")).toBe(true);
  });

  it("creates stable hashes and ignores unknown birth time text", () => {
    expect(stableHash({ a: 1 })).toBe(stableHash({ a: 1 }));
    const base = { name: "测试", gender: "female" as const, calendarType: "solar" as const, birthDate: "1990-06-18", birthPlace: "广州", timeUnknown: true };
    expect(profileSignature({ ...base, birthTime: "09:30" })).toBe(profileSignature({ ...base, birthTime: "12:00" }));
  });

  it("persists reports, share records, rules and sync states", async () => {
    const report: StoredReport = { id: "report_1", userId: "user_1", profileId: "profile_1", type: "bazi", status: "ready", inputHash: "hash", engineVersion: "engine", ruleVersion: "v1", content: { title: "报告" }, createdAt: new Date().toISOString() };
    const image: StoredShareImage = { id: "share_1", userId: "user_1", profileId: "profile_1", type: "daily", sourceId: "poster_1", title: "今日提醒", createdAt: new Date().toISOString() };
    const rule: ContentRule = { id: "rule_1", type: "daily", version: "v1", status: "active", content: { enabled: true }, updatedAt: new Date().toISOString() };
    const sync: SyncState = { userId: "user_1", localProfileId: "local_1", cloudProfileId: "profile_1", status: "synced", lastSyncedAt: new Date().toISOString() };
    await store.addStoredReport(report);
    await store.addStoredShareImage(image);
    await store.upsertContentRule(rule);
    await store.upsertSyncState(sync);
    const db = await store.readDb();
    expect(db.reports[0]).toEqual(report);
    expect(db.shareImages[0]).toEqual(image);
    expect(db.contentRules[0]).toEqual(rule);
    expect(db.syncStates[0]).toEqual(sync);
  });
});
