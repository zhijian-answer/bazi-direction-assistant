import type { InsightPlan } from "./planner";
import type { QimenEngineAdapter, QimenEngineInput } from "./contracts";

export type QimenShadowRecord = {
  status: "skipped" | "calculated" | "failed";
  visibleToUser: false;
  reason: string;
  inputHash?: string;
  outputHash?: string;
  durationMs: number;
  warnings: string[];
};

function stableHash(value: unknown) {
  const serialized = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export async function runQimenShadow(input: {
  plan: InsightPlan;
  qimenInput?: QimenEngineInput;
  adapter?: QimenEngineAdapter;
}): Promise<QimenShadowRecord> {
  const startedAt = Date.now();
  const base = { visibleToUser: false as const, durationMs: 0, warnings: [] as string[] };

  if (!input.plan.systems.includes("qimen")) {
    return {
      ...base,
      status: "skipped",
      reason: input.plan.limitations.find((item) => item.includes("奇门")) || "当前问题不需要奇门依据。",
      durationMs: Date.now() - startedAt,
    };
  }
  if (!input.qimenInput) {
    return { ...base, status: "skipped", reason: "缺少起局时间或地点，未运行奇门影子计算。", durationMs: Date.now() - startedAt };
  }
  if (!input.adapter) {
    return { ...base, status: "skipped", reason: "奇门候选引擎尚未通过上线校验。", durationMs: Date.now() - startedAt };
  }

  const inputHash = stableHash(input.qimenInput);
  try {
    const output = await input.adapter.calculate(input.qimenInput);
    return {
      status: "calculated",
      visibleToUser: false,
      reason: "影子计算已完成，仅用于引擎校验，不进入用户报告。",
      inputHash,
      outputHash: stableHash(output.chart),
      durationMs: Date.now() - startedAt,
      warnings: output.warnings,
    };
  } catch (error) {
    return {
      status: "failed",
      visibleToUser: false,
      reason: error instanceof Error ? error.message : "奇门影子计算失败。",
      inputHash,
      durationMs: Date.now() - startedAt,
      warnings: [],
    };
  }
}
