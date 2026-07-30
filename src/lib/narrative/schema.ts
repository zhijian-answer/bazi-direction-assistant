import { z } from "zod";

const shortText = z.string().trim().min(2).max(120);
const factValue = z.string().trim().min(1).max(120);

export const narrativeCardSchema = z.object({
  hook: z.string().trim().min(6).max(36),
  scene: z.string().trim().min(12).max(110),
  misunderstanding: z.string().trim().min(6).max(80).optional(),
  evidenceSummary: z.string().trim().min(4).max(100),
  action: z.string().trim().min(6).max(64),
  nextQuestion: z.string().trim().min(6).max(40),
});

export const narrativeRequestSchema = z.object({
  context: z.enum(["bazi", "zodiac", "ziwei", "compatibility", "flow"]),
  slot: z.enum(["hero", "daily", "relationship", "career", "stage"]),
  signals: z.array(z.string().trim().min(3).max(80)).max(12),
  facts: z.array(z.object({ label: shortText, value: factValue })).min(1).max(16),
  fallback: narrativeCardSchema,
  promptVersion: z.string().trim().min(1).max(40).optional(),
});

export const generatedNarrativeSchema = narrativeCardSchema.omit({ evidenceSummary: true });
