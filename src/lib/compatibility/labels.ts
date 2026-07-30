import type { RelationshipType } from "./types";

export const relationshipLabels: Record<RelationshipType, string> = {
  lover: "恋人",
  partner: "伴侣",
  ambiguous: "正在了解",
  friend: "朋友",
  family: "家人",
  colleague: "同事",
  other: "其他关系",
};

export const relationshipOptions = (Object.entries(relationshipLabels) as Array<[RelationshipType, string]>).map(([value, label]) => ({ value, label }));
