import type {
  ConsensusFinding,
  EvidenceClaim,
  EvidenceFactors,
  EvidenceLevel,
  FindingStatus,
} from "./contracts";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + clamp(value), 0) / values.length : 0;
}

function toLevel(value: number): EvidenceLevel {
  if (value >= 0.75) return "high";
  if (value >= 0.5) return "medium";
  return "limited";
}

function resolveStatus(claims: EvidenceClaim[]): FindingStatus {
  const directions = new Set(claims.map((claim) => claim.direction));
  const decisiveDirections = ["supports", "cautions"].filter((direction) => directions.has(direction as EvidenceClaim["direction"]));

  if (claims.length === 0) return "insufficient";
  if (decisiveDirections.length > 1) return "conflict";
  if (new Set(claims.map((claim) => claim.system)).size > 1 && decisiveDirections.length === 1) return "agreement";
  if (decisiveDirections.length === 1) return "partial";
  return "insufficient";
}

function agreementScore(status: FindingStatus) {
  if (status === "agreement") return 1;
  if (status === "partial") return 0.62;
  if (status === "conflict") return 0.3;
  return 0.15;
}

function buildFactors(claims: EvidenceClaim[], status: FindingStatus): EvidenceFactors {
  return {
    dataCompleteness: toLevel(average(claims.map((claim) => claim.dataCompleteness))),
    questionFit: toLevel(average(claims.map((claim) => claim.applicability))),
    crossSystemAgreement: toLevel(agreementScore(status)),
    evidenceSpecificity: toLevel(average(claims.map((claim) => claim.specificity))),
  };
}

function buildSummary(claims: EvidenceClaim[], status: FindingStatus) {
  const support = claims.find((claim) => claim.direction === "supports");
  const caution = claims.find((claim) => claim.direction === "cautions");
  const neutral = claims.find((claim) => claim.direction === "neutral");

  if (status === "conflict" && support && caution) {
    return `目前有两种不同信号：${support.statement}；同时，${caution.statement}。建议先做低成本验证，不把其中一条当成确定结论。`;
  }
  if (status === "agreement" && support) return support.statement;
  if (status === "agreement" && caution) return caution.statement;
  return support?.statement || caution?.statement || neutral?.statement || "现有资料还不足以形成稳定判断。";
}

export function synthesizeEvidence(claims: EvidenceClaim[]): ConsensusFinding[] {
  const groups = new Map<string, EvidenceClaim[]>();
  for (const claim of claims) {
    const key = `${claim.topic}:${claim.claimKey}`;
    groups.set(key, [...(groups.get(key) || []), claim]);
  }

  return [...groups.entries()].map(([groupKey, groupedClaims]) => {
    const status = resolveStatus(groupedClaims);
    const factors = buildFactors(groupedClaims, status);
    const internalScore =
      average(groupedClaims.map((claim) => claim.dataCompleteness)) * 0.3 +
      average(groupedClaims.map((claim) => claim.applicability)) * 0.3 +
      agreementScore(status) * 0.25 +
      average(groupedClaims.map((claim) => claim.specificity)) * 0.15;

    return {
      id: `finding:${groupKey}`,
      claimKey: groupedClaims[0].claimKey,
      topic: groupedClaims[0].topic,
      status,
      level: toLevel(internalScore),
      summary: buildSummary(groupedClaims, status),
      supportingClaimIds: groupedClaims.filter((claim) => claim.direction === "supports").map((claim) => claim.id),
      cautionClaimIds: groupedClaims.filter((claim) => claim.direction === "cautions").map((claim) => claim.id),
      neutralClaimIds: groupedClaims.filter((claim) => claim.direction === "neutral").map((claim) => claim.id),
      factors,
      limitations: [...new Set(groupedClaims.flatMap((claim) => claim.limitations))],
    } satisfies ConsensusFinding;
  });
}
