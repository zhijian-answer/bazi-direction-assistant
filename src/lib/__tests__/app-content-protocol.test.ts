import { describe, expect, it } from "vitest";
import {
  buildChatAppContentBrief,
  buildNarrativeAppContentBrief,
  buildReportAppContentBrief,
  renderAppContentSystemPrompt,
} from "../narrative/appContentProtocol";
import { inspectGeneratedMobileChat } from "../mobile/chatAiSchema";
import { inspectNarrativeContext } from "../narrative/quality";
import { inspectReportContextNarrative } from "../narrative/reportQuality";

describe("app content protocol", () => {
  it("assigns different identities to every report context", () => {
    const daily = buildReportAppContentBrief({
      context: "daily",
      reportKey: "daily-1",
      facts: [{ label: "当天依据", value: "甲子日" }],
      fallback: {
        title: "今天先完成一件事",
        summary: "把优先级收回来。",
        action: "先完成一件小事。",
        shareLine: "先完成，再继续。",
        questions: ["今天先做什么？"],
        sections: [{ id: "work", title: "工作上", body: "先收尾。" }],
      },
    });
    const bazi = buildNarrativeAppContentBrief({
      context: "bazi",
      slot: "hero",
      signals: [],
      facts: [{ label: "日主", value: "甲木" }],
      fallback: {
        hook: "先看清自己的节奏",
        scene: "做事有明确反馈时，你更容易进入状态。",
        evidenceSummary: "甲木日主",
        action: "今天先确认一件事的完成标准。",
        nextQuestion: "什么环境更适合我？",
      },
    });

    expect(daily.identity).toBe("每日指引内容编辑");
    expect(bazi.identity).toBe("生辰自我理解卡片编辑");
    expect(renderAppContentSystemPrompt(daily)).toContain("首页今日观察");
    expect(renderAppContentSystemPrompt(bazi)).toContain("生辰报告首屏");
  });

  it("assigns topic-specific identities to chat answers", () => {
    expect(buildChatAppContentBrief("relationship").identity).toBe("关系困惑问答编辑");
    expect(buildChatAppContentBrief("career").identity).toBe("工作选择问答编辑");
    expect(buildChatAppContentBrief("wealth").boundaries).toContain("不能推荐具体投资产品");
    expect(buildChatAppContentBrief("emotion").boundaries).toContain("不能诊断");
  });

  it("rejects content from the wrong divination system", () => {
    const card = {
      hook: "你的上升星座让你显得慢热",
      scene: "刚认识时，你更愿意先观察再回应。",
      evidenceSummary: "甲木日主",
      action: "今天先说清一件事。",
      nextQuestion: "什么环境更适合我？",
    };
    expect(inspectNarrativeContext(card, "bazi")).toContain("文案混入了当前页面之外的命理体系");
  });

  it("rejects long-term claims in daily and flow reports", () => {
    const bundle = {
      title: "你一生都更适合等待",
      summary: "今天先别着急。",
      action: "先完成一件小事。",
      shareLine: "慢一点也没关系。",
      questions: ["今天先做什么？"],
      sections: [{ id: "work", title: "工作上", body: "先收尾。" }],
    };
    expect(inspectReportContextNarrative(bundle, "daily")).toContain("短期内容被写成了长期人格或人生定论");
  });

  it("rejects category violations in chat copy", () => {
    const copy = {
      title: "这次可以直接买入",
      summary: "这个机会稳赚，可以现在行动。",
      observations: ["价格最近有变化", "你手里还有预算"],
      action: "今天直接买入。",
      suggestions: ["还要买多少？", "什么时候卖出？"],
    };
    expect(inspectGeneratedMobileChat(copy, "wealth")).toContain("财富回答包含投资指令或收益承诺");
  });
});

