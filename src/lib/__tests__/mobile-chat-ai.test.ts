import { describe, expect, it } from "vitest";
import { generatedMobileChatSchema } from "../mobile/chatAiSchema";
import { buildMobileChatPromptPayload } from "../mobile/chatProvider";
import { applyGeneratedChatCopy } from "../mobile/chatService";
import { buildMobileChatAnswer } from "../mobile/chatEngine";
import type { MobileProfile } from "../mobile/types";

const profile: MobileProfile = {
  id: "ai-chat-fixture",
  name: "在线问答样本",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
  latitude: 23.1291,
  longitude: 113.2644,
  timezone: "Asia/Shanghai",
};

const generated = {
  title: "先看对方有没有持续回应",
  summary: "你现在卡住的，不只是要不要主动，而是不确定主动以后会不会再次失望。先把猜测放下，观察现实里的安排和回应。",
  observations: ["对方是否主动解释最近的变化", "对方是否愿意落实下一次见面的安排"],
  action: "只表达一次具体邀请，再根据真实回应决定下一步。",
  suggestions: ["什么样的回应值得我继续投入？", "我在关系里真正需要什么？"],
};

describe("mobile chat AI layer", () => {
  it("keeps calculated evidence while replacing only the presentation copy", async () => {
    const local = await buildMobileChatAnswer(profile, "我该主动联系他吗？", new Date("2026-07-15T04:00:00.000Z"));
    const merged = applyGeneratedChatCopy(local, generated, "deepseek", "deepseek-chat");

    expect(merged.title).toBe(generated.title);
    expect(merged.evidence).toEqual(local.evidence);
    expect(merged.evidenceTrace).toEqual(local.evidenceTrace);
    expect(merged.limitations).toEqual(local.limitations);
    expect(merged.delivery).toEqual({ source: "api", provider: "deepseek", model: "deepseek-chat" });
  });

  it("does not send raw birth data to the external model prompt", async () => {
    const local = await buildMobileChatAnswer(profile, "最近工作要不要换？", new Date("2026-07-15T04:00:00.000Z"));
    const payload = JSON.stringify(buildMobileChatPromptPayload({ profile, question: "最近工作要不要换？", history: [] }, local));

    expect(payload).not.toContain(profile.birthDate);
    expect(payload).not.toContain(profile.birthPlace);
    expect(payload).toContain("evidence");
  });

  it("rejects absolute predictions", () => {
    expect(() => generatedMobileChatSchema.parse({ ...generated, title: "你们一定会复合" })).toThrow();
  });
});
