import type { NormalizedZiweiInsight, RawZiweiChart, ZiweiEngineInfo } from "./contracts";
import { getDomainRule, getIdentityRule, relationshipMutagenCopy } from "./interpretationRules";

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function normalizeZiwei(chart: RawZiweiChart, engine: ZiweiEngineInfo): NormalizedZiweiInsight {
  const soulPalace = chart.palaces.find((palace) => palace.name === "命宫");
  const bodyPalace = chart.palaces.find((palace) => palace.isBodyPalace);
  const relationshipPalace = chart.palaces.find((palace) => palace.name === "夫妻");
  const dailyPalace = chart.palaces[chart.horoscope.daily.index] || soulPalace;
  const decadalPalace = chart.palaces[chart.horoscope.decadal.index] || soulPalace;
  const identityStar = soulPalace?.majorStars[0]?.name;
  const identity = getIdentityRule(identityStar);
  const bodyDomain = getDomainRule(bodyPalace?.name);
  const dailyDomain = getDomainRule(dailyPalace?.name);
  const stageDomain = getDomainRule(decadalPalace?.name);
  const relationshipMutagens = unique([
    ...(relationshipPalace?.majorStars || []),
    ...(relationshipPalace?.minorStars || []),
  ].map((star) => star.mutagen));
  const allMutagens = unique(chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars].map((star) => star.mutagen)));
  const majorStars = unique([
    ...(soulPalace?.majorStars.map((star) => star.name) || []),
    ...(bodyPalace?.majorStars.map((star) => star.name) || []),
  ]);
  const stageRange = decadalPalace?.decadal.range;

  return {
    identity: {
      title: identity.title,
      summary: `${identity.summary} 这描述的是结构倾向，不是固定命运。`,
      tags: unique([...identity.tags, bodyDomain.keyword]),
    },
    environment: {
      stableZone: unique([identity.stable, bodyDomain.stable, "重要决定有真实反馈可以复盘"]),
      drainZone: unique([identity.drain, bodyDomain.drain, "把所有不确定都留给自己消化"]),
    },
    relationship: {
      summary: `${relationshipMutagenCopy(relationshipMutagens)} 这里提供的是观察角度，仍要结合真实互动判断。`,
      prompts: [
        "为什么我在关系里容易想得太多？",
        "什么样的回应会让我真正放松？",
        "现在更适合主动表达，还是先观察？",
      ],
    },
    today: {
      keyword: dailyDomain.keyword,
      summary: `${dailyDomain.today} 先做一个可以获得真实反馈的小动作，比一次解决所有问题更有效。`,
      doList: [dailyDomain.stable, "先处理一件能减少后续反复的事"],
      avoidList: [dailyDomain.drain, "在信息不足时做绝对判断"],
      action: dailyDomain.action,
    },
    stage: {
      rangeLabel: stageRange ? `${stageRange[0]}–${stageRange[1]} 岁` : "当前阶段",
      summary: `${stageDomain.stage} 这是一段阶段性观察，不代表每一年都会以同样方式发生。`,
    },
    evidence: {
      engine: engine.name,
      engineVersion: engine.version,
      license: engine.license,
      config: engine.config,
      mingGong: soulPalace ? `${soulPalace.earthlyBranch}宫` : undefined,
      shenGong: bodyPalace ? `${bodyPalace.name} · ${bodyPalace.earthlyBranch}宫` : undefined,
      majorStars,
      mutagens: allMutagens,
      rawFieldsUsed: [
        "palaces[name=命宫].majorStars",
        "palaces[isBodyPalace]",
        "palaces[name=夫妻].mutagen",
        "horoscope.daily.index",
        "horoscope.decadal.index",
      ],
      rulesApplied: [
        `identity:${identityStar || "fallback"}`,
        `body-domain:${bodyPalace?.name || "fallback"}`,
        `daily-domain:${dailyPalace?.name || "fallback"}`,
        `stage-domain:${decadalPalace?.name || "fallback"}`,
        `relationship-mutagen:${relationshipMutagens.join(",") || "none"}`,
      ],
    },
  };
}
