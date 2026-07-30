import type { LucideIcon } from "lucide-react";

export type MobileProfile = {
  id?: string;
  name: string;
  gender: "male" | "female" | "other";
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string;
  birthTimeKnown: boolean;
  isLeapMonth: boolean;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  birthPlaceResolution?: "catalog" | "coordinates" | "unknown";
  isDemo?: boolean;
  isLocalOnly?: boolean;
  completeness?: number;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: "local" | "pending" | "synced" | "error";
  cloudProfileId?: string;
};

export type ShareImageRecord = {
  id: string;
  profileId: string;
  type: SharePosterData["category"];
  sourceId: string;
  title: string;
  width: 1080;
  height: 1920;
  delivery: "generated" | "saved" | "shared";
  createdAt: string;
  syncedAt?: string;
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
  category: "personality" | "daily" | "zodiac" | "ziwei" | "question";
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
  context: "home" | "bazi" | "zodiac" | "ziwei" | "compatibility";
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
