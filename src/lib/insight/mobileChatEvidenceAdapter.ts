import type { MobileChatCategory, MobileChatEvidence } from "../mobile/chatEngine";
import type { EvidenceClaim, InsightSystem, InsightTopic } from "./contracts";

export type ExcludedChatEvidence = {
  system: MobileChatEvidence["system"];
  label: string;
  reason: string;
};

export type MobileChatEvidenceTrace = {
  claims: EvidenceClaim[];
  excluded: ExcludedChatEvidence[];
};

const topicMap: Record<MobileChatCategory, InsightTopic> = {
  self: "self",
  relationship: "relationship",
  career: "career",
  timing: "timing",
  emotion: "wellbeing",
  wealth: "wealth",
};

function insightSystem(system: MobileChatEvidence["system"]): InsightSystem | undefined {
  if (system === "生辰" || system === "流盘") return "bazi";
  if (system === "紫微") return "ziwei";
  return undefined;
}

function splitEngine(value: string) {
  const [name, version = "unknown"] = value.split("@").map((part) => part.trim());
  return {
    name: name || "unknown",
    version,
    ruleVersion: "mobile-chat-v1",
  };
}

function applicability(system: MobileChatEvidence["system"], category: MobileChatCategory) {
  if (system === "流盘") return category === "timing" ? 0.9 : 0.65;
  if (system === "紫微") return ["self", "relationship", "career"].includes(category) ? 0.82 : 0.7;
  return ["self", "relationship", "career"].includes(category) ? 0.82 : 0.72;
}

function dataCompleteness(evidence: MobileChatEvidence) {
  if (evidence.system === "生辰" && evidence.label.includes("三柱")) return 0.65;
  if (evidence.system === "流盘") return 0.78;
  return 0.9;
}

export function adaptMobileChatEvidence(
  evidence: MobileChatEvidence[],
  category: MobileChatCategory,
  limitations: string[],
): MobileChatEvidenceTrace {
  const claims: EvidenceClaim[] = [];
  const excluded: ExcludedChatEvidence[] = [];

  evidence.forEach((item, index) => {
    const system = insightSystem(item.system);
    if (!system) {
      excluded.push({
        system: item.system,
        label: item.label,
        reason: "星座依据保留在原问题解读中，尚未纳入八字、紫微、奇门三体系合参。",
      });
      return;
    }

    claims.push({
      id: `chat:${category}:${system}:${index + 1}`,
      claimKey: `${category}:observed-structure`,
      system,
      topic: topicMap[category],
      direction: "neutral",
      statement: item.value,
      basis: `${item.label}：${item.detail}`,
      engine: splitEngine(item.engine),
      applicability: applicability(item.system, category),
      dataCompleteness: dataCompleteness(item),
      sourceQuality: 0.75,
      specificity: item.detail.length >= 20 ? 0.76 : 0.62,
      limitations,
    });
  });

  return { claims, excluded };
}
