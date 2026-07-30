export type NarrativeContext = "bazi" | "zodiac" | "ziwei" | "compatibility" | "flow";

export type NarrativeFact = {
  label: string;
  value: string;
};

export type NarrativeCard = {
  hook: string;
  scene: string;
  misunderstanding?: string;
  evidenceSummary: string;
  action: string;
  nextQuestion: string;
};

export type NarrativeRequest = {
  context: NarrativeContext;
  slot: "hero" | "daily" | "relationship" | "career" | "stage";
  signals: string[];
  facts: NarrativeFact[];
  fallback: NarrativeCard;
  promptVersion?: string;
};

export type NarrativeResponse = {
  card: NarrativeCard;
  source: "catalog" | "api" | "fallback";
  provider?: string;
  model?: string;
  promptVersion: string;
  issues: string[];
};
