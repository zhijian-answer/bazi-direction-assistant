export type RelationshipBand = {
  label: "连接较顺" | "有连接，也有差异" | "需要主动翻译彼此" | "需要更多现实确认";
  note: string;
};

export function getRelationshipBand(score: number): RelationshipBand {
  if (score >= 75) return { label: "连接较顺", note: "有较多可以直接复用的相处经验" };
  if (score >= 60) return { label: "有连接，也有差异", note: "重要处需要把期待说清楚" };
  if (score >= 45) return { label: "需要主动翻译彼此", note: "少猜动机，多确认事实和需要" };
  return { label: "需要更多现实确认", note: "先观察持续回应，不急着下结论" };
}
