import type { LucideIcon } from "lucide-react";

export type MobileProfile = {
  name: string;
  gender: "male" | "female" | "other";
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
};

export type ElementDatum = {
  key: "wood" | "fire" | "earth" | "metal" | "water";
  label: string;
  value: number;
  color: string;
  meaning: string;
};

export type InsightCardData = {
  id: string;
  title: string;
  highlight: string;
  term: string;
  summary: string;
  detail: string;
};

export type FeatureTileData = {
  eyebrow?: string;
  title: string;
  value: string;
  note: string;
  highlight?: string;
};

export type ShareInsightData = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
  tone: "ink" | "warm" | "sage" | "sky" | "violet" | "coral";
};

export type PosterTone = "ink" | "warm" | "sage" | "sky" | "violet" | "coral";

export type SharePosterData = {
  id: string;
  category: "personality" | "daily" | "zodiac" | "question";
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  footer: string;
  tone: PosterTone;
};

export type DailyInsightData = {
  id: string;
  keyword: string;
  title: string;
  summary: string;
  suitable: string;
  avoid: string;
  action: string;
  tags: string[];
};

export type QuestionInsightData = {
  id: string;
  context: "home" | "bazi" | "zodiac";
  prompt: string;
  shortLabel: string;
  source: string;
  interpretation: string;
  observation: string;
  action: string;
  tone: PosterTone;
};

export type MobileNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};
