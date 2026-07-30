import type { DailyInsightData } from "./types";

export type HomeCoverTitle = {
  lead: string;
  detail: string;
  emphasis: string;
};

function splitCoverTitle(title: string): HomeCoverTitle {
  const punctuationIndex = title.search(/[，；：]/);
  if (punctuationIndex > 1 && punctuationIndex < title.length - 2) {
    const secondLine = title.slice(punctuationIndex + 1);
    const emphasisLength = secondLine.length >= 7 ? 4 : Math.max(2, Math.ceil(secondLine.length / 3));
    return {
      lead: title.slice(0, punctuationIndex + 1),
      detail: secondLine.slice(0, -emphasisLength),
      emphasis: secondLine.slice(-emphasisLength),
    };
  }

  return { lead: title, detail: "", emphasis: "" };
}

export function buildHomeCoverTitle(insight: DailyInsightData): HomeCoverTitle {
  const coverTitleById: Record<string, HomeCoverTitle> = {
    clarify: { lead: "今天不必急着推进，", detail: "先把最重要的事", emphasis: "说清楚" },
    respond: { lead: "今天别让想法停在心里，", detail: "先把关键的话", emphasis: "说出来" },
    steady: { lead: "今天不必开启太多，", detail: "先守住已有", emphasis: "节奏" },
    recover: { lead: "今天不用勉强加速，", detail: "先把注意力", emphasis: "收回来" },
    observe: { lead: "今天先别急着定义，", detail: "看清对方真正", emphasis: "做了什么" },
  };
  const coverTitleByTitle: Record<string, HomeCoverTitle> = {
    "同频力量变强，更适合把主线做完整": { lead: "今天先别分散精力，", detail: "把一条主线", emphasis: "做完整" },
    "外部支持更明显，先接住已有资源": { lead: "今天不用独自硬扛，", detail: "先接住", emphasis: "已有资源" },
    "表达与输出增加，也要守住完成边界": { lead: "今天可以多表达，", detail: "但要守住", emphasis: "完成边界" },
    "取舍任务比继续加码更重要": { lead: "今天不是继续加码，", detail: "而是先把", emphasis: "边界定清" },
    "外部要求变多，先降低并行任务": { lead: "今天先别硬接太多，", detail: "把并行任务", emphasis: "降下来" },
  };

  return coverTitleById[insight.id] ?? coverTitleByTitle[insight.title] ?? splitCoverTitle(insight.title);
}
