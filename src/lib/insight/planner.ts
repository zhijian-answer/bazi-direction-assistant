import type { InsightEstimate, InsightExecutionStage, InsightSystem, InsightTopic } from "./contracts";

export type InsightDepth = "quick" | "standard" | "deep";

export type InsightTelemetrySample = {
  durationMs: number;
  credits: number;
  succeeded: boolean;
};

export type InsightPlanInput = {
  topic: InsightTopic;
  depth: InsightDepth;
  birthTimeKnown: boolean;
  genderKnown: boolean;
  eventTimeKnown: boolean;
  eventLocationKnown: boolean;
  telemetry?: InsightTelemetrySample[];
};

export type InsightPlan = {
  systems: InsightSystem[];
  stages: InsightExecutionStage[];
  estimate: InsightEstimate;
  limitations: string[];
};

const systemLabels: Record<InsightSystem, string> = {
  bazi: "查看生辰中的长期节奏",
  ziwei: "查看紫微中的人生领域",
  qimen: "查看此时此地的行动信号",
};

function selectSystems(input: InsightPlanInput): InsightSystem[] {
  const systems: InsightSystem[] = ["bazi"];
  if (input.birthTimeKnown && input.genderKnown && input.depth !== "quick") systems.push("ziwei");

  const qimenIsRelevant = input.topic === "timing" || input.topic === "decision";
  if (qimenIsRelevant && input.depth === "deep" && input.eventTimeKnown && input.eventLocationKnown) systems.push("qimen");
  return systems;
}

function buildEstimate(stages: InsightExecutionStage[], samples: InsightTelemetrySample[] = []): InsightEstimate {
  const successful = samples.filter((sample) => sample.succeeded && sample.durationMs > 0 && sample.credits >= 0);
  if (!successful.length) {
    return {
      stageCount: stages.length,
      durationLabel: "首次运行，完成后建立耗时参考",
      creditLabel: "开始前显示上限，运行后显示实际消耗",
      basedOnSamples: 0,
      hardStageLimit: 8,
    };
  }

  const durations = successful.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const credits = successful.map((sample) => sample.credits).sort((a, b) => a - b);
  const medianDuration = durations[Math.floor(durations.length / 2)];
  const p95Credits = credits[Math.min(credits.length - 1, Math.floor(credits.length * 0.95))];

  return {
    stageCount: stages.length,
    durationLabel: `近期同类分析通常约 ${Math.max(1, Math.ceil(medianDuration / 1000))} 秒`,
    creditLabel: `预计不超过 ${p95Credits} 点，超出前再次确认`,
    basedOnSamples: successful.length,
    hardStageLimit: 8,
  };
}

export function buildInsightPlan(input: InsightPlanInput): InsightPlan {
  const systems = selectSystems(input);
  const limitations: string[] = [];

  if (!input.birthTimeKnown) limitations.push("出生时辰未知，无法使用时柱、完整紫微宫位等依赖时辰的依据。只展示仍可稳定计算的部分。代替方案：补充准确时辰后重新生成完整报告。");
  if (!input.genderKnown) limitations.push("排运所需性别未明确，本次不使用依赖顺逆排运的内容。只展示不依赖该字段的分析。代替方案：补充性别信息后重新生成相关阶段报告。");
  if ((input.topic === "timing" || input.topic === "decision") && input.depth === "deep") {
    if (!input.eventTimeKnown) limitations.push("没有明确问题发生时间，本次不启用奇门。可补充准备做决定的具体时间。代替方案：使用八字与紫微的长期趋势作参考。");
    if (!input.eventLocationKnown) limitations.push("没有明确问题地点，本次不启用奇门。可补充当前所在城市。代替方案：使用不依赖地点的生辰与紫微信息。");
  }

  const stages: InsightExecutionStage[] = [
    { id: "scope", label: "确认问题范围与资料边界", systems: [], required: true },
    ...systems.map((system) => ({ id: `evidence:${system}`, label: systemLabels[system], systems: [system], required: true })),
    { id: "merge", label: "合并重复依据并标出不同信号", systems, required: true },
    { id: "actions", label: "整理成现在可以执行的小步骤", systems, required: true },
  ].slice(0, 8);

  return {
    systems,
    stages,
    estimate: buildEstimate(stages, input.telemetry),
    limitations,
  };
}
